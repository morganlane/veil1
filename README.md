# VEIL Studio — Merged Website
## File Structure

```
veil-studio/
├── index.html          ← Home page
├── about.html          ← About page (Draft 7)
├── services.html       ← Services page (6 services)
├── contact.html        ← Contact / Brief filing page
├── experience.html     ← Experimental immersive page (standalone)
│
├── css/
│   ├── shared.css      ← Tokens, reset, fonts, nav, footer, buttons, .rv reveals
│   ├── home.css        ← Home-specific: hero, ticker, gallery, services accordion
│   ├── about.css       ← About-specific: preloader, drafts, dossiers, tension bars
│   ├── contact.css     ← Contact-specific: preloader, clocks, form, studios
│   └── service.css     ← Services-specific: page hero, service blocks, FAQ
│
└── js/
    ├── shared.js       ← Nav menu, scroll reveals, count-up, magnetic buttons
    ├── home.js         ← Hero ticker, intro animation, horizontal gallery scroll
    ├── about.js        ← Preloader, tension bars, strike animations
    ├── contact.js      ← Preloader, live clocks, form submission
    └── service.js      ← FAQ accordion, scrollspy, hero reveals, ring parallax
```

## Navigation Map

| Old filename           | New filename     |
|------------------------|------------------|
| home-page/dist/index   | index.html       |
| veil-about/dist/index  | about.html       |
| veil-contact/dist/index| contact.html     |
| veil-service/dist/index| services.html    |

## How to Run

Open any `.html` file directly in a browser, or serve with a local server:
```
npx serve .
# or
python3 -m http.server 8080
```

## Key Architecture Notes

### Nav Menu Fix (shared.js)
The `.nav-menu` slide-in panel is moved to the very END of `<body>` at
runtime via `document.body.appendChild(nav)`. This is intentional — it
escapes CSS stacking contexts created by `backdrop-filter`, `transform`,
and `perspective` on ancestor elements, which would otherwise confine
`position:fixed` to a sub-viewport area rather than the full screen.

### CSS Architecture  
- `shared.css` loads first and provides all common styles
- Page CSS files load second and override/extend as needed
- External stylesheets (Tailwind, Webflow, Slater) were removed —
  they caused cascade conflicts. All styles are now self-contained.

### JS Architecture
- `shared.js` loads on every page: nav, reveals, count-up, magnetics
- Page-specific JS loads after shared.js for each page's unique features
- GSAP plugins (ScrollTrigger, SplitText) only load on pages that need them

## Brand Tokens (css/shared.css :root)

| Variable       | Value                    | Usage                    |
|----------------|--------------------------|--------------------------|
| --bg           | #0c0b09                  | Page background          |
| --gold         | #c4a46b                  | Primary accent           |
| --cream        | #f0e6d3                  | Primary text             |
| --cubic        | cubic-bezier(.65,.01,…)  | Primary easing curve     |
| --menu-padding | 2em                      | Nav menu inner spacing   |
