// Mobile navigation toggle
const navToggle = document.querySelector(".nav-toggle");
const header = document.querySelector(".site-header");

if (navToggle && header) {
  navToggle.addEventListener("click", () => {
    header.classList.toggle("nav-open");
  });
}

// Close mobile nav on link click
const navLinks = document.querySelectorAll(".navbar a");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (header && header.classList.contains("nav-open")) {
      header.classList.remove("nav-open");
    }
  });
});

(function () {
  if (document.querySelector(".index-value-bridge")) {
    document.documentElement.classList.add("js-bridge-animate");
  }
})();

// Contact form handling (same footer reused across pages) — submit to Formspree
const contactForm = document.querySelector("#contact-form");
const statusEl = document.querySelector("#form-status");
const FORMSPREE_URL = "https://formspree.io/f/meerankb";

function setStatus(text, isError) {
  if (statusEl) {
    statusEl.textContent = text;
    statusEl.classList.remove(isError ? "success" : "error");
    statusEl.classList.add(isError ? "error" : "success");
  } else {
    alert(text);
  }
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();

    if (!name || !email || !message) {
      setStatus("Please fill in all required fields.", true);
      return;
    }

    setStatus("Sending…", false);

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("Message sent. I'll get back to you soon.", false);
        contactForm.reset();
      } else {
        setStatus(data.error || "Something went wrong. Please try again.", true);
      }
    } catch (_) {
      setStatus("Network error. Please try again.", true);
    }
  });
}

/* ── About page — sequência: header → bio palavra a palavra → cards ── */
(function () {
  const bioSection = document.getElementById('about-bio');
  const cardsGrid  = document.getElementById('about-cards');
  if (!bioSection || !cardsGrid) return;

  /* Bloqueia os cards até a sequência terminar */
  cardsGrid.querySelectorAll('.card').forEach(c => c.classList.add('card--hold'));

  /* Quebra um elemento em spans por palavra */
  function wrapWords(el) {
    const text  = el.textContent.trim();
    const words = text.split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className   = 'about-word';
      span.textContent = w;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return el.querySelectorAll('.about-word');
  }

  const title  = bioSection.querySelector('.project-section-title');
  const body   = bioSection.querySelector('.project-section-text');
  const titleWords = title ? wrapWords(title) : [];
  const bodyWords  = body  ? wrapWords(body)  : [];
  const allWords   = [...titleWords, ...bodyWords];

  /* Header termina em ~1s (0.1s delay + 0.9s duration) */
  const HEADER_END = 1000;
  const WORD_STEP  = 130;
  const WORD_DONE  = HEADER_END + allWords.length * WORD_STEP + 600;

  /* Anima as palavras após o header */
  allWords.forEach((span, i) => {
    span.style.animationDelay = `${HEADER_END + i * WORD_STEP}ms`;
  });

  /* Após as palavras, anima os cards em sequência */
  setTimeout(() => {
    const cards = [...cardsGrid.querySelectorAll('.card')];
    cards.forEach((c, i) => {
      setTimeout(() => {
        c.classList.remove('card--hold');
        c.classList.add('card--visible');
      }, i * 360);
    });
  }, WORD_DONE);
})();

