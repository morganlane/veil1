/* ═══════════════════════════════════════════════════════════════
   VEIL STUDIO — js/shared.js
   ───────────────────────────────────────────────────────────────
   Loaded on: ALL pages
   Dependencies: GSAP (gsap.min.js + CustomEase.min.js)
   
   Table of contents:
   01. GSAP INIT        — register plugins, set defaults
   02. NAV MENU         — slide-in overlay, hamburger toggle
   03. SCROLL REVEALS   — IntersectionObserver .rv → .in
   04. COUNT-UP         — animated number counters [data-count]
   05. MAGNETIC BUTTONS — subtle cursor-follow on CTAs
   06. ACCORDION BASE   — shared open/close for data-svc, data-faq
   07. SCROLL NAV       — pill-nav show/hide on scroll (if present)
═══════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────────
   01. GSAP INIT
   Register plugins shared across all pages.
   ScrollTrigger and SplitText are loaded conditionally
   per-page (home + services only) via their own <script> tags.
───────────────────────────────────────────────────────────── */
if (typeof gsap !== 'undefined') {
  const plugins = [
    typeof CustomEase !== 'undefined' && CustomEase,
    typeof ScrollTrigger !== 'undefined' && ScrollTrigger,
    typeof SplitText !== 'undefined' && SplitText,
  ].filter(Boolean);
  if (plugins.length) gsap.registerPlugin(...plugins);

  if (typeof CustomEase !== 'undefined') {
    CustomEase.create("main", "0.65,0.01,0.05,0.99");
  }
  gsap.defaults({ ease: "main", duration: .7 });
}


/* ─────────────────────────────────────────────────────────────
   02. NAV MENU (ROBUST GSAP SLIDE-IN)
   
   CRITICAL TECHNIQUE — Why document.body.appendChild(nav)?
   
   CSS position:fixed is supposed to be relative to the viewport,
   but any ancestor with transform, filter, backdrop-filter, or
   perspective creates a new "containing block," trapping fixed
   elements within that ancestor's bounds.
   
   The .nav-menu starts inside the markup for source order, but at
   runtime we move it to the very END of <body> (outside all those
   stacking contexts) so position:fixed works correctly on all pages.
   
   Inline styles are also applied directly on nav.style to override
   any external stylesheets (Tailwind, Webflow, etc.) that might
   otherwise reset or conflict.
───────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────
   02. NAV MENU (FIXED + STABLE)
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {

    const nav = document.querySelector('.nav-menu');
    const btn = document.querySelector('[data-menu-toggle]') || document.querySelector('.hamburger-btn');

    if (!nav || !btn) {
      console.warn('[NAV] Missing nav or button');
      return;
    }

    document.body.appendChild(nav);

    nav.setAttribute('data-nav', 'closed');

    Object.assign(nav.style, {
      position: 'fixed',
      inset: '0',
      width: '100%',
      height: '100%',
      zIndex: '9999',
      display: 'none',
    });

    document.body.style.overflow = '';

    const overlay = nav.querySelector('.overlay');
    const menu = nav.querySelector('.menu');
    const panels = nav.querySelectorAll('.bg-panel');
    const links = nav.querySelectorAll('.menu-link');
    const fades = nav.querySelectorAll('[data-menu-fade]');
    const closeBtn = document.getElementById('nav-close-btn');

    let isOpen = false;
    let tl = gsap.timeline({ paused: true });

    tl
      .set(nav, { display: 'block' })
      .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
      .fromTo(panels, { xPercent: 100 }, { xPercent: 0, stagger: 0.08, duration: 0.4 }, '<')
      .fromTo(menu, { xPercent: 110 }, { xPercent: 0, duration: 0.45 }, '<')
      .fromTo(links, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05 }, '<0.1')
      .fromTo(fades, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.05 }, '<');

    function openMenu() {
      if (isOpen) return;

      isOpen = true;
      nav.setAttribute('data-nav', 'open');
      document.body.style.overflow = 'hidden';

      tl.play(0);
    }

    function closeMenu() {
      if (!isOpen) return;

      isOpen = false;
      nav.setAttribute('data-nav', 'closed');
      document.body.style.overflow = '';

      gsap.to(nav, {
        autoAlpha: 0,
        duration: 0.25,
        onComplete: () => {
          nav.style.display = 'none';
          gsap.set(nav, { clearProps: 'all' });

          Object.assign(nav.style, {
            position: 'fixed',
            inset: '0',
            width: '100%',
            height: '100%',
            zIndex: '9999',
            display: 'none',
          });
        }
      });
    }

    function toggleMenu() {
      isOpen ? closeMenu() : openMenu();
    }

    btn.addEventListener('click', toggleMenu);

    document.querySelectorAll('[data-menu-toggle]').forEach(el => {
      el.addEventListener('click', toggleMenu);
    });

    if (overlay) overlay.addEventListener('click', closeMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });

  });

})();



/* ─────────────────────────────────────────────────────────────
   03. SCROLL REVEALS
   Elements marked .rv start at opacity:0 translateY(2.5em).
   When they enter the viewport, .in is added → CSS transitions
   them to full opacity/position. Delay classes .d1–.d5 stagger.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.rv').forEach(el => io.observe(el));

})();


/* ─────────────────────────────────────────────────────────────
   04. COUNT-UP NUMBERS
   Elements with [data-count="N"] animate from 0 → N when they
   enter the viewport. Optional [data-suffix] appends a symbol.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  function countUp(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const dur    = 1800;
    const t0     = performance.now();

    (function tick(now) {
      const p    = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4); /* quartic ease-out */
      el.textContent = Math.floor(ease * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        countUp(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: .5 });

  els.forEach(el => io.observe(el));

})();


