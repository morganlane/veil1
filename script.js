
gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText);
CustomEase.create("main","0.65,0.01,0.05,0.99");
gsap.defaults({ ease:"main", duration:.7 });
  
  
  



/* ── Menu (hamburger open / close) ───────────── */
(function(){
  const nav = document.querySelector(".nav-menu");
  const btn = document.querySelector(".hamburger-btn") || document.querySelector(".menu-button");
  if (!nav || !btn) { console.warn("nav or btn not found"); return; }

  // ── CRITICAL: move nav-menu to direct body child at the very end ──
  // This escapes ALL stacking contexts (transforms, backdrop-filter,
  // perspective, etc.) that would confine position:fixed to a sub-area.
  document.body.appendChild(nav);

  // ── Force nav-menu positioning via inline style (beats any CSS) ──
  Object.assign(nav.style, {
    position: "fixed",
    inset: "0",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    width: "100%",
    height: "100%",
    zIndex: "9999",
    display: "none"
  });

  const overlay   = nav.querySelector(".overlay");
  const menu      = nav.querySelector(".menu");
  const panels    = nav.querySelectorAll(".bg-panel");
  const links     = nav.querySelectorAll(".menu-link");
  const fades     = nav.querySelectorAll("[data-menu-fade]");
  const icon      = btn.querySelector(".hamburger");
  const closeBtn  = document.getElementById("nav-close-btn");
  const tl        = gsap.timeline();

  const setAria = (open) => {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  const openMenu = () => {
    nav.setAttribute("data-nav", "open");
    setAria(true);
    document.body.style.overflow = "hidden";
    tl.clear()
      .set(nav, { display:"block" })
      .fromTo(overlay, { autoAlpha:0 }, { autoAlpha:1, duration:.4 }, "<")
      .fromTo(panels, { xPercent:101 }, { xPercent:0, stagger:.12, duration:.575 }, "<")
      .fromTo(menu, { xPercent:120 }, { xPercent:0, duration:.575 }, "<")
      .fromTo(links, { yPercent:140, rotate:10 }, { yPercent:0, rotate:0, stagger:.05 }, "<+=.35")
      .fromTo(fades, { autoAlpha:0, yPercent:50 }, { autoAlpha:1, yPercent:0, stagger:.04 }, "<+=.2");
    if (icon) tl.fromTo(icon, { rotate:0 }, { rotate:315 }, "<");
  };

  const closeMenu = () => {
    nav.setAttribute("data-nav", "closed");
    setAria(false);
    document.body.style.overflow = "";
    tl.clear()
      .to(overlay, { autoAlpha:0, duration:.35 })
      .to(menu, { xPercent:120, duration:.4 }, "<")
      .set(nav, { display:"none" });
    if (icon) tl.to(icon, { rotate:0 }, "<");
  };

  // All [data-menu-toggle] elements open/close
  document.querySelectorAll("[data-menu-toggle]").forEach(t =>
    t.addEventListener("click", () =>
      nav.getAttribute("data-nav") === "open" ? closeMenu() : openMenu()
    )
  );

  // The X close button inside the menu
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  // Escape key
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && nav.getAttribute("data-nav") === "open") closeMenu();
  });
})();

/* ─ Hero ticker ──────────────────────────────── */
(function(){
  new SplitText(".c-ticker_title .t-d1-fluid",{type:"words,chars",charsClass:"char",wordsClass:"word"});
  const lines=document.querySelectorAll(".ticker-line");
  lines.forEach(l=>gsap.set(l.querySelectorAll(".char"),{yPercent:-100}));
  const [c1,c2,c3]=[...lines].map(l=>l.querySelectorAll(".char"));
  gsap.timeline({repeat:-1,repeatDelay:1,defaults:{duration:1,ease:"expo.inOut"}})
    .fromTo(c1,{yPercent:0},{yPercent:100,stagger:.01})
    .to(c2,{yPercent:0,stagger:.01},"-=1")
    .to(c2,{yPercent:100,stagger:.01,delay:1})
    .to(c3,{yPercent:0,stagger:.01},"-=1")
    .to(c3,{yPercent:100,stagger:.01,delay:1},"A")
    .set(c1,{yPercent:-100},"A")
    .to(c1,{yPercent:0,stagger:.01},"-=1");
})();

/* ─ Hero intro ───────────────────────────────── */
(function(){
  const head=document.querySelector(".c-hm-hero_head"),
        ticker=document.querySelector(".c-ticker_title"),
        misc=[".c-header",".c-hm-hero_top",".c-ticker_side"];
  gsap.to(head,{transformOrigin:"center bottom",opacity:0,yPercent:150,
    scrollTrigger:{trigger:head,scrub:.3,start:"top top+=30"}});
  gsap.timeline()
    .set("#homepage",{opacity:1}).set(misc,{opacity:0})
    .set(ticker,{scale:2,transformOrigin:"center bottom"})
    .to({},{duration:1.5},"S")
    .to(ticker,{duration:.75,scale:1,ease:"expo.inOut"},"S+=.5")
    .to(misc,{opacity:1},"S+=.5");
})();

