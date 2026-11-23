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

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

  const isOverview = section.classList.contains("hero-section");
  const isContact = section.classList.contains("contact-beam-bg");
  const horizontal = isMobile && isOverview;
  let host = section;

  if (horizontal) {
    const slot = document.querySelector(".hero-title__beam");
    if (slot) {
      slot.appendChild(canvas);
      host = slot;
    }
  }

  const BX = isMobile
    ? isOverview
      ? 0.92
      : 0.55
    : isContact
      ? 0.45
      : 0.525;

  const CFG = isMobile
    ? isOverview
      ? {
          STEPS: 50,
          MAX_SPARKS: 52,
          MAX_EMBERS: 40,
          LAYER_START: 0,
          FPS_LIMIT: 30,
          BEAM_WIDTH_SCALE: 1,
          LAYER_MINS: [62, 40, 26, 16, 10, 7, 5, 3, 4.5, 3],
          BEAM_OPACITY: 0.9,
          GLOW_RADIUS: 0.78,
          WAVE_AMP: 0.016,
          CORE_WIDTH: 5.5,
          CORE_INNER: 3.5,
        }
      : {
          STEPS: 45,
          MAX_SPARKS: 64,
          MAX_EMBERS: 48,
          LAYER_START: 0,
          FPS_LIMIT: 30,
          BEAM_WIDTH_SCALE: 1.2,
          LAYER_MINS: [48, 30, 18, 10, 6, 4, 3, 2, 3.5, 2],
          BEAM_OPACITY: 0.72,
          GLOW_RADIUS: 0.65,
          WAVE_AMP: 0.022,
          CORE_WIDTH: 4,
          CORE_INNER: 2.5,
        }
    : {
        STEPS: 70,
        MAX_SPARKS: 140,
        MAX_EMBERS: 96,
        LAYER_START: 0,
        FPS_LIMIT: 60,
        BEAM_WIDTH_SCALE: 1,
        LAYER_MINS: null,
        BEAM_OPACITY: 0.68,
        GLOW_RADIUS: 0.6,
        WAVE_AMP: 0.022,
        CORE_WIDTH: 3.5,
        CORE_INNER: 1.5,
      };

  const BEAM_OPACITY = CFG.BEAM_OPACITY;

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

  const FRAME_MIN_MS = 1000 / CFG.FPS_LIMIT;
  let lastFrameTs = 0;

  const STEPS = CFG.STEPS;
  const pathX = new Float32Array(STEPS + 1);
  const pathY = new Float32Array(STEPS + 1);

  let running = document.visibilityState === "visible";
  let rafId = 0;

  function readSize() {
    const rw = host.offsetWidth || host.clientWidth || 0;
    const rh = host.offsetHeight || host.clientHeight || 0;
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

      gradBg = ctx.createRadialGradient(W * BX, H, 0, W * BX, H, W * CFG.GLOW_RADIUS);
      gradBg.addColorStop(
        0.0,
        isMobile && isOverview ? "rgba(220,175,90,0.68)" : "rgba(220,175,90,0.55)"
      );
      gradBg.addColorStop(0.4, isMobile && isOverview ? "rgba(150,110,45,0.18)" : "rgba(150,110,45,0.12)");
      gradBg.addColorStop(1.0, "rgba(0,0,0,0)");

      const midRadius = isOverview ? (isMobile ? 0.62 : 0.52) : 0.35;
      const midY = isOverview ? 0.48 : 0.6;
      gradMg = ctx.createRadialGradient(W * BX, H * midY, 0, W * BX, H * midY, W * midRadius);
      gradMg.addColorStop(
        0.0,
        isOverview ? "rgba(120, 86, 36, 0.16)" : "rgba(230,185,80,0.18)"
      );
      gradMg.addColorStop(1.0, "rgba(0,0,0,0)");

      gradFt = ctx.createLinearGradient(0, 0, 0, H * 0.3);
      gradFt.addColorStop(0.0, isMobile && isOverview ? "rgba(11,11,11,0.82)" : "rgba(11,11,11,0.96)");
      gradFt.addColorStop(1.0, "rgba(11,11,11,0)");

      const bottomFade = 0.04;
      gradFb = ctx.createLinearGradient(0, H * (1 - bottomFade), 0, H);
      gradFb.addColorStop(0.0, "rgba(11,11,11,0)");
      gradFb.addColorStop(1.0, "rgba(11,11,11,0.45)");

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

  function wave(t) {
    const amp = (horizontal ? H * 0.16 : W * CFG.WAVE_AMP * t ** 0.55);
    return (
      amp *
      (Math.sin(t * 5.2 + tA) * 0.4 +
        Math.sin(t * 2.4 - tB) * 0.28 +
        Math.sin(t * 10.1 + tC) * 0.18 +
        Math.sin(t * 1.7 - tD) * 0.14)
    );
  }

  function beamX(y) {
    const t = y / H;
    return W * BX + wave(t);
  }

  function beamY(x) {
    const t = x / W;
    return H * 0.5 + wave(t);
  }

  function drawPath() {
    ctx.beginPath();
    ctx.moveTo(pathX[0], pathY[0]);
    for (let i = 1; i <= STEPS; i++) ctx.lineTo(pathX[i], pathY[i]);
  }

  function makeSpark() {
    if (horizontal) {
      return {
        x: Math.random() * W,
        speed: 0.55 + Math.random() * 1.35,
        length: 8 + Math.random() * 26,
        spread: (Math.random() - 0.5) * H * 0.42,
        alpha: 0.65 + Math.random() * 0.35,
        width: 0.6 + Math.random() * 1.1,
      };
    }
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
    const n = horizontal
      ? 24
      : Math.min(CFG.MAX_SPARKS, Math.floor((W * H) / 6500));
    for (let i = 0; i < n; i++) {
      const s = makeSpark();
      if (horizontal) s.x = Math.random() * W;
      else s.y = Math.random() * H;
      sparks.push(s);
    }
  }

  function updateSparks() {
    for (let i = 0; i < sparks.length; i++) {
      if (horizontal) {
        sparks[i].x += sparks[i].speed;
        if (sparks[i].x - sparks[i].length > W) sparks[i] = makeSpark();
      } else {
        sparks[i].y -= sparks[i].speed;
        if (sparks[i].y + sparks[i].length < 0) sparks[i] = makeSpark();
      }
    }
  }

  function drawSparks() {
    const pulse = 0.8 + 0.2 * Math.sin(time * 1.1);
    ctx.lineCap = "round";
    ctx.shadowBlur = 0;
    for (let i = 0; i < sparks.length; i++) {
      const s = sparks[i];
      const a = s.alpha * pulse;
      ctx.lineWidth = s.width;
      ctx.strokeStyle = `rgba(255,230,140,${a.toFixed(2)})`;
      ctx.beginPath();
      if (horizontal) {
        const py = beamY(s.x) + s.spread;
        ctx.moveTo(s.x - s.length * 0.5, py);
        ctx.lineTo(s.x + s.length * 0.5, py);
      } else {
        const px = beamX(s.y) + s.spread;
        ctx.moveTo(px, s.y + s.length * 0.5);
        ctx.lineTo(px, s.y - s.length * 0.5);
      }
      ctx.stroke();
    }
  }

  function makeEmber() {
    const t = Math.random();
    if (horizontal) {
      return {
        x: W * t,
        y: H * 0.5 + (Math.random() - 0.5) * H * 0.55,
        vx: 0.08 + Math.random() * 0.22,
        vy: (Math.random() - 0.5) * 0.06,
        size: 0.5 + Math.random() * 1.6,
        life: Math.random(),
        maxL: 0.4 + Math.random() * 0.6,
        alpha: 0,
      };
    }
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
    const n = horizontal
      ? 16
      : Math.min(CFG.MAX_EMBERS, Math.floor((W * H) / 8500));
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
      if (horizontal) {
        if (e.x > W || e.life >= e.maxL) embers[i] = makeEmber();
      } else if (e.life >= e.maxL || e.y < 0) {
        embers[i] = makeEmber();
      }
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
      ctx.fillStyle = `rgba(240,200,100,${a.toFixed(2)})`;
      ctx.fill();
    }
  }

  const haloSprite = createSoftGlow([
    [0, "rgba(255, 176, 48, 0.7)"],
    [0.28, "rgba(214, 132, 28, 0.34)"],
    [0.58, "rgba(168, 96, 18, 0.1)"],
    [1, "rgba(120, 64, 8, 0)"],
  ]);
  const bodySprite = createSoftGlow([
    [0, "rgba(255, 252, 242, 1)"],
    [0.1, "rgba(255, 228, 150, 0.96)"],
    [0.24, "rgba(255, 188, 62, 0.78)"],
    [0.46, "rgba(232, 146, 32, 0.36)"],
    [0.72, "rgba(186, 108, 18, 0.08)"],
    [1, "rgba(140, 76, 10, 0)"],
  ]);

  function createSoftGlow(stops) {
    const size = 128;
    const sprite = document.createElement("canvas");
    sprite.width = size;
    sprite.height = size;
    const g = sprite.getContext("2d");
    if (!g) return sprite;
    const radius = size / 2;
    const grad = g.createRadialGradient(radius, radius, 0, radius, radius, radius);
    for (let i = 0; i < stops.length; i++) grad.addColorStop(stops[i][0], stops[i][1]);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return sprite;
  }

  function stampGlow(sprite, diameter, spacing, alpha, breath) {
    const length = horizontal ? W : H;
    const stamps = Math.max(2, Math.ceil(length / spacing));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha;
    for (let i = 0; i <= stamps; i++) {
      const along = (length * i) / stamps;
      const width = breath ? diameter * breath(along) : diameter;
      const half = width / 2;
      const x = horizontal ? along : beamX(along);
      const y = horizontal ? beamY(along) : along;
      ctx.drawImage(sprite, x - half, y - half, width, width);
    }
    ctx.restore();
  }

  function overviewBreath(y) {
    const t = y / H;
    const open = Math.exp(-((t - 0.4) * (t - 0.4)) / 0.02);
    return 1 + open * 0.7;
  }

  function drawBeam() {
    const pulse = 0.88 + 0.12 * Math.sin(time * 1.15);
    const scale = CFG.BEAM_WIDTH_SCALE;

    for (let i = 0; i <= STEPS; i++) {
      if (horizontal) {
        pathX[i] = (W * i) / STEPS;
        pathY[i] = beamY(pathX[i]);
      } else {
        pathY[i] = (H * i) / STEPS;
        pathX[i] = beamX(pathY[i]);
      }
    }

    if (!horizontal) {
      ctx.fillStyle = gradBg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = gradMg;
      ctx.fillRect(0, 0, W, H);
    }

    const haloSize = horizontal
      ? H * 0.96
      : Math.max(isMobile ? 128 : 150, W * 0.16 * scale);
    const bodySize = horizontal
      ? H * 0.46
      : Math.max(isMobile ? 54 : 64, W * 0.072 * scale);
    stampGlow(
      haloSprite,
      haloSize,
      horizontal ? 10 : isMobile ? 20 : 16,
      0.11 * pulse,
      !horizontal && isOverview ? overviewBreath : null
    );
    stampGlow(
      bodySprite,
      bodySize,
      horizontal ? 7 : isMobile ? 12 : 9,
      (horizontal ? 0.28 : 0.2) * pulse
    );

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = `rgba(255, 196, 72, ${(0.95 * pulse).toFixed(3)})`;
    ctx.shadowBlur = horizontal ? 12 : isMobile ? 16 : 20;
    ctx.lineWidth = horizontal ? Math.max(2.4, H * 0.045) : Math.max(CFG.CORE_WIDTH, 4.5);
    ctx.strokeStyle = `rgba(255, 248, 220, ${pulse.toFixed(3)})`;
    ctx.globalAlpha = 1;
    drawPath();
    ctx.stroke();
    ctx.restore();

    if (horizontal) {
      const edge = ctx.createLinearGradient(0, 0, W, 0);
      edge.addColorStop(0, "rgba(11,11,11,0.96)");
      edge.addColorStop(0.14, "rgba(11,11,11,0)");
      edge.addColorStop(0.86, "rgba(11,11,11,0)");
      edge.addColorStop(1, "rgba(11,11,11,0.96)");
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = gradFt;
      ctx.fillRect(0, 0, W, H * 0.3);
      ctx.fillStyle = gradFb;
      ctx.fillRect(0, H * 0.96, W, H * 0.04);
    }
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
    ro.observe(host);
  } else {
    window.addEventListener("resize", resize);
  }

  resize();
  if (running && ctx && gradBg) {
    startLoop();
  }
})();