/* ─────────────────────────────────────────────────────────────
   05. MAGNETIC BUTTONS
   CTAs subtly follow the cursor on hover — creates a premium
   tactile feel. Applied to .mag-el, .btn-gold, .btn-outline,
   .btn-gold2, .btn-outline2, .tt-nav-cta.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const STRENGTH = .25;
  const selectors = '.mag-el, .btn-gold, .btn-gold2, .btn-outline, .btn-outline2, .tt-nav-cta';

  document.querySelectorAll(selectors).forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(
        ${(e.clientX - r.left - r.width  / 2) * STRENGTH}px,
        ${(e.clientY - r.top  - r.height / 2) * STRENGTH}px
      )`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

})();


/* ─────────────────────────────────────────────────────────────
   06. ACCORDION BASE
   Generic open/close for service panels [data-svc] and
   FAQ items [data-faq] and anatomy layers [data-layer].
   Each page's own JS file adds scrollspy / extra behaviour.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* Service panels (home page) */
  document.querySelectorAll('[data-svc]').forEach(panel => {
    panel.addEventListener('click', () => {
      const isOpen = panel.classList.contains('open');
      document.querySelectorAll('[data-svc].open').forEach(p => {
        p.classList.remove('open');
        const t = p.querySelector('.svc-panel-toggle');
        if (t) t.textContent = '+';
      });
      if (!isOpen) {
        panel.classList.add('open');
        const t = panel.querySelector('.svc-panel-toggle');
        if (t) t.textContent = '×';
      }
    });
  });

  /* Anatomy layers */
  document.querySelectorAll('[data-layer]').forEach(layer => {
    const head = layer.querySelector('.anat-head');
    if (!head) return;
    head.addEventListener('click', () => {
      const isOpen = layer.classList.contains('open');
      document.querySelectorAll('[data-layer].open').forEach(l => {
        l.classList.remove('open');
        const ic = l.querySelector('.anat-icon');
        if (ic) ic.textContent = '+';
      });
      if (!isOpen) {
        layer.classList.add('open');
        const ic = layer.querySelector('.anat-icon');
        if (ic) ic.textContent = '×';
      }
    });
  });

})();


/* ─────────────────────────────────────────────────────────────
   07. SCROLL NAV (pill nav + floating button)
   If .pill-nav-wrap + #scroll-menu-btn exist on the page,
   toggle their .scrolled / .visible classes after threshold.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const pillWrap  = document.querySelector('.pill-nav-wrap');
  const scrollBtn = document.getElementById('scroll-menu-btn');
  if (!pillWrap || !scrollBtn) return;

  const THRESHOLD = 80;

  function onScroll() {
    const past = window.scrollY > THRESHOLD;
    pillWrap.classList.toggle('scrolled', past);
    scrollBtn.classList.toggle('visible', past);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

})();
