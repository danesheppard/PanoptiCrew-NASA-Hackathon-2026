import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// `date` maps each chapter to a key in study.timeline; `camera` frames that chapter.
const chapters = [
  { key: "intro", label: "Overview", color: 0x5a6b8a, camera: [0, 12, 12] },
  { key: "leadUp", label: "Lead-up", date: "start", color: 0x4f8a3c, camera: [0, 8, 9] },
  { key: "event", label: "Event", date: "event", color: 0xc0502e, camera: [5, 5, 6] },
  { key: "takeaway", label: "Takeaway", date: "end", color: 0x8a7a4f, camera: [-6, 9, 7] },
];
const steps = chapters.slice(1);
const FLY_SECONDS = 1.2;
const ease = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function buildTerrain() {
  const geometry = new THREE.PlaneGeometry(10, 10, 128, 128);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(
      i,
      Math.sin(x * 0.8) * Math.cos(y * 0.6) * 0.6 +
        Math.sin(x * 2.1 + y) * 0.15,
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

export default function CaseStudy({ study, onBack }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const flyRef = useRef(null);
  const tabRefs = useRef([]);
  const [index, setIndex] = useState(0);
  const chapter = chapters[index];

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

    const material = new THREE.MeshStandardMaterial({
      color: chapters[0].color,
      flatShading: true,
    });
    const terrain = new THREE.Mesh(buildTerrain(), material);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 10, 5);
    scene.add(sun);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 4;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2.2;
    // User takes the camera: finish the color change but stop flying.
    controls.addEventListener("start", () => {
      if (flyRef.current) material.color.copy(flyRef.current.colorTo);
      flyRef.current = null;
    });
    sceneRef.current = { camera, controls, material };

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
      resizer.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      terrain.geometry.dispose();
      material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const { camera, material } = sceneRef.current;
    flyRef.current = {
      from: camera.position.clone(),
      to: new THREE.Vector3(...chapter.camera),
      colorFrom: material.color.clone(),
      colorTo: new THREE.Color(chapter.color),
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
      const moves = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 1, End: chapters.length - 1 };
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
  const stage = study.stages[chapter.key];
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
        <span className="badge">Sample data</span>
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
                {index}/{steps.length} · {chapter.label} · {study.timeline[chapter.date]}
              </p>
              <h2>{stage.headline}</h2>
              <p className="metric">
                <strong>{stage.metric.value}</strong> {stage.metric.label}
              </p>
              <p>{stage.summary}</p>
              <div className="imagery">{stage.imagery}</div>
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
              {isLast && <button onClick={onBack}>Explore other case studies →</button>}
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

        <p className="scene-hint">Drag to orbit · Scroll to zoom · ← → to navigate</p>
      </div>

      <nav className="timeline" aria-label="Story timeline">
        <button className="secondary" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous chapter">
          ←
        </button>
        <div className="track" role="tablist" aria-label="Story chapters">
          <div className="track-fill" style={{ width: `${index ? pos(chapter) : 0}%` }} />
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
        <button onClick={() => go(index + 1)} disabled={isLast} aria-label="Next chapter">
          →
        </button>
      </nav>

      <p className="sr-only" aria-live="polite">
        {index ? `Chapter ${index} of ${steps.length}: ${chapter.label}, ${study.timeline[chapter.date]}` : "Overview"}
      </p>
    </div>
  );
}
