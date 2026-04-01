/* ═══════════════════════════════════════════════════════════════
   VEIL STUDIO — js/home.js
   ───────────────────────────────────────────────────────────────
   Loaded on: index.html (home page) only
   Dependencies: GSAP, ScrollTrigger, SplitText (all in <head>)
   
   Sections:
   01. HERO TICKER      — rotating animated text lines
   02. HERO INTRO       — scale-up entrance + scroll parallax
   03. GALLERY SCROLL   — horizontal pinned scroll gallery
═══════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────────
   01. HERO TICKER
   Splits .ticker-line text into characters, then cycles
   three lines in an infinite loop with staggered char reveals.
   Requires: SplitText (loaded in <head> for this page only)
───────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────
   01. HERO TICKER (FIXED)
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  // Ensure SplitText is loaded properly
  if (typeof SplitText === 'undefined') {
    console.warn('[VEIL] SplitText is not loaded. Check your CDN or plugin file.');
    return;
  }

  // 1. Split the text into words and characters
  new SplitText('.c-ticker_title .t-d1-fluid', {
    type: 'words,chars',
    charsClass: 'char',
    wordsClass: 'word',
  });

  const lines = document.querySelectorAll('.ticker-line');
  if (!lines.length) return;

  // 2. CRITICAL FIX: Hide overflow on the word wrappers to create a masking effect.
  // This clips the characters as they slide up/down so they don't overlap.
  gsap.set('.word', { overflow: 'hidden', display: 'inline-flex' });
  gsap.set('.char', { display: 'inline-block' });

  // Grab characters for each specific line
  const [c1, c2, c3] = [...lines].map(l => l.querySelectorAll('.char'));

  // 3. Initial state: Line 1 is visible (0), Lines 2 & 3 are waiting out-of-frame top (-100%)
  gsap.set(c1, { yPercent: 0 });
  gsap.set([c2, c3], { yPercent: -100 });

  // 4. CRITICAL FIX: Cleaned up timeline logic so the first line actually stays visible on load
  gsap.timeline({ repeat: -1, defaults: { duration: 1.2, ease: 'expo.inOut', stagger: 0.02 } })
    
    // Hold for 1.5s, then Line 1 exits down (100) while Line 2 enters from top (0)
    .to(c1, { yPercent: 100 }, "+=1.5")
    .to(c2, { yPercent: 0 }, "<")

    // Hold for 1.5s, then Line 2 exits down while Line 3 enters
    .to(c2, { yPercent: 100 }, "+=1.5")
    .to(c3, { yPercent: 0 }, "<")

    // Hold for 1.5s, then Line 3 exits down. 
    // We instantly reset Line 1 behind the scenes to the top (-100), then animate it in.
    .to(c3, { yPercent: 100 }, "+=1.5")
    .set(c1, { yPercent: -100 }) 
    .to(c1, { yPercent: 0 }, "<");

})();


/* ─────────────────────────────────────────────────────────────
   02. HERO INTRO
   Scale-down entrance on load + scroll-driven parallax fade.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const head   = document.querySelector('.c-hm-hero_head');
  const ticker = document.querySelector('.c-ticker_title');
  const misc   = ['.c-header', '.c-hm-hero_top', '.c-ticker_side'];

  if (!head || !ticker) return;

  /* Scroll: head fades + moves down as you scroll past hero */
  gsap.to(head, {
    transformOrigin: 'center bottom',
    opacity: 0,
    yPercent: 150,
    scrollTrigger: { trigger: head, scrub: .3, start: 'top top+=30' },
  });

  /* Page load: ticker scales down, misc elements fade in */
  gsap.timeline()
    .set('#homepage', { opacity: 1 })
    .set(misc, { opacity: 0 })
    .set(ticker, { scale: 2, transformOrigin: 'center bottom' })
    .to({}, { duration: 1.5 }, 'S')
    .to(ticker, { duration: .75, scale: 1, ease: 'expo.inOut' }, 'S+=.5')
    .to(misc, { opacity: 1 }, 'S+=.5');

})();


/* ─────────────────────────────────────────────────────────────
   03. HORIZONTAL SCROLL GALLERY
   Pins the gallery section and scrolls cards horizontally
   while the user scrolls vertically. Progress bar + counter
   update in sync.
   Desktop only (768px+) — mobile shows vertical scroll.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const wrap     = document.getElementById('gallery-pin-wrap');
  const inner    = document.getElementById('gallery-pin-inner');
  const scroller = document.getElementById('gallery-scroller');
  if (!wrap || !inner || !scroller) return;

  const progress = document.getElementById('gal-progress');
  const countEl  = document.getElementById('gal-count');
  const cards    = scroller.querySelectorAll('.gcard');

  gsap.matchMedia().add('(min-width:768px)', () => {
    const getTravel = () => scroller.scrollWidth - inner.offsetWidth;

    const tween = gsap.to(scroller, {
      x: () => -getTravel(),
      ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        start: 'top top',
        end: () => '+=' + getTravel(),
        pin: inner,
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          if (progress) progress.style.width = (self.progress * 100) + '%';
          const idx = Math.min(Math.round(self.progress * (cards.length - 1)), cards.length - 1);
          if (countEl) {
            countEl.textContent =
              String(idx + 1).padStart(2, '0') + ' / ' +
              String(cards.length).padStart(2, '0');
          }
        },
      },
    });

    return () => tween.scrollTrigger && tween.scrollTrigger.kill();
  });

})();
