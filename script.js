// ===================================================
// DOUF NIN — script.js
// i18n engine + nav + scroll reveal
// ===================================================

(function () {

  var LANGUAGES = ['fr', 'en', 'ar'];
  var RTL_LANGUAGES = ['ar'];
  var DEFAULT_LANG = 'fr';
  var currentLang = DEFAULT_LANG;
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Graceful image fallback ----------
     If a source image 404s (a common real-world risk when hot-linking
     third-party photos), swap it for a themed placeholder instead of
     showing a broken-image icon. Exposed on window so inline
     onerror="" handlers in the HTML can reach it. */
  window.__imgFallback = function (img) {
    if (img.dataset.fallbackApplied) return; // avoid loops if the placeholder itself fails
    img.dataset.fallbackApplied = 'true';
    img.removeAttribute('srcset');
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23E8D8D2"/%3E%3Cpath d="M30 65l12-15 10 10 10-18 18 23z" fill="%23B98C7B" opacity="0.6"/%3E%3Ccircle cx="35" cy="35" r="7" fill="%23B98C7B" opacity="0.6"/%3E%3C/svg%3E';
    img.classList.add('img-fallback');
    img.alt = img.alt || '';
  };

  /* ---------- Language detection (no persistence — in-memory only) ---------- */
  function detectInitialLang() {
    try {
      var nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (nav.indexOf('ar') === 0) return 'ar';
      if (nav.indexOf('en') === 0) return 'en';
    } catch (e) { /* noop */ }
    return DEFAULT_LANG;
  }

  /* ---------- Apply a language to the whole document ---------- */
  function applyLanguage(lang) {
    if (LANGUAGES.indexOf(lang) === -1) lang = DEFAULT_LANG;
    var dict = (window.TRANSLATIONS && window.TRANSLATIONS[lang]) || {};
    currentLang = lang;

    // <html lang> and dir
    var isRtl = RTL_LANGUAGES.indexOf(lang) !== -1;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.classList.toggle('lang-ar', lang === 'ar');

    // Text content (innerHTML — values are author-controlled, may contain <br>/<em>)
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    // Attribute translations, e.g. data-i18n-attr="content:meta.description"
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var parts = pair.split(':');
        var attr = parts[0].trim();
        var key = parts[1] && parts[1].trim();
        if (key && dict[key] !== undefined) el.setAttribute(attr, dict[key]);
      });
    });

    // Active state on language switch buttons
    document.querySelectorAll('.lang-switch [data-lang]').forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  /* ---------- Wire up language switch buttons ---------- */
  function initLangSwitch() {
    document.querySelectorAll('.lang-switch [data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLanguage(btn.getAttribute('data-lang'));
        // Close mobile menu if the click happened inside it
        var mainNav = document.getElementById('mainNav');
        var navToggle = document.getElementById('navToggle');
        if (mainNav && mainNav.classList.contains('open')) {
          mainNav.classList.remove('open');
          navToggle && navToggle.classList.remove('open');
          navToggle && navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Init language ---------- */
    initLangSwitch();
    applyLanguage(detectInitialLang());

    /* ---------- Mobile nav toggle ---------- */
    var navToggle = document.getElementById('navToggle');
    var mainNav = document.getElementById('mainNav');

    if (navToggle && mainNav) {
      navToggle.addEventListener('click', function () {
        var isOpen = mainNav.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
      });

      mainNav.querySelectorAll('a[data-nav]').forEach(function (link) {
        link.addEventListener('click', function () {
          mainNav.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* ---------- Header shadow on scroll ---------- */
    var header = document.querySelector('.site-header');
    function onScroll() {
      header.style.boxShadow = window.scrollY > 12 ? '0 2px 18px rgba(41,37,34,.06)' : 'none';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Scroll reveal ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------- FAQ accordion (single item open at a time) ---------- */
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (item.open) {
          faqItems.forEach(function (other) {
            if (other !== item) other.open = false;
          });
        }
      });
    });

    /* ---------- Hero photo tilt (desktop pointer only, respects reduced motion) ---------- */
    var heroVisual = document.getElementById('heroVisual');
    var heroPhoto = document.getElementById('heroPhoto');
    var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (heroVisual && heroPhoto && canHover && !prefersReducedMotion) {
      heroVisual.addEventListener('mousemove', function (e) {
        var rect = heroVisual.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        var rotateY = x * 8;
        var rotateX = y * -8;
        heroPhoto.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
      });
      heroVisual.addEventListener('mouseleave', function () {
        heroPhoto.style.transform = 'rotateX(0deg) rotateY(0deg)';
      });
    }

    /* ---------- Active nav link on scroll ---------- */
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.main-nav a[data-nav]');
    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
      var navObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              link.style.color = (link.getAttribute('href') === '#' + id) ? 'var(--rose)' : '';
            });
          }
        });
      }, { threshold: 0.4 });
      sections.forEach(function (section) { navObserver.observe(section); });
    }

  });

})();