/* ═══════════════════════════════════════════════
   ANIMATIONS — Scroll reveals, counters,
   parallax, cursor, nav behavior
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // Wait for loader to finish
  const loader = document.querySelector('.loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('done'), 1300);
    });
  }

  /* ── SCROLL REVEAL (Intersection Observer) ── */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale, .reveal-stagger');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealElements.forEach((el) => revealObserver.observe(el));

  /* ── COUNTER ANIMATION ── */
  function animateCounter(el) {
    const text = el.textContent.trim();
    const match = text.match(/^([^\d]*)([\d,.]+)(.*)$/);
    if (!match) return;

    const prefix = match[1];
    const numStr = match[2];
    const suffix = match[3];
    const hasDecimal = numStr.includes('.');
    const target = parseFloat(numStr.replace(/,/g, ''));
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = target * eased;

      if (hasDecimal) {
        el.textContent = prefix + current.toFixed(1) + suffix;
      } else {
        el.textContent = prefix + Math.round(current).toLocaleString() + suffix;
      }

      if (progress < 1) requestAnimationFrame(update);
    }

    el.textContent = prefix + '0' + suffix;
    requestAnimationFrame(update);
  }

  const counters = document.querySelectorAll('.counter-animated');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  /* ── PARALLAX GHOST TEXT ── */
  const ghostTexts = document.querySelectorAll('.ghost-text');
  if (ghostTexts.length) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          ghostTexts.forEach((el) => {
            const rect = el.parentElement.getBoundingClientRect();
            const speed = 0.08;
            const offset = (rect.top + scrollY - scrollY) * speed;
            el.style.transform = `translateY(${offset}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ── CUSTOM CURSOR ── */
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');

  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
      cursorDot.classList.add('visible');
      cursorRing.classList.add('visible');
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover state for interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .service-card, .pricing-card, .gallery-card, .process-step');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hovering');
        cursorRing.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hovering');
        cursorRing.classList.remove('hovering');
      });
    });

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('visible');
      cursorRing.classList.remove('visible');
    });
  }

  /* ── MAGNETIC BUTTON EFFECT ── */
  const magneticBtns = document.querySelectorAll('.btn-magnetic');
  magneticBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  /* ── NAV SCROLL BEHAVIOR ── */
  const nav = document.querySelector('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 100) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }

    // Hide on scroll down, show on scroll up
    if (currentScroll > lastScroll && currentScroll > 300) {
      nav.classList.add('nav-hidden');
    } else {
      nav.classList.remove('nav-hidden');
    }

    lastScroll = currentScroll;
  });

  /* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = nav ? nav.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });

        // Close mobile nav if open
        const mobileNav = document.querySelector('.nav-mobile');
        const hamburger = document.querySelector('.nav-hamburger');
        if (mobileNav && mobileNav.classList.contains('active')) {
          mobileNav.classList.remove('active');
          hamburger.classList.remove('active');
        }
      }
    });
  });

  /* ── MOBILE NAV TOGGLE ── */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });
  }

  /* ── TICKER DUPLICATION FOR INFINITE SCROLL ── */
  const ticker = document.querySelector('.metrics-ticker');
  if (ticker) {
    const items = ticker.innerHTML;
    ticker.innerHTML = '<div class="ticker-inner ticker-animated">' + items + items + '</div>';
    ticker.querySelector('.ticker-inner').style.display = 'flex';
  }
})();
