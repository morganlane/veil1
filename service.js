/* ═══════════════════════════════════════════════════════════════
   VEIL STUDIO — js/service.js
   ───────────────────────────────────────────────────────────────
   Loaded on: services.html only
   Dependencies: GSAP + CustomEase + ScrollTrigger (in <head>)
   
   Sections:
   01. FAQ ACCORDION    — expand/collapse Q&A items
   02. SCROLLSPY        — highlights active service in index nav
   03. HERO LINE REVEAL — clip-path entrance for headline lines
   04. RING PARALLAX    — subtle depth on hero decorative rings
═══════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────────
   01. FAQ ACCORDION
   Clicking a .faq-q expands/collapses its sibling .faq-body.
   Only one item open at a time.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  document.querySelectorAll('[data-faq]').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      /* Close all open items */
      document.querySelectorAll('[data-faq].open').forEach(o => {
        o.classList.remove('open');
        const icon = o.querySelector('.faq-q-icon');
        if (icon) icon.textContent = '+';
      });

      /* Open clicked item if it was closed */
      if (!isOpen) {
        item.classList.add('open');
        const icon = item.querySelector('.faq-q-icon');
        if (icon) icon.textContent = '×';
      }
    });
  });

})();


/* ─────────────────────────────────────────────────────────────
   02. SCROLLSPY — Service index nav
   The sticky .svc-index nav highlights the item corresponding
   to whichever service section is in view. Clicking an item
   smooth-scrolls to that section, offset by the index height.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const sections = document.querySelectorAll('[data-svc-section]');
  const navItems = document.querySelectorAll('.svc-index-item');
  if (!sections.length || !navItems.length) return;

  /* Highlight active section */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navItems.forEach(n => n.classList.toggle('active', n.dataset.target === id));
      }
    });
  }, { threshold: .25, rootMargin: '-120px 0px -40% 0px' });

  sections.forEach(s => io.observe(s));

  /* Smooth scroll on click */
  navItems.forEach(n => {
    n.addEventListener('click', e => {
      e.preventDefault();
      const target  = document.getElementById(n.dataset.target);
      const indexEl = document.getElementById('svc-index');
      if (target) {
        const offset = indexEl ? indexEl.offsetHeight : 0;
        const y      = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

})();


/* ─────────────────────────────────────────────────────────────
   03. HERO LINE REVEALS
   Each .hero-hed-wrap contains a .hero-hed that starts clipped
   below the overflow boundary. GSAP reveals it upward.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  document.querySelectorAll('.hero-hed-wrap').forEach((w, i) => {
    const hed = w.querySelector('.hero-hed');
    if (!hed) return;
    gsap.from(hed, {
      yPercent: 105,
      duration: 1.1,
      ease: 'expo.out',
      delay: .3 + i * .14,
      scrollTrigger: { trigger: w, start: 'top 90%' },
    });
  });

})();


/* ─────────────────────────────────────────────────────────────
   04. RING PARALLAX
   The three decorative rings in the hero scroll at different
   speeds to create a subtle 3D depth effect.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const rings = document.querySelectorAll('.hero-ring');
  if (!rings.length) return;

  const speeds = [-60, -30, -15];
  rings.forEach((ring, i) => {
    gsap.to(ring, {
      y: speeds[i] || -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.page-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

})();