/* ─ Horizontal scroll gallery ────────────────── */
(function(){
  const wrap     = document.getElementById("gallery-pin-wrap");
  const inner    = document.getElementById("gallery-pin-inner");
  const scroller = document.getElementById("gallery-scroller");
  if (!wrap || !inner || !scroller) return;

  const progress = document.getElementById("gal-progress");
  const countEl  = document.getElementById("gal-count");
  const cards    = scroller.querySelectorAll(".gcard");

  gsap.matchMedia().add("(min-width:768px)", () => {
    const getTravel = () => scroller.scrollWidth - inner.offsetWidth;

    const tween = gsap.to(scroller, {
      x: () => -getTravel(),
      ease: "none",
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: () => "+=" + getTravel(),
        pin: inner,
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          if (progress) progress.style.width = (self.progress * 100) + "%";
          const idx = Math.min(Math.round(self.progress * (cards.length - 1)), cards.length - 1);
          if (countEl) {
            countEl.textContent =
              String(idx + 1).padStart(2, "0") + " / " +
              String(cards.length).padStart(2, "0");
          }
        }
      }
    });

    return () => tween.scrollTrigger && tween.scrollTrigger.kill();
  });
})();

/* ─ Service accordion ────────────────────────── */
(function(){
  document.querySelectorAll("[data-svc]").forEach(panel=>{
    panel.addEventListener("click", ()=>{
      const isOpen = panel.classList.contains("open");
      document.querySelectorAll("[data-svc].open").forEach(p=>{
        p.classList.remove("open");
        p.querySelector(".svc-panel-toggle").textContent="+";
      });
      if(!isOpen){
        panel.classList.add("open");
        panel.querySelector(".svc-panel-toggle").textContent="×";
      }
    });
  });
})();

/* ─ Scroll reveals ───────────────────────────── */
(function(){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  },{threshold:.1,rootMargin:"0px 0px -50px 0px"});
  document.querySelectorAll(".rv").forEach(el=>io.observe(el));
})();

/* ─ Count-up numbers ─────────────────────────── */
(function(){
  function countUp(el){
    const target=+el.dataset.count, suffix=el.dataset.suffix||"", dur=1800;
    const t0=performance.now();
    (function tick(now){
      const p=Math.min((now-t0)/dur,1), ease=1-Math.pow(1-p,4);
      el.textContent=Math.floor(ease*target)+suffix;
      if(p<1) requestAnimationFrame(tick);
    })(t0);
  }
  const io=new IntersectionObserver(e=>{e.forEach(v=>{
    if(v.isIntersecting){ countUp(v.target); io.unobserve(v.target); }
  });},{threshold:.5});
  document.querySelectorAll("[data-count]").forEach(el=>io.observe(el));
})();

/* ─ Magnetic CTA ─────────────────────────────── */
(function(){
  document.querySelectorAll(".mag-el").forEach(el=>{
    el.addEventListener("mousemove",e=>{
      const r=el.getBoundingClientRect();
      el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.28}px,${(e.clientY-r.top-r.height/2)*.28}px)`;
    });
    el.addEventListener("mouseleave",()=>{ el.style.transform=""; });
  });
})();

/* ─ Optional: pill nav + floating menu button (only if present) ─ */
(function(){
  const pillWrap  = document.querySelector(".pill-nav-wrap");
  const scrollBtn = document.getElementById("scroll-menu-btn");
  if (!pillWrap || !scrollBtn) return;
  const THRESHOLD = 80;
  function onScroll(){
    const past = window.scrollY > THRESHOLD;
    pillWrap.classList.toggle("scrolled", past);
    scrollBtn.classList.toggle("visible", past);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ─ Optional: TakeThat-style tt-hamburger + mobile overlay (only if present) ─ */
(function(){
  const hamburger  = document.getElementById("tt-hamburger");
  const mobileMenu = document.getElementById("tt-mobile-menu");
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;
  function openMenu(){
    isOpen = true;
    hamburger.classList.add("open");
    hamburger.setAttribute("aria-expanded","true");
    mobileMenu.classList.add("open");
    document.body.style.overflow="hidden";
  }
  function closeMenu(){
    isOpen = false;
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded","false");
    mobileMenu.classList.remove("open");
    document.body.style.overflow="";
  }

  hamburger.addEventListener("click",()=>isOpen?closeMenu():openMenu());
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&isOpen) closeMenu();
  });
  document.querySelectorAll(".tt-mobile-link").forEach(link=>{
    link.addEventListener("click",closeMenu);
  });
  const mCta = document.querySelector(".tt-mobile-cta");
  if(mCta) mCta.addEventListener("click",closeMenu);
})();

/* ─ Optional: anatomy layers (other pages) ───── */
(function(){
  document.querySelectorAll("[data-layer]").forEach(layer=>{
    const head = layer.querySelector(".anat-head");
    if (!head) return;
    head.addEventListener("click",()=>{
      const isOpen=layer.classList.contains("open");
      document.querySelectorAll("[data-layer].open").forEach(l=>{
        l.classList.remove("open");
        const ic = l.querySelector(".anat-icon");
        if (ic) ic.textContent="+";
      });
      if(!isOpen){
        layer.classList.add("open");
        const ic = layer.querySelector(".anat-icon");
        if (ic) ic.textContent="×";
      }
    });
  });
})();

/* ─ Magnetic buttons (CTAs + nav) ─────────────── */
(function(){
  document.querySelectorAll(".btn-gold2,.btn-outline2,.tt-nav-cta,.tt-mobile-cta").forEach(el=>{
    el.addEventListener("mousemove",e=>{
      const r=el.getBoundingClientRect();
      el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.22}px,${(e.clientY-r.top-r.height/2)*.22}px)`;
    });
    el.addEventListener("mouseleave",()=>{el.style.transform="";});
  });
})();
  
  
  



