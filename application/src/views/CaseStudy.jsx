import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { calculateCentroid } from "../utilities.ts";

// `date` maps each chapter to a key in study.timeline; `camera` frames that chapter.
const chapters = [
  { key: "intro", label: "Overview", color: 0x5a6b8a, camera: [0, 12, 12] },
  {
    key: "leadUp",
    label: "Lead-up",
    date: "start",
    color: 0x4f8a3c,
    camera: [0, 8, 9],
  },
  {
    key: "event",
    label: "Event",
    date: "event",
    color: 0xc0502e,
    camera: [5, 5, 6],
  },
  {
    key: "takeaway",
    label: "Takeaway",
    date: "end",
    color: 0x8a7a4f,
    camera: [-6, 9, 7],
  },
];
const steps = chapters.slice(1);
const FLY_SECONDS = 1.2;
const ease = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const TILE_URL = import.meta.env.VITE_TERRAIN_TILES;
const SAT_URL = import.meta.env.VITE_SAT_TILES;
const ZOOM = 12;
const RASTER_ZOOM = 10;
const TILE_SIZE = 256;
const EXAGGERATION = 1;
const SIZE = 10;
// Chapter colors multiply the imagery, so keep them close to white.
const tint = (hex) => new THREE.Color(0xffffff).lerp(new THREE.Color(hex), 0.3);

function lonLatToTile([lon, lat], z = ZOOM) {
  const n = 2 ** z;
  const clampedLat = Math.max(-85.0511, Math.min(85.0511, lat));
  const rad = (clampedLat * Math.PI) / 180;
  return {
    x: Math.floor(((lon + 180) / 360) * n),
    y: Math.floor(
      ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n,
    ),
  };
}

const mercatorY = (lat) => {
  const rad = (Math.max(-85.0511, Math.min(85.0511, lat)) * Math.PI) / 180;
  return (1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2;
};

const tileUrl = (template, { x, y, z = ZOOM }) =>
  template.replace("{z}", z).replace("{x}", x).replace("{y}", y);

function createTileGrid(bounds, zoom) {
  const [west, south, east, north] = bounds;
  const northWest = lonLatToTile([west, north], zoom);
  const southEast = lonLatToTile([east - 1e-10, south + 1e-10], zoom);
  const minX = Math.min(northWest.x, southEast.x);
  const maxX = Math.max(northWest.x, southEast.x);
  const minY = Math.min(northWest.y, southEast.y);
  const maxY = Math.max(northWest.y, southEast.y);
  return {
    zoom,
    minX,
    minY,
    cols: maxX - minX + 1,
    rows: maxY - minY + 1,
  };
}

async function loadTileMosaic(template, grid, signal) {
  const canvas = document.createElement("canvas");
  canvas.width = grid.cols * TILE_SIZE;
  canvas.height = grid.rows * TILE_SIZE;
  const ctx = canvas.getContext("2d");

  await Promise.all(
    Array.from({ length: grid.rows * grid.cols }, async (_, index) => {
      const col = index % grid.cols;
      const row = Math.floor(index / grid.cols);
      const tile = {
        x: grid.minX + col,
        y: grid.minY + row,
        z: grid.zoom,
      };
      const response = await fetch(tileUrl(template, tile), { signal });
      if (!response.ok) throw new Error(`Map tile ${response.status}`);
      const image = await createImageBitmap(await response.blob());
      ctx.drawImage(
        image,
        col * TILE_SIZE,
        row * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
      );
      image.close();
    }),
  );

  return canvas;
}

function getBoundsPixelFrame(bounds, grid) {
  const worldSize = 2 ** grid.zoom * TILE_SIZE;
  const xAt = (lon) => ((lon + 180) / 360) * worldSize - grid.minX * TILE_SIZE;
  const yAt = (lat) => mercatorY(lat) * worldSize - grid.minY * TILE_SIZE;
  const [west, south, east, north] = bounds;
  const left = xAt(west);
  const top = yAt(north);
  const right = xAt(east);
  const bottom = yAt(south);

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
    metersPerPixel:
      (40075016.686 * Math.cos((((south + north) / 2) * Math.PI) / 180)) /
      worldSize,
  };
}

function cropTileMosaic(source, frame) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(frame.width);
  canvas.height = Math.ceil(frame.height);
  const ctx = canvas.getContext("2d");
  // Turn off image smoothing to avoid false elevation artifacts when cropping the tile mosaic
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    source,
    frame.left,
    frame.top,
    frame.width,
    frame.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return canvas;
}

