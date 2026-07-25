document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  const progressBar = document.getElementById("progressBar");
  const backToTop = document.getElementById("backToTop");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------------------------------------------------------------------
  // i18n: dil değiştirme (TR / EN / AR)
  // ---------------------------------------------------------------------
  const RTL_LANGS = ["ar"];
  const LANG_STORAGE_KEY = "sigmatek_lang";
  const dict = window.SIGMATEK_I18N || {};
  let currentLang = localStorage.getItem(LANG_STORAGE_KEY) || "tr";
  if (!dict[currentLang]) currentLang = "tr";

  const t = (key) => (dict[currentLang] && dict[currentLang][key]) || (dict.tr && dict.tr[key]) || "";

  const applyTranslations = () => {
    document.documentElement.setAttribute("lang", currentLang);
    document.documentElement.setAttribute("dir", RTL_LANGS.includes(currentLang) ? "rtl" : "ltr");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = t(key);
      if (value) el.textContent = value;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      const value = t(key);
      if (value) el.innerHTML = value;
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const key = el.getAttribute("data-i18n-alt");
      const value = t(key);
      if (value) el.setAttribute("alt", value);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria-label");
      const value = t(key);
      if (value) el.setAttribute("aria-label", value);
    });

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === currentLang);
    });
  };

  const setLanguage = (lang) => {
    if (!dict[lang] || lang === currentLang) {
      if (dict[lang]) applyTranslations();
      return;
    }
    currentLang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    applyTranslations();
  };

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.getAttribute("data-lang")));
  });

  applyTranslations();

  // Mobile nav toggle
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Header show/hide + scroll progress + back-to-top
  let lastScroll = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (y / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = progress + "%";

    if (header) {
      header.classList.toggle("is-scrolled", y > 40);
      if (y > lastScroll && y > 200) {
        header.classList.add("is-hidden");
      } else {
        header.classList.remove("is-hidden");
      }
    }
    if (backToTop) backToTop.classList.toggle("is-visible", y > 600);
    lastScroll = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("is-visible"), i * 60);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Animated stat counters
  const counters = document.querySelectorAll(".stat-number");
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && counters.length) {
    const counterIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterIo.observe(el));
  }

  // Photo gallery filters
  const galleryFilters = document.querySelectorAll(".gallery-filter");
  const galleryItems = document.querySelectorAll(".gallery-item");
  galleryFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      galleryFilters.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      galleryItems.forEach((item) => {
        const show = filter === "all" || item.getAttribute("data-cat") === filter;
        item.classList.toggle("is-hidden", !show);
      });
    });
  });

  // Service detail modal
  const serviceModal = document.getElementById("serviceModal");
  if (serviceModal) {
    const modalImg = document.getElementById("serviceModalImg");
    const modalBody = document.getElementById("serviceModalBody");
    const store = document.querySelector(".service-details-store");
    let lastFocused = null;

    const openModal = (key) => {
      const tpl =
        store &&
        (store.querySelector(`template[data-detail="${key}"][data-lang="${currentLang}"]`) ||
          store.querySelector(`template[data-detail="${key}"][data-lang="tr"]`) ||
          store.querySelector(`template[data-detail="${key}"]`));
      if (!tpl) return;
      modalBody.innerHTML = "";
      modalBody.appendChild(tpl.content.cloneNode(true));
      const img = tpl.getAttribute("data-img") || "";
      const titleEl = modalBody.querySelector("h3");
      modalImg.src = img;
      modalImg.alt = titleEl ? titleEl.textContent : "";
      lastFocused = document.activeElement;
      serviceModal.classList.add("is-open");
      serviceModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      modalBody.scrollTop = 0;
    };

    const closeModal = () => {
      serviceModal.classList.remove("is-open");
      serviceModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    document.querySelectorAll(".service-card[data-service]").forEach((card) => {
      const key = card.getAttribute("data-service");
      const link = card.querySelector(".service-link");
      if (link) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          openModal(key);
        });
      }
      card.addEventListener("click", (e) => {
        if (e.target.closest("a") && !e.target.closest(".service-link")) return;
        openModal(key);
      });
    });

    serviceModal.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && serviceModal.classList.contains("is-open")) closeModal();
    });
  }

  // Contact form -> FormSubmit (real email delivery)
  const form = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      if (formNote) {
        formNote.textContent = t("form_sending");
        formNote.style.color = "";
      }

      const formData = new FormData(form);
      fetch("https://formsubmit.co/ajax/ugur.gul@sigmatek.org", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success === "true") {
            if (formNote) formNote.textContent = t("form_success");
            form.reset();
          } else {
            throw new Error(data && data.message ? data.message : "unknown");
          }
        })
        .catch(() => {
          if (formNote) {
            formNote.textContent = t("form_error");
            formNote.style.color = "#E24B4A";
          }
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
});
