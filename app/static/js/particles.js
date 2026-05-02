/* ============================================================
   particles.js — embers flutuantes para todas as páginas
   exceto hero e overview. Canvas fixo, mix-blend-mode: screen.
   ============================================================ */
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, time = 0;
  let embers = [];

  /* Altura estimada do footer — fade começa acima dele */
  const FOOTER_FADE = 160;

  /* ── Config adaptativa ── */
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
                    .test(navigator.userAgent) || window.innerWidth < 768;

  const CFG = isMobile ? {
    MAX_EMBERS : 45,
    FPS_LIMIT  : 30,
  } : {
    MAX_EMBERS : 90,
    FPS_LIMIT  : 60,
  };

  const FRAME_MIN_MS = 1000 / CFG.FPS_LIMIT;
  let   lastFrameTs  = 0;

  /* Gradiente de fade inferior — recriado só no resize */
  let gradFade = null;

  /* ── Resize ── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;

    /* Fade que cobre o footer */
    gradFade = ctx.createLinearGradient(0, H - FOOTER_FADE, 0, H);
    gradFade.addColorStop(0.0, 'rgba(0,0,0,0)');
    gradFade.addColorStop(1.0, 'rgba(0,0,0,1)');

    initEmbers();
  }

  /* ── Embers ── */
  function makeEmber() {
    return {
      x    : Math.random() * W,
      y    : Math.random() * H,
      vy   : -(0.04 + Math.random() * 0.12),
      vx   : (Math.random() - 0.5) * 0.05,
      size : 0.5 + Math.random() * 1.6,
      life : Math.random(),
      maxL : 0.5 + Math.random() * 0.5,
      alpha: 0,
    };
  }

  function initEmbers() {
    embers = [];
    const n = Math.min(CFG.MAX_EMBERS, Math.floor(W * H / 10000));
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
      e.life += 0.0015;
      const r = e.life / e.maxL;
      e.alpha = r < 0.2 ? r / 0.2 : r > 0.75 ? (1 - r) / 0.25 : 1;
      if (e.life >= e.maxL || e.y < 0) {
        embers[i] = makeEmber();
        embers[i].y = H * (0.2 + Math.random() * 0.8);
      }
    }
  }

  function drawEmbers() {
    const gp = 0.7 + 0.3 * Math.sin(time * 0.5);
    ctx.shadowBlur = 0;
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      const a = e.alpha * 0.65 * gp;
      if (a < 0.02) continue;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,205,220,${a.toFixed(2)})`;
      ctx.fill();
    }
  }

  /* ── Loop ── */
  function frame(timestamp) {
    requestAnimationFrame(frame);

    if (timestamp - lastFrameTs < FRAME_MIN_MS) return;
    lastFrameTs = timestamp;

    time += isMobile ? 0.025 : 0.012;

    ctx.clearRect(0, 0, W, H);

    /* Restringe desenho à área acima do footer */
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H - FOOTER_FADE);
    ctx.clip();

    updateEmbers();
    drawEmbers();

    ctx.restore();
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();
