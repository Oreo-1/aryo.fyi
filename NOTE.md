### dev
```sh
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # -> dist/
pnpm preview    # serve dist/
```

### deploy
``` sh
# pushing to cloudflare pages
pnpm build && wrangler pages deploy dist --project-name aryofyi
```

``` sh
# with docker
pnpm docker:up
```


## how the files are organised

thx claude

```
index.html                 the real html page: meta tags + <div id="app">
public/                    served as-is: /assets, /files, /fijecraft, favicon

src/
  main.js                  loads bootstrap / swiper / our css, then starts App.svelte
  App.svelte               the whole page = one line per section, top to bottom
  styles/app.css           the old style5.css, unchanged (global, like a <link> tag)
  styles/fira-sans.css     the font

  sections/
    Navbar.svelte          navbar, smooth scroll buttons, mobile menu
    Background.svelte      vanta waves + the (hidden) dark mode toggle
    Hero.svelte            hero, cycling text, profile picture tilt
    Skills.svelte
    TechStack.svelte
    Experience.svelte
    Projects.svelte        both swiper rows
    ContactHeader.svelte   "Contacts" heading
    ContactForm.svelte     message form + other ways to reach me
    Footer.svelte
```

## everyday edits

Everything is plain html, so just edit the text in the section file:

- **add a project** → `Projects.svelte`, copy a `<div class="swiper-slide">` block into one of the two rows
- **add a timeline entry** → `Experience.svelte`, copy a `<div class="timeline-item">`
- **add a tech card / skill card** → `TechStack.svelte` / `Skills.svelte`, copy a card
- **change the rotating tagline** → the `<p class="cycling-text">` lines in `Hero.svelte`
- **change how something looks** → `src/styles/app.css`

**add a new section:** create `src/sections/Whatever.svelte` (html inside), then add two lines to `App.svelte`:
`import Whatever from './sections/Whatever.svelte';` and `<Whatever />`.

## the only svelte things you need to know

| you see | it means |
|---|---|
| `<script> ... </script>` at the top | the js of this section |
| `onMount(() => { ... })` | run this once the section is on the page (like `DOMContentLoaded`). whatever you `return` runs when it's removed |
| `import X from './X.svelte'` + `<X />` | (App.svelte only) use a section like an html tag |

html and js inside are normal: `document.getElementById(...)`, `addEventListener(...)`, etc.

## notes
- asset paths start with `/` (`/assets/...`, `/files/...`) because the files live in `public/`.
- the mobile menu is bootstrap's collapse module (imported in `Navbar.svelte`), driven by the same `data-bs-*` attributes as before.
- three.js / vanta are loaded lazily in `Background.svelte` so they don't block the first paint.
- the theme toggle is still hidden (`FIX-SOON` class in app.css).
- the contact form validates, but the mail api isn't wired yet (see the TODO in `ContactForm.svelte`).



