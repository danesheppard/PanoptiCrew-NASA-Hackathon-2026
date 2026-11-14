import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const tabs = [
  { key: "leadUp", label: "Lead-up", color: 0x4f8a3c },
  { key: "event", label: "Event", color: 0xc0502e },
  { key: "takeaway", label: "Takeaway", color: 0x8a7a4f },
];

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
  const materialRef = useRef(null);
  const [tab, setTab] = useState(tabs[0]);

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
    camera.position.set(0, 8, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const material = new THREE.MeshStandardMaterial({
      color: tabs[0].color,
      flatShading: true,
    });
    materialRef.current = material;
    const terrain = new THREE.Mesh(buildTerrain(), material);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 10, 5);
    scene.add(sun);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.setAnimationLoop(null);
      controls.dispose();
      terrain.geometry.dispose();
      material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    materialRef.current?.color.setHex(tab.color);
  }, [tab]);

  const stage = study.stages[tab.key];

  return (
    <div className="case-view">
      <aside className="panel">
        <button className="link" onClick={onBack}>
          ← Back to Map
        </button>
        <span className="badge">Sample content</span>
        <h2>{study.title}</h2>
        <p className="meta">{study.location}</p>

        <nav className="tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={t.key === tab.key ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="imagery">{stage.imagery}</div>
        <p>{stage.summary}</p>

        <h3>Timeline</h3>
        <p className="meta">
          Lead-up {study.timeline.start} · Event {study.timeline.event} · End{" "}
          {study.timeline.end}
        </p>
        <h3>Sources</h3>
        <ul>
          {study.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <h3>Methods</h3>
        <p>{study.methods}</p>
        <h3>Limitations</h3>
        <p>{study.limitations}</p>
      </aside>
      <div className="scene" ref={mountRef} />
    </div>
  );
}
