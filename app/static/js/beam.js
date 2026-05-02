/* ============================================================
   beam.js — feixe de luz para a hero section do overview
   Adaptado para: canvas contido na .hero-section, feixe
   deslocado levemente à direita (entre os dois blocos),
   opacidade reduzida para não competir com o conteúdo.
   ============================================================ */
(function () {
  const canvas  = document.getElementById('beam-canvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  const section = canvas.closest('.hero-section');
  if (!section) return;

  /* Opacidade global do feixe — reduzida para ser ambientação,
     não protagonista. Partículas mantêm opacidade própria. */
  const BEAM_OPACITY = 0.68;

  let W, H, time = 0;
  let sparks = [], embers = [];
  let tA = 0, tB = 0, tC = 0, tD = 0;

  /* ──────────────────────────────────────────
     Detecção de dispositivo + config adaptativa
  ────────────────────────────────────────── */
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
                    .test(navigator.userAgent) || window.innerWidth < 768;

  /* Posição horizontal do feixe — declarado após isMobile */
  const BX = isMobile ? 0.55 : 0.525;

  const CFG = isMobile ? {
    STEPS      : 45,
    MAX_SPARKS : 80,
    MAX_EMBERS : 60,
    LAYER_START: 3,    // pula as 3 camadas mais largas no mobile
    FPS_LIMIT  : 30,
  } : {
    STEPS      : 75,
    MAX_SPARKS : 180,
    MAX_EMBERS : 120,
    LAYER_START: 0,
    FPS_LIMIT  : 60,
  };

  const FRAME_MIN_MS = 1000 / CFG.FPS_LIMIT;
  let   lastFrameTs  = 0;

  /* ──────────────────────────────────────────
     Resize — observa a seção, não a janela
  ────────────────────────────────────────── */
  function resize() {
    W = canvas.width  = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
    initSparks();
    initEmbers();
  }

  /* Arrays pré-alocados — sem GC por frame */
  const STEPS = CFG.STEPS;
  const pathX = new Float32Array(STEPS + 1);
  const pathY = new Float32Array(STEPS + 1);

  /* ──────────────────────────────────────────
     Beam path — ondulação turbulenta de baixo p/ cima
  ────────────────────────────────────────── */
  function beamX(y) {
    const t   = y / H;
    const amp = W * 0.022 * (t ** 0.55);
    return W * BX + amp * (
      Math.sin(t * 5.2  + tA) * 0.40 +
      Math.sin(t * 2.4  - tB) * 0.28 +
      Math.sin(t * 10.1 + tC) * 0.18 +
      Math.sin(t * 1.7  - tD) * 0.14
    );
  }

  /* ──────────────────────────────────────────
     Sparks — streaks rápidos subindo
  ────────────────────────────────────────── */
  function makeSpark() {
    return {
      y      : H * (0.35 + Math.random() * 0.65),
      speed  : 0.5 + Math.random() * 1.1,
      length : 6   + Math.random() * 28,
      spread : (Math.random() - 0.5) * W * 0.22,
      alpha  : 0.65 + Math.random() * 0.35,
      width  : 0.5  + Math.random() * 1.1,
    };
  }

  function initSparks() {
    sparks = [];
    const n = Math.min(CFG.MAX_SPARKS, Math.floor(W * H / 6000));
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
    ctx.lineCap    = 'round';
    ctx.shadowBlur = 0;
    for (let i = 0; i < sparks.length; i++) {
      const s  = sparks[i];
      const px = beamX(s.y) + s.spread;
      const a  = s.alpha * pulse;
      ctx.lineWidth   = s.width;
      ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.moveTo(px, s.y + s.length * 0.5);
      ctx.lineTo(px, s.y - s.length * 0.5);
      ctx.stroke();
    }
  }

  /* ──────────────────────────────────────────
     Embers — pontinhos flutuantes
  ────────────────────────────────────────── */
  function makeEmber() {
    const t = Math.random();
    return {
      x    : W * BX + (Math.random() - 0.5) * W * 0.85 * t,
      y    : H * t,
      vy   : -(0.06 + Math.random() * 0.18),
      vx   : (Math.random() - 0.5) * 0.08,
      size : 0.5 + Math.random() * 1.8,
      life : Math.random(),
      maxL : 0.4 + Math.random() * 0.6,
      alpha: 0,
    };
  }

  function initEmbers() {
    embers = [];
    const n = Math.min(CFG.MAX_EMBERS, Math.floor(W * H / 8000));
    for (let i = 0; i < n; i++) {
      const e = makeEmber();
      e.life = Math.random() * e.maxL;
      embers.push(e);
    }
  }

  function updateEmbers() {
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      e.x += e.vx; e.y += e.vy; e.life += 0.003;
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

  /* ──────────────────────────────────────────
     Beam principal
  ────────────────────────────────────────── */
  function drawBeam() {
    const pulse = 0.88 + 0.12 * Math.sin(time * 1.15);

    for (let i = 0; i <= STEPS; i++) {
      pathY[i] = H * i / STEPS;
      pathX[i] = beamX(pathY[i]);
    }

    const drawPath = () => {
      ctx.beginPath();
      ctx.moveTo(pathX[0], pathY[0]);
      for (let i = 1; i <= STEPS; i++) ctx.lineTo(pathX[i], pathY[i]);
    };

    /* --- Glow base (centrado no BX) --- */
    const bg = ctx.createRadialGradient(W * BX, H, 0, W * BX, H, W * 0.60);
    bg.addColorStop(0.00, `rgba(200,200,210,${(0.40 * pulse).toFixed(3)})`);
    bg.addColorStop(0.40, `rgba(110,110,120,${(0.06 * pulse).toFixed(3)})`);
    bg.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* --- Glow médio --- */
    const mg = ctx.createRadialGradient(W * BX, H * 0.6, 0, W * BX, H * 0.6, W * 0.35);
    mg.addColorStop(0.00, `rgba(170,170,180,${(0.10 * pulse).toFixed(3)})`);
    mg.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = mg;
    ctx.fillRect(0, 0, W, H);

    /* --- Camadas do feixe (sem shadowBlur) --- */
    ctx.lineCap    = 'round';
    ctx.lineJoin   = 'round';
    ctx.shadowBlur = 0;
    const p = pulse;
    const layers = [
      [W*0.220, `rgba(130,130,140,${(0.030*p).toFixed(3)})`],
      [W*0.130, `rgba(160,160,170,${(0.050*p).toFixed(3)})`],
      [W*0.075, `rgba(190,190,200,${(0.085*p).toFixed(3)})`],
      [W*0.040, `rgba(215,215,220,${(0.130*p).toFixed(3)})`],
      [W*0.026, `rgba(228,228,235,${(0.170*p).toFixed(3)})`],
      [W*0.016, `rgba(238,238,244,${(0.250*p).toFixed(3)})`],
      [W*0.009, `rgba(245,245,248,${(0.370*p).toFixed(3)})`],
      [W*0.004, `rgba(255,255,255,${(0.600*p).toFixed(3)})`],
      [3.5,     `rgba(255,255,255,${(0.860*p).toFixed(3)})`],
      [1.5,     'rgba(255,255,255,1)'],
    ];
    for (let i = CFG.LAYER_START; i < layers.length; i++) {
      ctx.lineWidth   = layers[i][0];
      ctx.strokeStyle = layers[i][1];
      drawPath();
      ctx.stroke();
    }

    /* --- Fade no topo — usa a cor exata de fundo do site (#0b0b0b) --- */
    const ft = ctx.createLinearGradient(0, 0, 0, H * 0.30);
    ft.addColorStop(0.0, 'rgba(11,11,11,0.96)');
    ft.addColorStop(1.0, 'rgba(11,11,11,0)');
    ctx.fillStyle = ft;
    ctx.fillRect(0, 0, W, H * 0.30);

    /* --- Fade na base --- */
    const fb = ctx.createLinearGradient(0, H * 0.78, 0, H);
    fb.addColorStop(0.0, 'rgba(11,11,11,0)');
    fb.addColorStop(1.0, 'rgba(11,11,11,0.88)');
    ctx.fillStyle = fb;
    ctx.fillRect(0, H * 0.78, W, H * 0.22);
  }

  /* ──────────────────────────────────────────
     Loop principal
  ────────────────────────────────────────── */
  function frame(timestamp) {
    requestAnimationFrame(frame);

    if (timestamp - lastFrameTs < FRAME_MIN_MS) return;
    lastFrameTs = timestamp;

    time += isMobile ? 0.032 : 0.016;
    tA = time * 1.50; tB = time * 0.80;
    tC = time * 2.30; tD = time * 0.40;

    ctx.clearRect(0, 0, W, H);

    /* Beam com opacidade reduzida — ambientação, não protagonista */
    ctx.globalAlpha = BEAM_OPACITY;
    drawBeam();
    ctx.globalAlpha = 1.0;

    /* Partículas com opacidade própria (não afetadas pelo BEAM_OPACITY) */
    updateSparks(); drawSparks();
    updateEmbers(); drawEmbers();
  }

  /* ──────────────────────────────────────────
     Init
  ────────────────────────────────────────── */
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(section);
  } else {
    window.addEventListener('resize', resize);
  }

  resize();
  requestAnimationFrame(frame);
})();