/* ── Contact page — header fade → pitch palavra a palavra → formulário ── */
(function () {
  const pitchEl = document.getElementById("contact-pitch-text");
  const formPanel = document.getElementById("contact-form-panel");
  if (!pitchEl || !formPanel) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wrapWords(el, klass) {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.textContent = "";
    words.forEach((w, i) => {
      const span = document.createElement("span");
      span.className = klass;
      span.textContent = w;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return [...el.querySelectorAll("." + klass)];
  }

  if (reduced) {
    formPanel.classList.remove("contact-form-panel--hold");
    formPanel.classList.add("contact-form-panel--visible");
    return;
  }

  const wordSpans = wrapWords(pitchEl, "contact-word");
  const HEADER_END = 1000;
  const WORD_STEP = 130;
  const TAIL_MS = 520;
  const WORD_DONE = HEADER_END + wordSpans.length * WORD_STEP + TAIL_MS;

  wordSpans.forEach((span, i) => {
    span.style.animationDelay = `${HEADER_END + i * WORD_STEP}ms`;
  });

  window.setTimeout(() => {
    formPanel.classList.remove("contact-form-panel--hold");
    formPanel.classList.add("contact-form-panel--visible");
  }, WORD_DONE);
})();

(function () {
  const wrapSection = document.getElementById("overview-featured-section");
  const intro = document.getElementById("overview-featured-intro");
  const heading = document.getElementById("overview-featured-heading");
  const grid = document.getElementById("index-featured-projects");
  if (!wrapSection || !intro || !heading || !grid || !window.IntersectionObserver) return;

  grid.querySelectorAll(".card").forEach((c) => {
    c.classList.remove("card--anim");
    c.classList.add("card--hold");
  });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Depois do fade do subtítulo/map (~3.73s) + reveal do marquee (~4–4.45s) */
  const HERO_INTRO_MS = 4750;

  let heroIntroDone = false;
  let inView = false;
  let sequenceStarted = false;
  let observer = null;

  function wrapWords(el) {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.textContent = "";
    words.forEach((w, i) => {
      const span = document.createElement("span");
      span.className = "about-word";
      span.textContent = w;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return [...el.querySelectorAll(".about-word")];
  }

  function runSequence() {
    if (sequenceStarted) return;
    sequenceStarted = true;
    if (observer) observer.disconnect();

    intro.classList.add("overview-featured-intro--started");

    if (reduced) {
      const cards = [...grid.querySelectorAll(".card")];
      cards.forEach((c, i) => {
        window.setTimeout(() => {
          c.classList.remove("card--hold");
          c.classList.add("card--visible");
        }, i * 360);
      });
      return;
    }

    const mainEl = heading.querySelector(".overview-featured-headline__main");
    const subEl = heading.querySelector(".overview-featured-headline__sub");
    let wordSpans = [];
    if (mainEl && mainEl.textContent.trim()) {
      wordSpans = wordSpans.concat(wrapWords(mainEl));
    }
    if (subEl && subEl.textContent.trim()) {
      wordSpans = wordSpans.concat(wrapWords(subEl));
    }
    if (!wordSpans.length) {
      wordSpans = wrapWords(heading);
    }
    const HEADER_END = 400;
    const WORD_STEP = 130;
    const WORD_DONE = HEADER_END + wordSpans.length * WORD_STEP + 600;

    wordSpans.forEach((span, i) => {
      span.style.animationDelay = `${HEADER_END + i * WORD_STEP}ms`;
    });

    window.setTimeout(() => {
      const cards = [...grid.querySelectorAll(".card")];
      cards.forEach((c, i) => {
        window.setTimeout(() => {
          c.classList.remove("card--hold");
          c.classList.add("card--visible");
        }, i * 360);
      });
    }, WORD_DONE);
  }

  function tryStart() {
    if (sequenceStarted || !heroIntroDone || !inView) return;
    runSequence();
  }

  window.setTimeout(() => {
    heroIntroDone = true;
    tryStart();
  }, HERO_INTRO_MS);

  observer = new IntersectionObserver(
    (entries) => {
      inView = entries.some((e) => e.isIntersecting);
      tryStart();
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );
  observer.observe(wrapSection);
})();

/* ── Card stagger animation — fade in da esquerda, ordem leitura ── */
(function () {
  const cards = document.querySelectorAll('.section-wrapper .card');
  if (!cards.length || !window.IntersectionObserver) return;

  /* Oculta os cards via JS (quem não tem JS vê normalmente)
     card--hold é adicionado pela lógica da about e remove o observer até a hora certa */
  /* Oculta os cards via JS — pula os gerenciados pela about page */
  cards.forEach(c => {
    if (!c.classList.contains('card--hold')) c.classList.add('card--anim');
  });

  const observer = new IntersectionObserver((entries) => {
    /* Ordena por posição: cima→baixo, esquerda→direita */
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => {
        const dy = a.boundingClientRect.top - b.boundingClientRect.top;
        return dy !== 0 ? dy : a.boundingClientRect.left - b.boundingClientRect.left;
      });

    visible.forEach((entry, i) => {
      setTimeout(() => {
        entry.target.classList.remove('card--anim');
        entry.target.classList.add('card--visible');
      }, i * 360);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  /* Pula cards gerenciados pela about page */
  cards.forEach(c => {
    if (!c.classList.contains('card--hold')) observer.observe(c);
  });
})();

/* ── WhatsApp button ── */
const waBtn = document.getElementById('btn-whatsapp');
if (waBtn) {
  waBtn.addEventListener('click', () => {
    const name    = (document.getElementById('name')?.value    || '').trim();
    const email   = (document.getElementById('email')?.value   || '').trim();
    const phone   = (document.getElementById('phone')?.value   || '').trim();
    const context = (document.getElementById('context')?.value || '').trim();
    const message = (document.getElementById('message')?.value || '').trim();

    let text = 'Olá Luis, vim pelo seu portfólio!';
    if (name)    text += `\n\nNome: ${name}`;
    if (email)   text += `\nEmail: ${email}`;
    if (phone)   text += `\nTelefone: ${phone}`;
    if (context) text += `\nContexto: ${context}`;
    if (message) text += `\n\nMensagem: ${message}`;

    window.open(`https://wa.me/5565992284932?text=${encodeURIComponent(text)}`, '_blank');
  });
}

const toastEl = document.getElementById("footer-copy-toast");
let toastTimer = null;

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

function showCopyToast(message) {
  if (!toastEl || !message) return;
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove("is-visible");
    toastEl.textContent = "";
  }, 2800);
}

document.querySelectorAll(".footer-premium__card-copy[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const text = (btn.getAttribute("data-copy") || "").trim();
    const msg = (btn.getAttribute("data-copy-message") || "").trim();
    if (!text) return;
    try {
      await copyToClipboard(text);
      showCopyToast(msg);
    } catch (_) {
      /* ignore */
    }
  });
});

/* ── Overview: frase entre marquee e projetos — só depois do marquee + scroll ── */
(function () {
  const bridge = document.querySelector(".index-value-bridge");
  if (!bridge || !window.IntersectionObserver) {
    bridge?.classList.add("index-value-bridge--visible");
    return;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /** Marquee strip CSS: animation-delay 4s + fade ~0.45s */
  const MARQUEE_REVEAL_DONE_MS = 4600;

  if (reduced) {
    bridge.classList.add("index-value-bridge--visible");
    return;
  }

  let observer = null;

  function reveal() {
    bridge.classList.add("index-value-bridge--visible");
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  window.setTimeout(() => {
    observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some(
            (e) => e.isIntersecting && e.intersectionRatio >= 0.055
          )
        ) {
          reveal();
        }
      },
      {
        threshold: [0, 0.055, 0.1, 0.18],
        rootMargin: "0px 0px -14% 0px",
      }
    );
    observer.observe(bridge);

    requestAnimationFrame(() => {
      const rect = bridge.getBoundingClientRect();
      const vh =
        window.innerHeight || document.documentElement.clientHeight || 0;
      if (rect.top < vh * 0.76 && rect.bottom > 56) {
        reveal();
      }
    });
  }, MARQUEE_REVEAL_DONE_MS);
})();

