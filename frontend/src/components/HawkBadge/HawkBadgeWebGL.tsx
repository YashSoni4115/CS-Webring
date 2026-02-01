import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import styles from "./HawkBadgeWebGL.module.css";
import hawkSvgUrl from "../../assets/golden-hawk.svg?url";

export default function HawkBadgeWebGL() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    // @ts-ignore
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearAlpha(0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    host.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(4, 5, 6);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(-5, 2, 4);
    scene.add(rim);

    // Group
    const group = new THREE.Group();
    scene.add(group);

    // Fixed orientation (30 degrees clockwise)
    const baseRotationZ = -Math.PI / 6;

    // Load SVG, extrude to solid
    const loader = new SVGLoader();

    let mesh: THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshStandardMaterial> | null = null;
    let geom: THREE.ExtrudeGeometry | null = null;
    let mat: THREE.MeshStandardMaterial | null = null;

    loader.load(
      hawkSvgUrl,
      (data) => {
        const shapes: THREE.Shape[] = [];
        for (const p of data.paths) {
          shapes.push(...SVGLoader.createShapes(p));
        }

        geom = new THREE.ExtrudeGeometry(shapes, {
          depth: 8, // thicker
          bevelEnabled: true,
          bevelThickness: 0.18,
          bevelSize: 0.1,
          bevelSegments: 3,
          curveSegments: 12,
        });

        geom.computeBoundingBox();
        const box = geom.boundingBox;
        if (box) {
          const cx = (box.min.x + box.max.x) / 2;
          const cy = (box.min.y + box.max.y) / 2;
          const cz = (box.min.z + box.max.z) / 2;
          geom.translate(-cx, -cy, -cz);
        }

        // Scale down and flip Y for SVG coordinates
        const s = 0.002; // smaller
        geom.scale(s, -s, s);

        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#FDB913"),
          roughness: 0.35,
          metalness: 0.15,
          side: THREE.DoubleSide,
        });

        mesh = new THREE.Mesh(geom, mat);
        group.add(mesh);
      },
      undefined,
      () => {
        // ignore load errors silently, keeps UI stable
      }
    );

    // Resize
    const resize = () => {
      const rect = host.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, true);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    // Animation
    const clock = new THREE.Clock();
    let raf: number | null = null;

    const tick = () => {
      const t = clock.getElapsedTime();

      group.position.y = Math.sin(t * 1.1) * 0.18;

      group.rotation.y = t * 0.55;
      group.rotation.x = Math.sin(t * 0.7) * 0.08;
      group.rotation.z = baseRotationZ + Math.sin(t * 0.9) * 0.05;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);

      if (mesh) group.remove(mesh);

      if (geom) geom.dispose();
      if (mat) mat.dispose();

      renderer.dispose();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className={styles.layer} aria-hidden="true" />;
}