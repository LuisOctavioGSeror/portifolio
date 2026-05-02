import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* TYPING EFFECT — só existe na landing (hero.html) */

const text = "Software engineer • AI integrator";
let i = 0;

const typingEl = document.getElementById("typing");
function type() {
  if (!typingEl || i >= text.length) return;
  typingEl.textContent += text.charAt(i);
  i++;
  setTimeout(type, 80);
}
type();

/* THREE BACKGROUND — só se o canvas da landing existir */

const bgCanvas = document.getElementById("bg");
if (bgCanvas) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  try {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      Math.max(window.innerWidth / window.innerHeight, 0.001),
      0.1,
      1000
    );

    camera.position.z = 60;

    const renderer = new THREE.WebGLRenderer({
      canvas: bgCanvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    const maxDpr = reducedMotion ? 1 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.5;

    const count = window.innerWidth < 768 ? 55 : reducedMotion ? 40 : 110;

    const positions = new Float32Array(count * 3);

    for (let idx = 0; idx < count; idx++) {
      positions[idx * 3] = (Math.random() - 0.5) * 120;
      positions[idx * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[idx * 3 + 2] = (Math.random() - 0.5) * 120;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.8,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    });

    const linePositions = [];
    const maxSegments = 6000;

    outer: for (let a = 0; a < count; a++) {
      for (let b = a + 1; b < count; b++) {
        if (linePositions.length >= maxSegments * 6) break outer;

        const dx = positions[a * 3] - positions[b * 3];
        const dy = positions[a * 3 + 1] - positions[b * 3 + 1];
        const dz = positions[a * 3 + 2] - positions[b * 3 + 2];

        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 25) {
          linePositions.push(
            positions[a * 3],
            positions[a * 3 + 1],
            positions[a * 3 + 2],
            positions[b * 3],
            positions[b * 3 + 1],
            positions[b * 3 + 2]
          );
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    let running = document.visibilityState === "visible";
    let rafId = 0;

    function loop() {
      if (!running) {
        rafId = 0;
        return;
      }

      points.rotation.y += 0.0008;
      points.rotation.x += 0.0003;

      controls.update();

      renderer.render(scene, camera);

      rafId = requestAnimationFrame(loop);
    }

    bgCanvas.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
      },
      false
    );

    document.addEventListener("visibilitychange", () => {
      running = document.visibilityState === "visible";
      if (running && !reducedMotion && !rafId) {
        rafId = requestAnimationFrame(loop);
      }
      if (!running && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    });

    if (reducedMotion) {
      renderer.render(scene, camera);
      controls.dispose();
    } else {
      rafId = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", () => {
      camera.aspect = Math.max(window.innerWidth / window.innerHeight, 0.001);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  } catch (err) {
    console.warn("[hero] WebGL / Three.js não disponível — fundo desativado.", err);
    bgCanvas.style.display = "none";
  }
}
