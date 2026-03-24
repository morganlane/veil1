/* ─ Menu ─────────────────────────────────────── */
(function(){
  const nav=document.querySelector(".nav"),
        overlay=nav.querySelector(".overlay"),
        menu=nav.querySelector(".menu"),
        panels=nav.querySelectorAll(".bg-panel"),
        toggles=document.querySelectorAll("[data-menu-toggle]"),
        links=nav.querySelectorAll(".menu-link"),
        fades=nav.querySelectorAll("[data-menu-fade]"),
        btn=document.querySelector(".menu-button"),
        txts=btn.querySelectorAll("p"),
        icon=btn.querySelector(".menu-button-icon"),
        tl=gsap.timeline();

  const open=()=>{
    nav.setAttribute("data-nav","open");
    tl.clear()
      .set(nav,{display:"block"}).set(menu,{xPercent:0},"<")
      .fromTo(txts,{yPercent:0},{yPercent:-100,stagger:.2})
      .fromTo(icon,{rotate:0},{rotate:315},"<")
      .fromTo(overlay,{autoAlpha:0},{autoAlpha:1},"<")
      .fromTo(panels,{xPercent:101},{xPercent:0,stagger:.12,duration:.575},"<")
      .fromTo(links,{yPercent:140,rotate:10},{yPercent:0,rotate:0,stagger:.05},"<+=.35")
      .fromTo(fades,{autoAlpha:0,yPercent:50},{autoAlpha:1,yPercent:0,stagger:.04},"<+=.2");
  };
  const close=()=>{
    nav.setAttribute("data-nav","closed");
    tl.clear()
      .to(overlay,{autoAlpha:0}).to(menu,{xPercent:120},"<")
      .to(txts,{yPercent:0},"<").to(icon,{rotate:0},"<")
      .set(nav,{display:"none"});
  };
  toggles.forEach(t=>t.addEventListener("click",()=>nav.getAttribute("data-nav")==="open"?close():open()));
  document.addEventListener("keydown",e=>e.key==="Escape"&&nav.getAttribute("data-nav")==="open"&&close());
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
  const progress = document.getElementById("gal-progress");
  const countEl  = document.getElementById("gal-count");
  const cards    = scroller.querySelectorAll(".gcard");

  if (!wrap || !inner || !scroller) return;

  gsap.matchMedia().add("(min-width:768px)", () => {
    // Distance the scroller needs to travel horizontally
    const getTravel = () => scroller.scrollWidth - inner.offsetWidth;

    const tween = gsap.to(scroller, {
      x: () => -getTravel(),
      ease: "none",
      scrollTrigger: {
        trigger: wrap,          // trigger on the outer wrapper
        start: "top top",       // pin when wrap's top hits viewport top
        end: () => "+=" + getTravel(), // scroll distance = horizontal travel
        pin: inner,             // GSAP pins this element (sets position:fixed)
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          progress.style.width = (self.progress * 100) + "%";
          const idx = Math.min(Math.round(self.progress * (cards.length - 1)), cards.length - 1);
          countEl.textContent =
            String(idx + 1).padStart(2, "0") + " / " +
            String(cards.length).padStart(2, "0");
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





/* ─── TakeThat.com nav — hamburger toggle ─────── */
(function(){
  const hamburger  = document.getElementById("tt-hamburger");
  const mobileMenu = document.getElementById("tt-mobile-menu");
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

  // Close on Escape
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&isOpen) closeMenu();
  });

  // Close when a mobile link is clicked
  document.querySelectorAll(".tt-mobile-link").forEach(link=>{
    link.addEventListener("click",closeMenu);
  });
  const mCta = document.querySelector(".tt-mobile-cta");
  if(mCta) mCta.addEventListener("click",closeMenu);
})();



/* ─── TakeThat.com nav — hamburger toggle ─────── */
(function(){
  const hamburger  = document.getElementById("tt-hamburger");
  const mobileMenu = document.getElementById("tt-mobile-menu");
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

  // Close on Escape
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&isOpen) closeMenu();
  });

  // Close when a mobile link is clicked
  document.querySelectorAll(".tt-mobile-link").forEach(link=>{
    link.addEventListener("click",closeMenu);
  });
  const mCta = document.querySelector(".tt-mobile-cta");
  if(mCta) mCta.addEventListener("click",closeMenu);
})();

/* ─── Scroll reveals ──────────────────────────── */
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}
  });
},{threshold:.05,rootMargin:"0px 0px -48px 0px"});

/* ─── Count-up ────────────────────────────────── */
(function(){
  function countUp(el){
    const target=+el.dataset.count,dur=1600,t0=performance.now();
    (function tick(now){
      const p=Math.min((now-t0)/dur,1),v=ease(p);
      el.textContent=Math.floor(v*target);
      if(p<1)requestAnimationFrame(tick);
    })(t0);
  }
  const cIo=new IntersectionObserver(e=>{e.forEach(v=>{
    if(v.isIntersecting){countUp(v.target);cIo.unobserve(v.target);}
  });},{threshold:.5});
  document.querySelectorAll("[data-count]").forEach(el=>cIo.observe(el));
})();

/* ─── Anatomy accordion ───────────────────────── */
document.querySelectorAll("[data-layer]").forEach(layer=>{
  layer.querySelector(".anat-head").addEventListener("click",()=>{
    const isOpen=layer.classList.contains("open");
    document.querySelectorAll("[data-layer].open").forEach(l=>{
      l.classList.remove("open");l.querySelector(".anat-icon").textContent="+";
    });
    if(!isOpen){layer.classList.add("open");layer.querySelector(".anat-icon").textContent="×";}
  });
});



/* ─── Magnetic buttons two ────────────────────────── */
document.querySelectorAll(".btn-gold2,.btn-outline2,.tt-nav-cta,.tt-mobile-cta").forEach(el=>{
  el.addEventListener("mousemove",e=>{
    const r=el.getBoundingClientRect();
    el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.22}px,${(e.clientY-r.top-r.height/2)*.22}px)`;
  });
  el.addEventListener("mouseleave",()=>{el.style.transform="";});
});




/* ─── TakeThat.com nav — hamburger toggle ─────── */
(function(){
  const hamburger  = document.getElementById("tt-hamburger");
  const mobileMenu = document.getElementById("tt-mobile-menu");
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

  // Close on Escape
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&isOpen) closeMenu();
  });

  // Close when a mobile link is clicked
  document.querySelectorAll(".tt-mobile-link").forEach(link=>{
    link.addEventListener("click",closeMenu);
  });
  const mCta = document.querySelector(".tt-mobile-cta");
  if(mCta) mCta.addEventListener("click",closeMenu);
})();





