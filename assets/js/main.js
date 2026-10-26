/* ============================================================
   Poggio Ruppelt — main.js (vanilla JS, no dipendenze)
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Header on scroll + back-to-top ---------- */
  const header = document.getElementById("siteHeader");
  const backTop = document.getElementById("backTop");

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    header.classList.toggle("scrolled", y > 40);
    backTop.classList.toggle("visible", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  function closeMenu() {
    navToggle.classList.remove("open");
    mainNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  navToggle.addEventListener("click", function () {
    const open = mainNav.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenu();
      closeLightbox();
    }
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Gallery lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    window.setTimeout(function () { lightboxImg.src = ""; }, 300);
  }

  document.querySelectorAll(".gallery-item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const img = btn.querySelector("img");
      openLightbox(btn.dataset.full || img.src, img.alt);
    });
  });
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* ---------- Contact form ----------
     Per attivare l'invio reale: imposta FORM_ENDPOINT con l'URL di un
     servizio compatibile (es. Formspree, Getform, endpoint custom). */
  const FORM_ENDPOINT = ""; // es. "https://formspree.io/f/xxxxxxxx"

  const form = document.getElementById("contactForm");
  const feedback = document.getElementById("formFeedback");

  function setFieldError(field, hasError) {
    if (!field) return;
    field.classList.toggle("invalid", hasError);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;

    const required = form.querySelectorAll("[required]");
    required.forEach(function (field) {
      let bad = !field.value.trim();
      if (field.type === "email" && field.value.trim()) {
        bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      }
      if (field.type === "checkbox") bad = !field.checked;
      setFieldError(field, bad);
      if (bad) valid = false;
    });

    feedback.className = "form-feedback";
    if (!valid) {
      feedback.textContent = "Compila correttamente tutti i campi obbligatori.";
      feedback.classList.add("err");
      return;
    }

    if (FORM_ENDPOINT) {
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Invio in corso…";
      fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error("send failed");
          form.reset();
          feedback.textContent = "Grazie! La tua richiesta è stata inviata: ti contatteremo al più presto.";
          feedback.classList.add("ok");
        })
        .catch(function () {
          feedback.textContent = "Si è verificato un problema nell'invio. Riprova più tardi o scrivici su Instagram.";
          feedback.classList.add("err");
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = "Invia la richiesta";
        });
    } else {
      // Anteprima statica: nessun backend configurato
      form.reset();
      feedback.textContent =
        "Grazie! Il modulo è pronto: collega un endpoint (FORM_ENDPOINT in assets/js/main.js) per ricevere realmente le richieste.";
      feedback.classList.add("ok");
    }
  });

  form.querySelectorAll("input, select, textarea").forEach(function (field) {
    field.addEventListener("input", function () {
      setFieldError(field, false);
    });
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
