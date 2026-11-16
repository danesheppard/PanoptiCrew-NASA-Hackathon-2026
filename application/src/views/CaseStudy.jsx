import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { calculateCentroid } from "../utilities/utilities.ts";
import { useTheme } from "../customHooks.ts";
import buildLegend from "../utilities/buildLegend.jsx";
import Header from "./Header/Header.jsx";

// `key` matches a study stage type; `date` maps to a key in study.key_dates.
const chapters = [
  { key: "intro", label: "Overview", color: 0x5a6b8a },
  {
    key: "leadUp",
    label: "Lead-up",
    date: "before",
    color: 0x4f8a3c,
  },
  {
    key: "event",
    label: "Event",
    date: "event",
    color: 0xc0502e,
  },
  {
    key: "takeaway",
    label: "Takeaway",
    date: "after",
    color: 0x8a7a4f,
  },
];
const steps = chapters.slice(1);
// Default view for every chapter: from the west, high enough to see the whole block and its sides.
// A stage (or the whole study) can override it with `camera: [x, y, z]`.
const DEFAULT_CAMERA = [-9.5, 9.5, 3.5];
// The overview looks at the block from its north-west corner, so both cut sides show; the story then moves to the default view.
const OVERVIEW_CAMERA = [-7.6, 10, -7.6];
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

// Scene backdrop from the active theme's CSS variable.
const stageColor = () =>
  new THREE.Color(
    getComputedStyle(document.documentElement).getPropertyValue("--scene-bg").trim(),
  );

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

// Bands of rock for the block's sides, the cut-away diorama look.
function strataTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const bands = [
    "#8a949b",
    "#7a858d",
    "#93887a",
    "#827768",
    "#6e7a83",
    "#9aa2a6",
    "#77706a",
    "#66717a",
    "#5b656d",
  ];
  for (let y = 0, i = 0; y < canvas.height; i++) {
    const h = 10 + ((i * 37) % 23);
    ctx.fillStyle = bands[i % bands.length];
    ctx.fillRect(0, y, canvas.width, h);
    y += h;
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
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
  // u runs around the block, v from the base (0) to the highest point (1), so the strata stay level
  const uvs = new Float32Array((2 * n + 1) * 2);
  let top = base;
  for (const v of ring) top = Math.max(top, src.getZ(v));
  const index = [];
  ring.forEach((v, k) => {
    const x = src.getX(v);
    const y = src.getY(v);
    verts.set([x, y, src.getZ(v), x, y, base], k * 6);
    uvs.set(
      [(k / n) * 20, (src.getZ(v) - base) / (top - base), (k / n) * 20, 0],
      k * 4,
    );
    const m = (k + 1) % n;
    index.push(2 * k, 2 * k + 1, 2 * m, 2 * k + 1, 2 * m + 1, 2 * m);
    index.push(2 * n, 2 * k + 1, 2 * m + 1);
  });
  verts.set([0, 0, base], 6 * n);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  return geometry;
}

// Place labels and the flood path replay: a glowing dot runs down the path and labels light up as it reaches them.
const REPLAY_SECONDS = 8;
const LIFT = 0.04;
const PATH_COLOR = 0xffa31a;
const RIVER_COLOR = 0x3fa9ff;
const assetUrl = (path) =>
  path.startsWith("/") ? path : `/assets/geospatial/${path}`;
const fetchJson = (path, signal) =>
  fetch(assetUrl(path), { signal }).then((response) => {
    if (!response.ok) throw new Error(`GeoJSON ${response.status}`);
    return response.json();
  });

// Position on the terrain plane (its local x, y, z) for a longitude and latitude inside the bounds.
function terrainPoint(geometry, bounds, [lon, lat]) {
  const [west, south, east, north] = bounds;
  const { width, height, widthSegments, heightSegments } = geometry.parameters;
  const u = (lon - west) / (east - west);
  const v =
    (mercatorY(lat) - mercatorY(north)) / (mercatorY(south) - mercatorY(north));
  const col = Math.round(Math.min(1, Math.max(0, u)) * widthSegments);
  const row = Math.round(Math.min(1, Math.max(0, v)) * heightSegments);
  const z = geometry.attributes.position.getZ(row * (widthSegments + 1) + col);
  return new THREE.Vector3(
    -width / 2 + u * width,
    height / 2 - v * height,
    z + LIFT,
  );
}

// Text label drawn on a canvas, always facing the camera.
function makeLabel(text) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const font = "600 40px Inter, system-ui, sans-serif";
  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width) + 48;
  canvas.height = 64;
  ctx.font = font;
  ctx.fillStyle = "rgba(245, 247, 250, 0.92)";
  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, canvas.height, 14);
  ctx.fill();
  ctx.fillStyle = "#1a2133";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 24, canvas.height / 2 + 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      transparent: true,
    }),
  );
  const h = 0.3;
  sprite.scale.set((h * canvas.width) / canvas.height, h, 1);
  sprite.center.set(0.5, 0);
  sprite.renderOrder = 10;
  return sprite;
}