async function loadRasterTexture(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Raster image ${response.status}`);
  const image = await createImageBitmap(await response.blob());
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  image.close();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Terrarium PNG: height (m) = R * 256 + G + B / 256 - 32768.
async function loadTerrain(grid, bounds, lat, signal) {
  const mosaic = await loadTileMosaic(TILE_URL, grid, signal);
  const frame = bounds ? getBoundsPixelFrame(bounds, grid) : null;
  const canvas = frame ? cropTileMosaic(mosaic, frame) : mosaic;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const heights = new Float32Array(canvas.width * canvas.height);
  for (let i = 0; i < heights.length; i++)
    heights[i] =
      data[i * 4] * 256 + data[i * 4 + 1] + data[i * 4 + 2] / 256 - 32768;
  const min = heights.reduce((a, b) => Math.min(a, b));

  const tileMeters =
    (40075016.686 * Math.cos((lat * Math.PI) / 180)) / 2 ** grid.zoom;
  const gridScale = Math.max(grid.cols, grid.rows);
  const scale = frame
    ? (SIZE / (frame.width * frame.metersPerPixel)) * EXAGGERATION
    : (SIZE / (tileMeters * gridScale)) * EXAGGERATION;

  const geometry = new THREE.PlaneGeometry(
    frame ? SIZE : (SIZE * grid.cols) / gridScale,
    frame
      ? (SIZE * frame.height) / frame.width
      : (SIZE * grid.rows) / gridScale,
    canvas.width - 1,
    canvas.height - 1,
  );
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, (heights[i] - min) * scale);
  geometry.computeVertexNormals();
  return geometry;
}

// Walls from the terrain's perimeter down to a flat base, plus a bottom cap.
function buildSkirt(plane, base) {
  const { widthSegments, heightSegments } = plane.parameters;
  const cols = widthSegments + 1;
  const rows = heightSegments + 1;
  const src = plane.attributes.position;

  // Perimeter vertex indices in loop order, corners counted once.
  const ring = [];
  for (let c = 0; c < cols; c++) ring.push(c);
  for (let r = 1; r < rows; r++) ring.push(r * cols + cols - 1);
  for (let c = cols - 2; c >= 0; c--) ring.push((rows - 1) * cols + c);
  for (let r = rows - 2; r >= 1; r--) ring.push(r * cols);

  // Vertices: top 2k, bottom 2k+1, cap center 2n.
  const n = ring.length;
  const verts = new Float32Array((2 * n + 1) * 3);
  const index = [];
  ring.forEach((v, k) => {
    const x = src.getX(v);
    const y = src.getY(v);
    verts.set([x, y, src.getZ(v), x, y, base], k * 6);
    const m = (k + 1) % n;
    index.push(2 * k, 2 * k + 1, 2 * m, 2 * k + 1, 2 * m + 1, 2 * m);
    index.push(2 * n, 2 * k + 1, 2 * m + 1);
  });
  verts.set([0, 0, base], 6 * n);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  geometry.setIndex(index);
  return geometry;
}

export default function CaseStudy({ study, onBack }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const flyRef = useRef(null);
  const tabRefs = useRef([]);
  const [index, setIndex] = useState(0);
  const chapter = chapters[index];
  const stage = study.stages.find((item) => item.type === chapter.key);
  const overlayAvailable = Boolean(
    study.imageBounds && stage?.imagery && /\.(png|webp)$/i.test(stage.imagery),
  );
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.85);
  const [overlayStatus, setOverlayStatus] = useState("idle");

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1020);

    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(...chapters[0].camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const center = calculateCentroid(study.coordinates);
    const grid = study.imageBounds
      ? createTileGrid(study.imageBounds, RASTER_ZOOM)
      : (() => {
          const tile = lonLatToTile(center);
          return {
            zoom: ZOOM,
            minX: tile.x,
            minY: tile.y,
            cols: 1,
            rows: 1,
          };
        })();
    const material = new THREE.MeshStandardMaterial({
      color: tint(chapters[0].color),
    });
    const terrain = new THREE.Mesh(
      new THREE.PlaneGeometry(SIZE, SIZE),
      material,
    );
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    const overlayMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      side: THREE.DoubleSide,
    });
    const overlayMesh = new THREE.Mesh(terrain.geometry, overlayMaterial);
    overlayMesh.rotation.x = -Math.PI / 2;
    overlayMesh.visible = false;
    scene.add(overlayMesh);

    // Child of terrain so it shares the rotation; flat shading avoids smeared normals.
    const skirtMaterial = new THREE.MeshStandardMaterial({
      color: 0x51483b,
      roughness: 0.95,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const skirt = new THREE.Mesh(new THREE.BufferGeometry(), skirtMaterial);
    terrain.add(skirt);

    const loader = new AbortController();
    loadTerrain(grid, study.imageBounds, center[1], loader.signal)
      .then((geometry) => {
        terrain.geometry.dispose();
        terrain.geometry = geometry;
        overlayMesh.geometry = geometry;
        skirt.geometry.dispose();
        skirt.geometry = buildSkirt(geometry, -0.5);
      })
      .catch((err) => err.name !== "AbortError" && console.warn(err));

    loadTileMosaic(SAT_URL, grid, loader.signal)
      .then((mosaic) => {
        if (loader.signal.aborted) return;
        const canvas = study.imageBounds
          ? cropTileMosaic(mosaic, getBoundsPixelFrame(study.imageBounds, grid))
          : mosaic;
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.needsUpdate = true;
        sceneRef.current.satTexture = texture;
      })
      .catch((err) => err.name !== "AbortError" && console.warn(err));

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 10, 5);
    scene.add(sun);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    controls.enableDamping = true;
    controls.minDistance = 4;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2.2;
    // User takes the camera: finish the color change but stop flying.
    controls.addEventListener("start", () => {
      if (flyRef.current) material.color.copy(flyRef.current.colorTo);
      flyRef.current = null;
    });
    sceneRef.current = {
      camera,
      controls,
      material,
      overlayMaterial,
      overlayMesh,
      grid,
      satTexture: null,
    };

    const resizer = new ResizeObserver(() => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });
    resizer.observe(mount);

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const fly = flyRef.current;
      if (fly) {
        fly.t = Math.min(1, fly.t + clock.getDelta() / FLY_SECONDS);
        const k = ease(fly.t);
        camera.position.lerpVectors(fly.from, fly.to, k);
        material.color.lerpColors(fly.colorFrom, fly.colorTo, k);
        if (fly.t === 1) flyRef.current = null;
      } else {
        clock.getDelta();
      }
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      loader.abort();
      resizer.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      terrain.geometry.dispose();
      skirt.geometry.dispose();
      skirtMaterial.dispose();
      sceneRef.current.satTexture?.dispose();
      overlayMaterial.map?.dispose();
      overlayMaterial.dispose();
      material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const sceneState = sceneRef.current;
    if (!sceneState) return undefined;

    const controller = new AbortController();
    const { overlayMaterial, overlayMesh, grid } = sceneState;
    overlayMaterial.map?.dispose();
    overlayMaterial.map = null;
    overlayMaterial.needsUpdate = true;
    overlayMesh.visible = false;

    if (!overlayAvailable) {
      setOverlayStatus("idle");
      return () => controller.abort();
    }

    setOverlayVisible(true);
    setOverlayStatus("loading");
    const url = stage.imagery.startsWith("/")
      ? stage.imagery
      : `/assets/geospatial/${stage.imagery}`;

    loadRasterTexture(url, controller.signal)
      .then((texture) => {
        if (controller.signal.aborted) {
          texture.dispose();
          return;
        }
        overlayMaterial.map = texture;
        overlayMaterial.opacity = overlayOpacity;
        overlayMaterial.needsUpdate = true;
        overlayMesh.visible = overlayVisible;
        setOverlayStatus("ready");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.warn(err);
          setOverlayStatus("error");
        }
      });

    return () => controller.abort();
  }, [study.id, chapter.key, stage?.imagery, overlayAvailable]);

  useEffect(() => {
    const sceneState = sceneRef.current;
    if (!sceneState) return;
    sceneState.overlayMaterial.opacity = overlayOpacity;
    sceneState.overlayMesh.visible =
      overlayAvailable &&
      overlayVisible &&
      Boolean(sceneState.overlayMaterial.map);
  }, [overlayAvailable, overlayVisible, overlayOpacity, overlayStatus]);

  useEffect(() => {
    const { camera, material } = sceneRef.current;
    flyRef.current = {
      from: camera.position.clone(),
      to: new THREE.Vector3(...chapter.camera),
      colorFrom: material.color.clone(),
      colorTo: tint(chapter.color),
      t: reducedMotion() ? 1 : 0,
    };
  }, [chapter]);

  const go = (i) => {
    const next = Math.max(0, Math.min(chapters.length - 1, i));
    setIndex(next);
    if (tabRefs.current.includes(document.activeElement))
      tabRefs.current[next - 1]?.focus();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest("input, textarea, select")) return;
      const moves = {
        ArrowRight: index + 1,
        ArrowLeft: index - 1,
        Home: 1,
        End: chapters.length - 1,
      };
      if (e.key in moves) {
        e.preventDefault();
        go(moves[e.key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const time = (k) => new Date(study.timeline[k]).getTime();
  const span = time("end") - time("start");
  const pos = (c) => ((time(c.date) - time("start")) / span) * 100;
  const isLast = index === chapters.length - 1;

  return (
    <div className="case-view">
      <header className="case-bar">
        <button className="link" onClick={onBack}>
          ← Map
        </button>
        <h1>
          {study.type} · <span className="meta">{study.location}</span>
        </h1>
        <details className="about">
          <summary>About this data</summary>
          <div className="about-body">
            <h3>Limitations</h3>
            <p>{study.limitations}</p>
            <h3>Methods</h3>
            <p>{study.methods}</p>
            <h3>Sources</h3>
            <ul>
              {study.sources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </details>
      </header>

      <div className="scene">
        <div
          ref={mountRef}
          className="scene-canvas"
          role="img"
          aria-label={`3D terrain of ${study.location}, ${chapter.label} view`}
        />

        <article
          key={chapter.key}
          className="story-card"
          {...(stage && {
            id: "story-panel",
            role: "tabpanel",
            "aria-labelledby": `tab-${chapter.key}`,
          })}
        >
          {stage ? (
            <>
              <p className="kicker">
                {index}/{steps.length} · {chapter.label} ·{" "}
                {study.timeline[chapter.date]}
              </p>
              <h2>{stage.headline}</h2>
              <p className="metric">
                <strong>{stage.metric.value}</strong> {stage.metric.label}
              </p>
              <p>{stage.summary}</p>
              <div className="imagery">{stage.imagery}</div>
              {overlayAvailable && (
                <div className="raster-controls">
                  <label>
                    <input
                      type="checkbox"
                      checked={overlayVisible}
                      onChange={(event) =>
                        setOverlayVisible(event.target.checked)
                      }
                    />
                    Show map overlay
                  </label>
                  <label className="raster-opacity">
                    Opacity
                    <input
                      type="range"
                      min="0.2"
                      max="1"
                      step="0.05"
                      value={overlayOpacity}
                      onChange={(event) =>
                        setOverlayOpacity(Number(event.target.value))
                      }
                    />
                  </label>
                  <p aria-live="polite">
                    {overlayStatus === "loading" && "Loading overlay…"}
                    {overlayStatus === "error" &&
                      "Overlay could not be loaded."}
                  </p>
                </div>
              )}
              {stage.actions && (
                <>
                  <h3>What to do with this</h3>
                  <ul className="actions">
                    {stage.actions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </>
              )}
              <p className="confidence" title={study.limitations}>
                Confidence: {stage.confidence}
              </p>
              {isLast && (
                <button onClick={onBack}>Explore other case studies →</button>
              )}
            </>
          ) : (
            <>
              <p className="kicker">Case study · {study.title}</p>
              <h2 className="headline">{study.headline}</h2>
              <p className="metric">
                <strong>{study.keyMetric.value}</strong> {study.keyMetric.label}
              </p>
              <p>{study.summary}</p>
              <button onClick={() => go(1)}>Begin the story →</button>
            </>
          )}
        </article>

        <p className="scene-hint">
          Drag to orbit · Scroll to zoom · ← → to navigate
        </p>
      </div>

      <nav className="timeline" aria-label="Story timeline">
        <button
          className="secondary"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Previous chapter"
        >
          ←
        </button>
        <div className="track" role="tablist" aria-label="Story chapters">
          <div
            className="track-fill"
            style={{ width: `${index ? pos(chapter) : 0}%` }}
          />
          {steps.map((c, i) => (
            <button
              key={c.key}
              ref={(el) => (tabRefs.current[i] = el)}
              id={`tab-${c.key}`}
              role="tab"
              aria-selected={c === chapter}
              aria-controls={c === chapter ? "story-panel" : undefined}
              tabIndex={c === chapter || (index === 0 && i === 0) ? 0 : -1}
              className={`point ${c === chapter ? "active" : i + 1 < index ? "done" : ""}`}
              style={{ left: `${pos(c)}%` }}
              onClick={() => go(i + 1)}
            >
              <span className="dot" aria-hidden="true" />
              {c.label}
              <small>{study.timeline[c.date]}</small>
            </button>
          ))}
        </div>
        <button
          onClick={() => go(index + 1)}
          disabled={isLast}
          aria-label="Next chapter"
        >
          →
        </button>
      </nav>

      <p className="sr-only" aria-live="polite">
        {index
          ? `Chapter ${index} of ${steps.length}: ${chapter.label}, ${study.timeline[chapter.date]}`
          : "Overview"}
      </p>
    </div>
  );
}
