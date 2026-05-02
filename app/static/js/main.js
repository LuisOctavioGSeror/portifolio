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