// Nudge the block to the right on wide screens, so it sits beside the story card instead of behind it.
// `shift` is the share of the width to move it by: none for the overview, which stays centred.
const STAGE_SHIFT = 0.12;
function frameBlock(camera, mount, shift = STAGE_SHIFT) {
  const w = mount.clientWidth;
  const h = mount.clientHeight;
  if (w > 760) camera.setViewOffset(w, h, -w * shift, 0, w, h);
  else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}

export default function CaseStudy({ study, onBack, onHome }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const flyRef = useRef(null);
  const tabRefs = useRef([]);
  const [theme] = useTheme();
  const [index, setIndex] = useState(0);
  const chapter = chapters[index];
  const stage = study.stages.find((item) => item.type === chapter.key);
  const legend = stage?.legend;
  const overlayAvailable = Boolean(
    study.coordinates && stage?.imagery && /\.(png|webp)$/i.test(stage.imagery),
  );
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.85);
  const [overlayStatus, setOverlayStatus] = useState("idle");

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = stageColor();

    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(...OVERVIEW_CAMERA);
    frameBlock(camera, mount, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const center = calculateCentroid(study.coordinates);
    const grid = study.coordinates
      ? createTileGrid(study.coordinates, RASTER_ZOOM)
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
      map: strataTexture(),
      roughness: 0.95,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const skirt = new THREE.Mesh(new THREE.BufferGeometry(), skirtMaterial);
    terrain.add(skirt);

    // Places and flood path, children of the terrain so they share its rotation
    const replay = {
      group: new THREE.Group(),
      labels: [],
      path: null,
      dot: null,
      lengthKm: 0,
      active: false,
      elapsed: 0,
    };
    terrain.add(replay.group);
    const replayStage = study.stages.find((item) => item.replay);
    const buildReplay = async (geometry) => {
      const bounds = study.coordinates;
      if (!geometry || bounds?.length !== 4) return;
      const [places, line] = await Promise.all([
        study.scene?.places
          ? fetchJson(study.scene.places, loader.signal)
          : null,
        typeof replayStage?.replay === "string"
          ? fetchJson(replayStage.replay, loader.signal)
          : null,
      ]);
      const coords = Array.isArray(replayStage?.replay)
        ? replayStage.replay
        : line?.features?.[0]?.geometry?.coordinates;
      if (coords?.length > 1) {
        const points = coords.map((c) => terrainPoint(geometry, bounds, c));
        replay.path = new THREE.CatmullRomCurve3(points);
        replay.lengthKm =
          line?.features?.[0]?.properties?.length_km ??
          study.scene?.flood_path_km ??
          0;
        replay.tube = new THREE.Mesh(
          new THREE.TubeGeometry(replay.path, points.length * 2, 0.025, 6),
          new THREE.MeshBasicMaterial({ color: PATH_COLOR }),
        );
        replay.dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xfff1a8 }),
        );
        replay.group.add(replay.tube, replay.dot);
      }
      (places?.features ?? []).forEach((feature) => {
        const label = makeLabel(feature.properties.name);
        label.position.copy(
          terrainPoint(geometry, bounds, feature.geometry.coordinates),
        );
        label.position.z += 0.12;
        label.userData.km = feature.properties.km_along_path;
        replay.group.add(label);
        replay.labels.push(label);
      });
      showReplay(sceneRef.current?.replayMode ?? "river");
    };
    // "river": the overview shows the path as the river in blue
    // "replay": the stage with a replay shows it in orange with the moving dot
    // "none": the other stages hide it. Labels show everywhere
    const showReplay = (mode) => {
      if (mode === "replay" && !replay.active) replay.elapsed = 0;
      replay.active = mode === "replay";
      if (replay.tube) {
        replay.tube.visible = mode !== "none";
        replay.tube.material.color.set(
          mode === "river" ? RIVER_COLOR : PATH_COLOR,
        );
      }
      if (replay.dot) replay.dot.visible = replay.active;
    };

    const loader = new AbortController();
    loadTerrain(grid, study.coordinates, center[1], loader.signal)
      .then((geometry) => {
        terrain.geometry.dispose();
        terrain.geometry = geometry;
        overlayMesh.geometry = geometry;
        skirt.geometry.dispose();
        skirt.geometry = buildSkirt(geometry, -0.5);
        return geometry;
      })
      .then((geometry) => buildReplay(geometry))
      .catch((err) => err.name !== "AbortError" && console.warn(err));

    loadTileMosaic(SAT_URL, grid, loader.signal)
      .then((mosaic) => {
        if (loader.signal.aborted) return;
        const canvas = study.coordinates
          ? cropTileMosaic(mosaic, getBoundsPixelFrame(study.coordinates, grid))
          : mosaic;
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.needsUpdate = true;
        sceneRef.current.satTexture = texture;
      })
      .catch((err) => err.name !== "AbortError" && console.warn(err));

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a877d, 1.8));
    scene.add(new THREE.AmbientLight(0xffffff, 2.95));
    // const sun = new THREE.DirectionalLight(0xffffff, 5.2);
    // sun.position.set(5, 10, 5);
    // scene.add(sun);

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
      if (flyRef.current) {
        material.color.copy(flyRef.current.colorTo);
        sceneRef.current.shift = flyRef.current.shiftTo;
        frameBlock(camera, mount, sceneRef.current.shift);
      }
      flyRef.current = null;
    });
    sceneRef.current = {
      scene,
      camera,
      controls,
      material,
      overlayMaterial,
      overlayMesh,
      grid,
      satTexture: null,
      showReplay,
      replayMode: "river",
      shift: 0,
    };

    const resizer = new ResizeObserver(() => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      frameBlock(camera, mount, sceneRef.current?.shift ?? 0);
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });
    resizer.observe(mount);

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const fly = flyRef.current;
      const delta = clock.getDelta();
      if (fly) {
        fly.t = Math.min(1, fly.t + delta / FLY_SECONDS);
        const k = ease(fly.t);
        camera.position.lerpVectors(fly.from, fly.to, k);
        material.color.lerpColors(fly.colorFrom, fly.colorTo, k);
        // slide the block sideways along with the camera
        sceneRef.current.shift =
          fly.shiftFrom + (fly.shiftTo - fly.shiftFrom) * k;
        frameBlock(camera, mount, sceneRef.current.shift);
        if (fly.t === 1) flyRef.current = null;
      }
      if (replay.active && replay.path) {
        // loop the run, with a short pause at the end so the lit labels can be read
        replay.elapsed += delta;
        const t = Math.min(
          1,
          (replay.elapsed % (REPLAY_SECONDS + 2)) / REPLAY_SECONDS,
        );
        const point = replay.path.getPointAt(t);
        replay.dot.position.copy(point);
        replay.labels.forEach((label) => {
          const reached =
            label.userData.km == null ||
            label.userData.km <= t * replay.lengthKm;
          label.material.opacity = reached ? 1 : 0.45;
        });
      } else {
        replay.labels.forEach((label) => (label.material.opacity = 1));
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
      skirtMaterial.map?.dispose();
      skirtMaterial.dispose();
      sceneRef.current.satTexture?.dispose();
      overlayMaterial.map?.dispose();
      overlayMaterial.dispose();
      material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  // The scene is built once; only its backdrop follows the theme.
  useEffect(() => {
    sceneRef.current.scene.background = stageColor();
  }, [theme]);

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
    const sceneState = sceneRef.current;
    sceneState.replayMode =
      index === 0 ? "river" : stage?.replay ? "replay" : "none";
    sceneState.showReplay(sceneState.replayMode);
  }, [index, stage?.replay]);

  useEffect(() => {
    const { camera, material } = sceneRef.current;
    flyRef.current = {
      from: camera.position.clone(),
      to: new THREE.Vector3(
        ...(index === 0
          ? OVERVIEW_CAMERA
          : (stage?.camera ?? study.camera ?? DEFAULT_CAMERA)),
      ),
      colorFrom: material.color.clone(),
      colorTo: tint(chapter.color),
      shiftFrom: sceneRef.current.shift ?? 0,
      shiftTo: index === 0 ? 0 : STAGE_SHIFT,
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

  const pos = (c) => (steps.indexOf(c) / (steps.length - 1)) * 100;
  const isLast = index === chapters.length - 1;

  return (
    <div className="case-view">
      <Header onHome={onHome} />
      <header className="case-bar">
        <button className="link" onClick={onBack}>
          ← Map
        </button>
        <h1>
          {study.type} · <span className="meta">{study.location}</span>
        </h1>
        <details className="about">
          <summary>About this dataset</summary>
          <div className="about-body">
            <h3>Limitations</h3>
            <p>{study.limitations}</p>
            <h3>Method</h3>
            <p>{study.method}</p>
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
        {buildLegend(legend, {
          className: "case-legend",
          title: "Map legend",
          ariaLabel: `${chapter.label} map legend`,
          showFloodPath: Boolean(stage?.replay),
        })}

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
                {study.key_dates[chapter.date]}
              </p>
              <h2>{stage.headline}</h2>
              <p className="metric">
                <strong>{stage.metric.value}</strong> {stage.metric.label}
              </p>
              <p>{stage.summary}</p>
              {stage.chart && (
                <div className="chart-insert">
                  <img
                    src={
                      stage.chart.startsWith("/")
                        ? stage.chart
                        : `/assets/geospatial/${stage.chart}`
                    }
                    alt={`${stage.headline} chart`}
                  />
                </div>
              )}
              {overlayAvailable && (
                <div className="raster-controls">
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
              <p>{study.story}</p>
              <button onClick={() => go(1)}>Begin the story →</button>
            </>
          )}
        </article>

        <p className="scene-hint">
          Drag to pan · Scroll to zoom · ← → to navigate
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
              <small>{study.key_dates[c.date]}</small>
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
          ? `Chapter ${index} of ${steps.length}: ${chapter.label}, ${study.key_dates[chapter.date]}`
          : "Overview"}
      </p>
    </div>
  );
}
