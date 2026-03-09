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

// Contact form handling (same footer reused across pages)
const contactForm = document.querySelector("#contact-form");
const statusEl = document.querySelector("#form-status");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();

    if (!name || !email || !message) {
      if (statusEl) {
        statusEl.textContent = "Please fill in all required fields.";
        statusEl.classList.remove("success");
        statusEl.classList.add("error");
      } else {
        alert("Please fill in all required fields.");
      }
      return;
    }

    if (statusEl) {
      statusEl.textContent = "Draft ready. Copy and send from your email.";
      statusEl.classList.remove("error");
      statusEl.classList.add("success");
    } else {
      alert("Draft ready. Copy and send from your email.");
    }

    contactForm.reset();
  });
}

