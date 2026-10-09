/* =========================================================
   WELLINGTON BIKE SHOP — script.js
   JavaScript puro, sem dependências.
   ========================================================= */
(function () {
  "use strict";

  const WHATSAPP_NUMBER = "5585985773908";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const buildWhatsAppLink = (message) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  /* ---------- Feedback (toast) ---------- */
  const toast = $("#toast");
  let toastTimer;
  function showToast(message, isError = false) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle("is-error", isError);
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 4200);
  }

  /* ---------- Links do WhatsApp com mensagem pré-preenchida ---------- */
  $$("[data-wa]").forEach((link) => {
    link.href = buildWhatsAppLink(link.dataset.wa);
    link.addEventListener("click", () => showToast("Abrindo o WhatsApp em uma nova aba..."));
  });

  /* ---------- Ano no rodapé ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Cabeçalho ao rolar ---------- */
  const header = $("#header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu móvel ---------- */
  const menuToggle = $("#menuToggle");
  const nav = $("#nav");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
  }

  menuToggle.addEventListener("click", () => {
    setSearch(false);
    setMenu(!nav.classList.contains("is-open"));
  });

  $$(".nav a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

  window.matchMedia("(min-width: 961px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });

  /* ---------- Link ativo conforme a seção ---------- */
  const navLinks = $$(".nav__link");
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) =>
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- Pesquisa ---------- */
  const searchToggle = $("#searchToggle");
  const searchPanel = $("#searchPanel");
  const searchInput = $("#searchInput");
  const searchClose = $("#searchClose");
  const searchForm = $("#searchForm");
  const searchResults = $("#searchResults");

  const normalize = (text) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const searchIndex = $$("[data-search]").map((el) => {
    const title = $(".card__title, .service__title", el)?.textContent.trim() || "";
    const section = el.closest("section");
    const sectionTitle = section ? $("h2", section)?.textContent.trim() : "";
    return {
      el,
      title,
      sectionTitle,
      haystack: normalize(`${title} ${el.dataset.search} ${el.textContent}`),
    };
  });

  function setSearch(open) {
    searchPanel.hidden = !open;
    searchToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      setMenu(false);
      searchInput.focus();
    } else {
      searchInput.value = "";
      searchResults.innerHTML = "";
    }
  }

  function goToResult(item) {
    setSearch(false);
    item.el.scrollIntoView({ behavior: "smooth", block: "center" });
    item.el.classList.remove("is-highlighted");
    void item.el.offsetWidth;
    item.el.classList.add("is-highlighted");
  }

  function findMatches(query) {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return searchIndex.filter((item) => terms.every((term) => item.haystack.includes(term)));
  }

  function renderResults(query) {
    searchResults.innerHTML = "";
    if (!query.trim()) return;

    const matches = findMatches(query);

    if (!matches.length) {
      const li = document.createElement("li");
      li.className = "search__empty";
      li.append("Nenhum resultado para “", query, "”. ");
      const link = document.createElement("a");
      link.href = buildWhatsAppLink(`Olá! Estou procurando por: ${query}. Vocês podem me ajudar?`);
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Pergunte pelo WhatsApp";
      li.append(link);
      searchResults.append(li);
      return;
    }

    matches.slice(0, 8).forEach((item) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search__result";
      const label = document.createElement("span");
      label.textContent = item.title;
      const context = document.createElement("small");
      context.textContent = item.sectionTitle;
      button.append(label, context);
      button.addEventListener("click", () => goToResult(item));
      li.append(button);
      searchResults.append(li);
    });
  }

  searchToggle.addEventListener("click", () => setSearch(searchPanel.hidden));
  searchClose.addEventListener("click", () => {
    setSearch(false);
    searchToggle.focus();
  });
  searchInput.addEventListener("input", () => renderResults(searchInput.value));
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const [first] = findMatches(searchInput.value);
    if (first) goToResult(first);
    else renderResults(searchInput.value);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!searchPanel.hidden) {
      setSearch(false);
      searchToggle.focus();
    }
    if (nav.classList.contains("is-open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!searchPanel.hidden && !header.contains(e.target)) setSearch(false);
  });

  /* ---------- Animações de entrada ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Formulário de contato ---------- */
  const form = $("#contactForm");

  const validators = {
    name: (v) => (v.trim().length >= 2 ? "" : "Informe seu nome (mínimo de 2 letras)."),
    phone: (v) => {
      const digits = v.replace(/\D/g, "");
      if (!digits) return "";
      return digits.length >= 10 && digits.length <= 11 ? "" : "Informe um telefone válido com DDD.";
    },
    subject: (v) => (v ? "" : "Selecione um assunto."),
    message: (v) => (v.trim().length >= 10 ? "" : "Escreva uma mensagem com pelo menos 10 caracteres."),
  };

  function validateField(field) {
    const validate = validators[field.name];
    if (!validate) return true;
    const error = validate(field.value);
    const wrapper = field.closest(".field");
    const errorEl = $(".field__error", wrapper);
    wrapper.classList.toggle("has-error", Boolean(error));
    field.setAttribute("aria-invalid", String(Boolean(error)));
    errorEl.textContent = error;
    return !error;
  }

  if (form) {
    const fields = $$("input, select, textarea", form);

    fields.forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.closest(".field").classList.contains("has-error")) validateField(field);
      });
    });

    const phoneInput = $("#fPhone", form);
    phoneInput.addEventListener("input", () => {
      const d = phoneInput.value.replace(/\D/g, "").slice(0, 11);
      let masked = d;
      if (d.length > 2) masked = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length > 7) masked = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
      phoneInput.value = masked;
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const results = fields.map(validateField);
      if (results.includes(false)) {
        const firstInvalid = fields.find((f) => f.getAttribute("aria-invalid") === "true");
        firstInvalid?.focus();
        showToast("Revise os campos destacados para continuar.", true);
        return;
      }

      const data = new FormData(form);
      const lines = [
        "Olá, Wellington Bike Shop! Vim pelo site.",
        "",
        `*Nome:* ${data.get("name").trim()}`,
        data.get("phone") ? `*Telefone:* ${data.get("phone")}` : null,
        `*Assunto:* ${data.get("subject")}`,
        `*Mensagem:* ${data.get("message").trim()}`,
      ].filter((line) => line !== null);

      const url = buildWhatsAppLink(lines.join("\n"));
      const opened = window.open(url, "_blank");
      if (opened) opened.opener = null;
      else window.location.href = url;
      showToast("Mensagem pronta! Conclua o envio no WhatsApp.");
      form.reset();
    });
  }
})();
