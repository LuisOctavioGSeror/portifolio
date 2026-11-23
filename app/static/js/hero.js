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
const preloaderEl = document.getElementById("preloader");
const preloaderShownAt = performance.now();

function dismissPreloader() {
  if (!preloaderEl || preloaderEl.classList.contains("is-done")) return;
  const wait = Math.max(0, 1200 - (performance.now() - preloaderShownAt));
  window.setTimeout(() => {
    preloaderEl.classList.add("is-done");
    window.setTimeout(() => preloaderEl.remove(), 750);
  }, wait);
}

window.setTimeout(dismissPreloader, 9000);

const NODE_GLOW = 0.1;
const LINE_GLOW = 0.07;

function smoothstep(t) {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
}

function trailLevel(age, index, gap, tailSteps) {
  const behind = age / gap - index;
  if (behind < -0.35) return 0;
  if (behind < 0) return smoothstep((behind + 0.35) / 0.35);
  if (behind >= tailSteps) return 0;
  return 1 - smoothstep(behind / tailSteps);
}

function createSyncedBrightness(THREE, network, points, lines, neighbors, edges, count, options) {
  const noop = { update() {} };
  if (!options.enabled || !edges.length) return noop;

  const nodeColors = new Float32Array(count * 3);
  const lineColors = new Float32Array(edges.length * 6);
  const nodeAttr = new THREE.BufferAttribute(nodeColors, 3);
  const lineAttr = new THREE.BufferAttribute(lineColors, 3);
  const glowPointGeo = new THREE.BufferGeometry();
  const glowLineGeo = new THREE.BufferGeometry();
  glowPointGeo.setAttribute("position", points.geometry.getAttribute("position"));
  glowPointGeo.setAttribute("color", nodeAttr);
  glowLineGeo.setAttribute("position", lines.geometry.getAttribute("position"));
  glowLineGeo.setAttribute("color", lineAttr);

  const glowPoints = new THREE.Points(glowPointGeo, new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    map: points.material.map,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  }));
  const glowLines = new THREE.LineSegments(glowLineGeo, new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  }));
  glowPoints.renderOrder = 2;
  glowLines.renderOrder = 2;
  network.add(glowPoints);
  network.add(glowLines);

  const connected = [];
  for (let i = 0; i < count; i++) {
    if (neighbors[i].length) connected.push(i);
  }
  if (!connected.length) return noop;

  const pulseCount = options.mobile ? 12 : 24;
  const nodeLevel = new Float32Array(count);
  const edgeLevel = new Float32Array(edges.length);
  const edgeIndex = new Map();
  for (let e = 0; e < edges.length; e++) {
    edgeIndex.set(edges[e].a + ":" + edges[e].b, e);
  }

  const position = points.geometry.getAttribute("position");
  const tailSteps = 2.6;

  function findEdge(i, j) {
    const a = i < j ? i : j;
    const b = i < j ? j : i;
    return edgeIndex.get(a + ":" + b);
  }

  function pickNext(node, prev, incoming, visited) {
    const linked = neighbors[node];
    const forward = [];
    let best = null;
    let bestScore = -Infinity;

    for (let n = 0; n < linked.length; n++) {
      const nb = linked[n];
      if (nb === prev || visited.has(nb)) continue;
      const vx = position.getX(nb) - position.getX(node);
      const vy = position.getY(nb) - position.getY(node);
      const vz = position.getZ(nb) - position.getZ(node);
      const len = Math.hypot(vx, vy, vz) || 1;
      if (!incoming) {
        forward.push(nb);
        continue;
      }
      const score = (incoming.x * vx + incoming.y * vy + incoming.z * vz) / len;
      if (score > bestScore) {
        bestScore = score;
        best = nb;
      }
      if (score > 0.2) forward.push({ nb, score });
    }

    if (!incoming) {
      return forward.length ? forward[(Math.random() * forward.length) | 0] : null;
    }
    if (forward.length) {
      forward.sort((a, b) => b.score - a.score);
      const top = forward.filter((item) => item.score >= forward[0].score - 0.18);
      return top[(Math.random() * top.length) | 0].nb;
    }
    return best;
  }

  function spawn(pulse) {
    const hops = 4 + ((Math.random() * 3) | 0);
    let node = connected[(Math.random() * connected.length) | 0];
    let prev = -1;
    const visited = new Set([node]);
    const steps = [{ kind: "node", index: node }];
    let incoming = null;

    for (let h = 0; h < hops; h++) {
      const next = pickNext(node, prev, incoming, visited);
      if (next == null) break;
      const slot = findEdge(node, next);
      if (slot == null) break;
      const vx = position.getX(next) - position.getX(node);
      const vy = position.getY(next) - position.getY(node);
      const vz = position.getZ(next) - position.getZ(node);
      const len = Math.hypot(vx, vy, vz) || 1;
      incoming = { x: vx / len, y: vy / len, z: vz / len };
      steps.push({ kind: "edge", index: slot });
      steps.push({ kind: "node", index: next });
      visited.add(next);
      prev = node;
      node = next;
    }

    const gap = 0.16;
    pulse.steps = steps;
    pulse.gap = gap;
    pulse.tailSteps = tailSteps;
    pulse.end = ((steps.length - 1) + tailSteps) * gap;
    pulse.age = 0;
    pulse.active = true;
  }

  const pulses = [];
  for (let i = 0; i < pulseCount; i++) {
    const pulse = {
      steps: [],
      age: 0,
      gap: 0.16,
      tailSteps,
      end: 1.4,
      active: false,
      wait: 0,
    };
    spawn(pulse);
    pulse.age = -((i / pulseCount) * pulse.end);
    pulses.push(pulse);
  }

  return {
    update(dt) {
      nodeLevel.fill(0);
      edgeLevel.fill(0);

      for (let p = 0; p < pulses.length; p++) {
        const pulse = pulses[p];
        if (!pulse.active) {
          pulse.wait -= dt;
          if (pulse.wait <= 0) spawn(pulse);
          continue;
        }

        pulse.age += dt;
        if (pulse.age >= pulse.end) {
          pulse.active = false;
          pulse.wait = 0.35 + Math.random() * 0.6;
          continue;
        }

        const steps = pulse.steps;
        for (let s = 0; s < steps.length; s++) {
          const level = trailLevel(pulse.age, s, pulse.gap, pulse.tailSteps);
          if (level <= 0) continue;
          const step = steps[s];
          if (step.kind === "node") {
            if (level > nodeLevel[step.index]) nodeLevel[step.index] = level;
          } else if (level > edgeLevel[step.index]) {
            edgeLevel[step.index] = level;
          }
        }
      }

      for (let i = 0; i < count; i++) {
        const c = nodeLevel[i] * NODE_GLOW;
        nodeColors[i * 3] = c;
        nodeColors[i * 3 + 1] = c;
        nodeColors[i * 3 + 2] = c;
      }
      for (let e = 0; e < edges.length; e++) {
        const c = edgeLevel[e] * LINE_GLOW;
        const o = e * 6;
        lineColors[o] = c;
        lineColors[o + 1] = c;
        lineColors[o + 2] = c;
        lineColors[o + 3] = c;
        lineColors[o + 4] = c;
        lineColors[o + 5] = c;
      }
      nodeAttr.needsUpdate = true;
      lineAttr.needsUpdate = true;
    },
  };
}

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
  renderer.setClearColor(0x000000, 0);
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
    depthWrite: false,
  });

  const linePositions = [];
  const neighbors = Array.from({ length: count }, () => []);
  const edges = [];
  const maxSegments = 6000;

  outer: for (let a = 0; a < count; a++) {
    for (let b = a + 1; b < count; b++) {
      if (linePositions.length >= maxSegments * 6) break outer;

      const dx = positions[a * 3] - positions[b * 3];
      const dy = positions[a * 3 + 1] - positions[b * 3 + 1];
      const dz = positions[a * 3 + 2] - positions[b * 3 + 2];

      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 25) {
        edges.push({ a, b });
        linePositions.push(
          positions[a * 3],
          positions[a * 3 + 1],
          positions[a * 3 + 2],
          positions[b * 3],
          positions[b * 3 + 1],
          positions[b * 3 + 2]
        );
        neighbors[a].push(b);
        neighbors[b].push(a);
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

  const pulses = createSyncedBrightness(THREE, network, points, lines, neighbors, edges, count, {
    mobile: window.innerWidth < 768,
    enabled: !reducedMotion,
  });

  let running = document.visibilityState === "visible";
  let rafId = 0;
  const clock = new THREE.Clock();
  let departure = null;

  function beginDeparture(url) {
    if (departure) return;
    departure = {
      url,
      elapsed: 0,
      duration: 5,
      z0: camera.position.z,
      fov0: camera.fov,
    };
    controls.autoRotate = false;
    document.body.classList.add("is-departing");
    if (!scene.fog) scene.fog = new THREE.FogExp2(0x070a08, 0.001);
  }

  const overviewLink = document.querySelector(".hero .btn");
  if (overviewLink && !reducedMotion) {
    overviewLink.addEventListener("click", (event) => {
      if (!overviewLink.href || departure) return;
      event.preventDefault();
      beginDeparture(overviewLink.href);
    });
  }

  function loop() {
    if (!running) {
      rafId = 0;
      return;
    }

    const dt = Math.min(clock.getDelta(), 0.05);
    pulses.update(dt);

    let spin = 0.0008;
    if (departure) {
      departure.elapsed += dt;
      const progress = Math.min(departure.elapsed / departure.duration, 1);
      const travelStart = 0.32;
      const travel = progress <= travelStart
        ? 0
        : Math.min((progress - travelStart) / 0.4, 1);
      const eased = travel * travel * (3 - 2 * travel);
      camera.position.z = departure.z0 + (-140 - departure.z0) * eased;
      camera.updateProjectionMatrix();
      if (scene.fog) {
        const fogIn = Math.max(0, (progress - 0.5) / 0.28);
        scene.fog.density = Math.min(fogIn, 1) ** 2 * 0.02;
      }
      const fade = Math.min(1, Math.max(0, (progress - 0.55) / 0.17));
      material.opacity = 0.8 * (1 - fade);
      lineMaterial.opacity = 0.2 * (1 - fade);
      const turning = progress < travelStart ? progress / travelStart : 1 - travel * 0.4;
      spin = 0.009 * turning;
      if (fade >= 1) document.body.classList.add("is-clear");
      if (progress >= 1) {
        try {
          sessionStorage.setItem("nexaries-arrive", "1");
        } catch (e) {}
        window.location.href = departure.url;
        return;
      }
    }

    network.rotation.y += spin;
    network.rotation.x += departure ? 0.00045 : 0.0003;

    if (!departure) controls.update();

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
    dismissPreloader();
  } else {
    rafId = requestAnimationFrame(loop);
    dismissPreloader();
  }

  window.addEventListener("resize", () => {
    camera.aspect = Math.max(window.innerWidth / window.innerHeight, 0.001);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

if (bgCanvas) {
  initNeuralBackground(bgCanvas)
    .catch((err) => {
      console.warn("[hero] WebGL / Three.js não disponível — fundo desativado.", err);
    })
    .finally(dismissPreloader);
} else {
  dismissPreloader();
}
