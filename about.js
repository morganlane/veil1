/* ═══════════════════════════════════════════════════════════════
   VEIL STUDIO — js/about.js
   ───────────────────────────────────────────────────────────────
   Loaded on: about.html only
   Dependencies: GSAP + CustomEase (loaded in <head>)
   
   Sections:
   01. PRELOADER     — document revision loader animation
   02. TENSION BARS  — animated progress bars on scroll
   03. HERO STRIKES  — strikethrough animation on about hero
   04. DOSSIER HOVER — hover reveal on team cards
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {


/* ─────────────────────────────────────────────────────────────
   01. PRELOADER — Document revision history
   Cycles through draft filenames with a progress bar,
   then fades out to reveal the page.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const loader   = document.getElementById('preloader');
  const bar      = document.getElementById('pre-bar');
  const filename = document.getElementById('pre-filename');
  const status   = document.getElementById('pre-status');

  if (!loader || !bar || !filename || !status) return;

  const drafts = [
    'draft_1.doc', 'draft_2.doc', 'draft_3.doc',
    'draft_4.doc', 'draft_5.doc', 'draft_6.doc', 'draft_7_FINAL.doc',
  ];
  const statuses = [
    'Loading draft_1.doc…', 'Reviewing…', 'Rejected. Trying again…',
    'Getting warmer…', 'Still not right…', 'Almost…', 'Draft 7 — approved. ✓',
  ];

  let idx = 0;

  function tick() {
    if (idx >= drafts.length) return done();
    filename.textContent = drafts[idx];
    status.textContent   = statuses[idx];
    bar.style.width      = ((idx + 1) / drafts.length * 100) + '%';
    idx++;
    setTimeout(tick, idx === drafts.length ? 700 : 260);
  }

  function done() {
    setTimeout(() => {
      gsap.to(loader, {
        autoAlpha: 0,
        duration: .75,
        ease: 'power2.inOut',
        onComplete() { loader.style.display = 'none'; },
      });
    }, 400);
  }

  tick();

})();


/* ─────────────────────────────────────────────────────────────
   02. TENSION BARS
   Each [data-tension] row has a .tension-bar-fill element.
   When it enters viewport, .loaded is added → CSS transitions
   width from 0 to --pct (set inline on each element).
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const els = document.querySelectorAll('[data-tension]');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const bar = e.target.querySelector('.tension-bar-fill');
        if (bar) setTimeout(() => bar.classList.add('loaded'), 200);
        io.unobserve(e.target);
      }
    });
  }, { threshold: .6 });

  els.forEach(el => io.observe(el));

})();


/* ─────────────────────────────────────────────────────────────
   03. HERO STRIKE ANIMATIONS
   .tw-line.struck elements have their inner .tw-text get a
   CSS background-size transition to draw a line through them.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const els = document.querySelectorAll('.tw-line.struck');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const txt = e.target.querySelector('.tw-text');
        if (txt) {
          setTimeout(() => {
            txt.style.transition   = 'background-size .7s cubic-bezier(.65,.01,.05,.99)';
            txt.style.backgroundSize = '100% 1.5px';
          }, 300);
        }
        io.unobserve(e.target);
      }
    });
  }, { threshold: .5 });

  els.forEach(el => io.observe(el));

})();


/* ─────────────────────────────────────────────────────────────
   04. DOSSIER HOVER (touch-device fallback)
   On hover: dossier cards reveal the redacted text.
   CSS :hover handles desktop; this adds touch support.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  document.querySelectorAll('.dossier-card').forEach(card => {
    card.addEventListener('pointerenter', () => card.classList.add('revealed'));
    card.addEventListener('pointerleave', () => card.classList.remove('revealed'));
  });

})();


}); /* end DOMContentLoaded */
