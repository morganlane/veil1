/* ═══════════════════════════════════════════════════════════════
   VEIL STUDIO — js/contact.js
   ───────────────────────────────────────────────────────────────
   Loaded on: contact.html only
   Dependencies: GSAP + CustomEase (loaded in <head>)
   
   Sections:
   01. CASE NUMBER GEN  — unique reference for each session
   02. PRELOADER        — case file initialising animation
   03. LIVE CLOCKS      — real-time NY / Paris / Tokyo clocks
   04. FORM SUBMISSION  — validate + confirm animation
═══════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────────
   01. CASE NUMBER
   Generated once per page load; shared across preloader,
   hero, form header, and confirmation screen.
───────────────────────────────────────────────────────────── */
function genCaseNum() {
  const y = new Date().getFullYear();
  const n = Math.floor(Math.random() * 900) + 100;
  return `VL-${y}-${n}`;
}
const CASE_NUM = genCaseNum();


/* ─────────────────────────────────────────────────────────────
   02. PRELOADER — Case file initialising
   Shows log lines one by one, then types out the case number,
   then fades the preloader away and populates case ref fields.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const loader = document.getElementById('preloader');
  const logEl  = document.getElementById('pre-log');
  const caseEl = document.getElementById('pre-case-num');
  const fill   = document.getElementById('pre-fill');
  const status = document.getElementById('pre-status');

  /* Scroll reveals observer (initialised after preloader fades) */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .05, rootMargin: '0px 0px -48px 0px' });

  if (!loader) {
    /* No preloader — still init reveals */
    document.querySelectorAll('.rv').forEach(el => io.observe(el));
    return;
  }

  const LOG_LINES = [
    'Opening intake session…',
    'Identifying the defendant…',
    'Verifying studio availability…',
    'Brief room ready.',
  ];
  let logIdx = 0;

  function showLog() {
    if (logIdx >= LOG_LINES.length) return buildCaseNum();

    const line   = document.createElement('p');
    line.className = 'pre-log-line';
    const bullet = document.createElement('span');
    bullet.className = 'pre-log-bullet';
    line.appendChild(bullet);
    line.appendChild(document.createTextNode(LOG_LINES[logIdx]));
    logEl.appendChild(line);

    requestAnimationFrame(() => requestAnimationFrame(() => line.classList.add('show')));
    if (fill) fill.style.width = ((logIdx + 1) / (LOG_LINES.length + 1) * 60) + '%';

    logIdx++;
    setTimeout(() => {
      line.classList.add('done');
      setTimeout(showLog, logIdx === LOG_LINES.length ? 100 : 220);
    }, 350);
  }

  function buildCaseNum() {
    if (status) status.textContent = 'Assigning case reference…';
    const numStr = CASE_NUM;
    let i = 0;

    function tick() {
      if (i >= numStr.length) {
        if (caseEl) caseEl.innerHTML = `<span class="pre-digit">${numStr}</span>`;
        if (fill)   fill.style.width = '100%';
        if (status) status.textContent = 'Case assigned. ✓';
        setTimeout(done, 700);
        return;
      }
      if (caseEl) caseEl.innerHTML = `<span class="pre-digit">${numStr.slice(0, i + 1)}</span><span class="pre-cursor"></span>`;
      if (fill)   fill.style.width = (60 + ((i + 1) / numStr.length * 40)) + '%';
      i++;
      setTimeout(tick, i < 6 ? 60 : 45);
    }
    setTimeout(tick, 200);
  }

  function done() {
    gsap.to(loader, {
      autoAlpha: 0,
      duration: .7,
      ease: 'power2.inOut',
      onComplete() {
        loader.style.display = 'none';
        /* Populate case reference in visible elements */
        ['hero-case-ref', 'form-case-ref', 'confirmed-ref'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = CASE_NUM;
        });
        /* Activate scroll reveals now that preloader is gone */
        document.querySelectorAll('.rv').forEach(el => io.observe(el));
      },
    });
  }

  setTimeout(showLog, 400);

})();


/* ─────────────────────────────────────────────────────────────
   03. LIVE CLOCKS
   Updates every second. Displays time in three timezones
   for both the hero clock panels and studio cards.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  function formatTime(date, tz) {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  }

  function updateClocks() {
    const now   = new Date();
    const ny    = formatTime(now, 'America/New_York');
    const paris = formatTime(now, 'Europe/Paris');
    const tokyo = formatTime(now, 'Asia/Tokyo');

    /* Hero clock panels */
    const setHTML = (id, time, tz) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `${time}<span class="tz">${tz}</span>`;
    };
    setHTML('clock-ny',    ny,    'EST');
    setHTML('clock-paris', paris, 'CET');
    setHTML('clock-tokyo', tokyo, 'JST');

    /* Studio cards (contact page bottom section) */
    const setText = (id, time) => {
      const el = document.getElementById(id);
      if (el) el.textContent = time;
    };
    setText('sc-ny',    ny);
    setText('sc-paris', paris);
    setText('sc-tokyo', tokyo);
  }

  updateClocks();
  setInterval(updateClocks, 1000);

})();


/* ─────────────────────────────────────────────────────────────
   04. FORM SUBMISSION
   Validates the mandatory "refusal" textarea, then animates
   the form out and shows the confirmation screen.
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const btn         = document.getElementById('btn-submit');
  const formSection = document.getElementById('form-section');
  const confirmed   = document.getElementById('form-confirmed');
  if (!btn || !formSection || !confirmed) return;

  const formSplit = formSection.querySelector('.form-split');
  const docHead   = formSection.querySelector('.form-doc-head');
  const refusalEl = document.getElementById('f-refusal');

  btn.addEventListener('click', () => {
    /* Validate: refusal is mandatory */
    if (!refusalEl || !refusalEl.value.trim()) {
      if (refusalEl) {
        refusalEl.focus();
        refusalEl.style.borderBottomColor = 'var(--red)';
        setTimeout(() => { refusalEl.style.borderBottomColor = ''; }, 2000);
      }
      return;
    }

    /* Animate form out, show confirmation */
    gsap.to(formSplit, {
      opacity: 0,
      y: -16,
      duration: .5,
      ease: 'power2.in',
      onComplete() {
        if (formSplit) formSplit.style.display = 'none';
        if (docHead)   docHead.style.display   = 'none';
        confirmed.classList.add('show');
        gsap.fromTo(confirmed,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: .7, ease: 'power2.out' }
        );
      },
    });
  });

})();
