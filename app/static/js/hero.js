/* TYPING EFFECT — só existe na landing (hero.html) */

const typingEl = document.getElementById("typing");
const text = typingEl?.dataset.text || "";
let i = 0;

function type() {
  if (!typingEl || i >= text.length) return;
  typingEl.textContent += text.charAt(i);
  i++;
  setTimeout(type, 80);
}

type();

/* THREE BACKGROUND — só se o canvas da landing existir */

const bgCanvas = document.getElementById("bg");

async function initNeuralBackground(canvas) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const THREE = await import("three");
  const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    Math.max(window.innerWidth / window.innerHeight, 0.001),
    0.1,
    1000
  );

  camera.position.z = 60;

  const renderer = new THREE.WebGLRenderer({
    canvas,
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

  const circleTexture = (() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  })();

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    map: circleTexture,
    transparent: true,
    opacity: 0.8,
    alphaTest: 0.01,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);

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

  // Pontos e linhas no mesmo grupo: os nós ficam travados nas conexões
  const network = new THREE.Group();
  network.add(points);
  network.add(lines);
  scene.add(network);

  let running = document.visibilityState === "visible";
  let rafId = 0;

  function loop() {
    if (!running) {
      rafId = 0;
      return;
    }

    network.rotation.y += 0.0008;
    network.rotation.x += 0.0003;

    controls.update();

    renderer.render(scene, camera);

    rafId = requestAnimationFrame(loop);
  }

  canvas.addEventListener(
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
}

if (bgCanvas) {
  initNeuralBackground(bgCanvas).catch((err) => {
    console.warn("[hero] WebGL / Three.js não disponível — fundo desativado.", err);
  });
}
