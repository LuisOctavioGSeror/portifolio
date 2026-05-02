/* ============================================================
   beam.js — feixe de luz (canvas 2D) na overview / contact
   Endurecido: contexto nulo, dimensões zero, pause em segundo
   plano, try/catch no desenho.
   ============================================================ */
(function () {
  const canvas = document.getElementById("beam-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    canvas.style.display = "none";
    return;
  }

  const section = canvas.closest(".hero-section, .beam-container");
  if (!section) return;

  const BEAM_OPACITY = 0.68;

  let W = 8;
  let H = 8;
  let time = 0;
  let sparks = [];
  let embers = [];
  let tA = 0;
  let tB = 0;
  let tC = 0;
  let tD = 0;

  let gradBg = null;
  let gradMg = null;
  let gradFt = null;
  let gradFb = null;

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

  const isContact = section.classList.contains("contact-beam-bg");
  const BX = isMobile ? 0.55 : isContact ? 0.45 : 0.525;

  const CFG = isMobile
    ? {
        STEPS: 45,
        MAX_SPARKS: 64,
        MAX_EMBERS: 48,
        LAYER_START: 3,
        FPS_LIMIT: 30,
      }
    : {
        STEPS: 70,
        MAX_SPARKS: 140,
        MAX_EMBERS: 96,
        LAYER_START: 0,
        FPS_LIMIT: 60,
      };

  const FRAME_MIN_MS = 1000 / CFG.FPS_LIMIT;
  let lastFrameTs = 0;

  const STEPS = CFG.STEPS;
  const pathX = new Float32Array(STEPS + 1);
  const pathY = new Float32Array(STEPS + 1);

  let running = document.visibilityState === "visible";
  let rafId = 0;

  function readSize() {
    const rw = section.offsetWidth || section.clientWidth || 0;
    const rh = section.offsetHeight || section.clientHeight || 0;
    return {
      w: Math.max(8, Math.floor(rw)),
      h: Math.max(8, Math.floor(rh)),
    };
  }

  function resize() {
    try {
      const { w, h } = readSize();
      W = w;
      H = h;
      canvas.width = W;
      canvas.height = H;

      gradBg = ctx.createRadialGradient(W * BX, H, 0, W * BX, H, W * 0.6);
      gradBg.addColorStop(0.0, "rgba(200,200,210,0.38)");
      gradBg.addColorStop(0.4, "rgba(110,110,120,0.06)");
      gradBg.addColorStop(1.0, "rgba(0,0,0,0)");

      gradMg = ctx.createRadialGradient(
        W * BX,
        H * 0.6,
        0,
        W * BX,
        H * 0.6,
        W * 0.35
      );
      gradMg.addColorStop(0.0, "rgba(170,170,180,0.09)");
      gradMg.addColorStop(1.0, "rgba(0,0,0,0)");

      gradFt = ctx.createLinearGradient(0, 0, 0, H * 0.3);
      gradFt.addColorStop(0.0, "rgba(11,11,11,0.96)");
      gradFt.addColorStop(1.0, "rgba(11,11,11,0)");

      gradFb = ctx.createLinearGradient(0, H * 0.78, 0, H);
      gradFb.addColorStop(0.0, "rgba(11,11,11,0)");
      gradFb.addColorStop(1.0, "rgba(11,11,11,0.88)");

      initSparks();
      initEmbers();
    } catch (e) {
      console.warn("[beam] resize falhou:", e);
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      canvas.style.display = "none";
    }
  }

  function beamX(y) {
    const t = y / H;
    const amp = W * 0.022 * t ** 0.55;
    return (
      W * BX +
      amp *
        (Math.sin(t * 5.2 + tA) * 0.4 +
          Math.sin(t * 2.4 - tB) * 0.28 +
          Math.sin(t * 10.1 + tC) * 0.18 +
          Math.sin(t * 1.7 - tD) * 0.14)
    );
  }

  function drawPath() {
    ctx.beginPath();
    ctx.moveTo(pathX[0], pathY[0]);
    for (let i = 1; i <= STEPS; i++) ctx.lineTo(pathX[i], pathY[i]);
  }

  function makeSpark() {
    return {
      y: H * (0.35 + Math.random() * 0.65),
      speed: 0.5 + Math.random() * 1.1,
      length: 6 + Math.random() * 28,
      spread: (Math.random() - 0.5) * W * 0.22,
      alpha: 0.65 + Math.random() * 0.35,
      width: 0.5 + Math.random() * 1.1,
    };
  }

  function initSparks() {
    sparks = [];
    const n = Math.min(CFG.MAX_SPARKS, Math.floor((W * H) / 6500));
    for (let i = 0; i < n; i++) {
      const s = makeSpark();
      s.y = Math.random() * H;
      sparks.push(s);
    }
  }

  function updateSparks() {
    for (let i = 0; i < sparks.length; i++) {
      sparks[i].y -= sparks[i].speed;
      if (sparks[i].y + sparks[i].length < 0) sparks[i] = makeSpark();
    }
  }

  function drawSparks() {
    const pulse = 0.8 + 0.2 * Math.sin(time * 1.1);
    ctx.lineCap = "round";
    ctx.shadowBlur = 0;
    for (let i = 0; i < sparks.length; i++) {
      const s = sparks[i];
      const px = beamX(s.y) + s.spread;
      const a = s.alpha * pulse;
      ctx.lineWidth = s.width;
      ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.moveTo(px, s.y + s.length * 0.5);
      ctx.lineTo(px, s.y - s.length * 0.5);
      ctx.stroke();
    }
  }

  function makeEmber() {
    const t = Math.random();
    return {
      x: W * BX + (Math.random() - 0.5) * W * 0.85 * t,
      y: H * t,
      vy: -(0.06 + Math.random() * 0.18),
      vx: (Math.random() - 0.5) * 0.08,
      size: 0.5 + Math.random() * 1.8,
      life: Math.random(),
      maxL: 0.4 + Math.random() * 0.6,
      alpha: 0,
    };
  }

  function initEmbers() {
    embers = [];
    const n = Math.min(CFG.MAX_EMBERS, Math.floor((W * H) / 8500));
    for (let i = 0; i < n; i++) {
      const e = makeEmber();
      e.life = Math.random() * e.maxL;
      embers.push(e);
    }
  }

  function updateEmbers() {
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      e.x += e.vx;
      e.y += e.vy;
      e.life += 0.003;
      const r = e.life / e.maxL;
      e.alpha = r < 0.2 ? r / 0.2 : r > 0.75 ? (1 - r) / 0.25 : 1;
      if (e.life >= e.maxL || e.y < 0) embers[i] = makeEmber();
    }
  }

  function drawEmbers() {
    const gp = 0.75 + 0.25 * Math.sin(time * 0.7);
    ctx.shadowBlur = 0;
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      const a = e.alpha * 0.82 * gp;
      if (a < 0.02) continue;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,220,230,${a.toFixed(2)})`;
      ctx.fill();
    }
  }

  function drawBeam() {
    const pulse = 0.88 + 0.12 * Math.sin(time * 1.15);

    for (let i = 0; i <= STEPS; i++) {
      pathY[i] = (H * i) / STEPS;
      pathX[i] = beamX(pathY[i]);
    }

    ctx.fillStyle = gradBg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = gradMg;
    ctx.fillRect(0, 0, W, H);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 0;
    const p = pulse;
    const layers = [
      [W * 0.22, 0.03 * p],
      [W * 0.13, 0.05 * p],
      [W * 0.075, 0.085 * p],
      [W * 0.04, 0.13 * p],
      [W * 0.026, 0.17 * p],
      [W * 0.016, 0.25 * p],
      [W * 0.009, 0.37 * p],
      [W * 0.004, 0.6 * p],
      [3.5, 0.86 * p],
      [1.5, 1.0],
    ];
    const colors = [
      "130,130,140",
      "160,160,170",
      "190,190,200",
      "215,215,220",
      "228,228,235",
      "238,238,244",
      "245,245,248",
      "255,255,255",
      "255,255,255",
      "255,255,255",
    ];
    for (let i = CFG.LAYER_START; i < layers.length; i++) {
      ctx.lineWidth = layers[i][0];
      ctx.strokeStyle = `rgba(${colors[i]},${layers[i][1].toFixed(3)})`;
      drawPath();
      ctx.stroke();
    }

    ctx.fillStyle = gradFt;
    ctx.fillRect(0, 0, W, H * 0.3);
    ctx.fillStyle = gradFb;
    ctx.fillRect(0, H * 0.78, W, H * 0.22);
  }

  function frame(timestamp) {
    if (!running) {
      rafId = 0;
      return;
    }

    rafId = requestAnimationFrame(frame);

    if (timestamp - lastFrameTs < FRAME_MIN_MS) return;
    lastFrameTs = timestamp;

    const { w, h } = readSize();
    if (w !== W || h !== H) resize();
    if (W < 8 || H < 8 || !gradBg) return;

    try {
      time += isMobile ? 0.032 : 0.016;
      tA = time * 1.5;
      tB = time * 0.8;
      tC = time * 2.3;
      tD = time * 0.4;

      ctx.clearRect(0, 0, W, H);

      ctx.globalAlpha = BEAM_OPACITY;
      drawBeam();
      ctx.globalAlpha = 1;

      updateSparks();
      drawSparks();
      updateEmbers();
      drawEmbers();
    } catch (e) {
      console.warn("[beam] frame:", e);
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      canvas.style.display = "none";
    }
  }

  function startLoop() {
    if (rafId || !running) return;
    rafId = requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", () => {
    running = document.visibilityState === "visible";
    if (running) {
      lastFrameTs = 0;
      startLoop();
    } else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  });

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(section);
  } else {
    window.addEventListener("resize", resize);
  }

  resize();
  if (running && ctx && gradBg) {
    startLoop();
  }
})();
