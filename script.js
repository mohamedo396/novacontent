// ===================================================
// DOUF NIN — script.js
// ===================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked (mobile)
    mainNav.querySelectorAll('a[data-nav]').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (window.scrollY > 12) {
      header.style.boxShadow = '0 2px 18px rgba(41,37,34,.06)';
    } else {
      header.style.boxShadow = 'none';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    // Fallback: show everything immediately
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a[data-nav]');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const match = link.getAttribute('href') === `#${id}`;
            link.style.color = match ? 'var(--rose)' : '';
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(section => navObserver.observe(section));
  }

});
