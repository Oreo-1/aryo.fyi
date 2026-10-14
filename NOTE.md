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
  main.js                  loads bootstrap / fonts / our css, then starts App.svelte
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

NOTE (mica / glass blur):
always write `-webkit-backdrop-filter` BEFORE `backdrop-filter`, like:
``` css
-webkit-backdrop-filter: var(--glass-blur);
backdrop-filter: var(--glass-blur);
```
the other way around works in `pnpm dev` but the production minifier (lightningcss) drops the unprefixed line, and then chrome/firefox show no blur after `pnpm build`.

# flow to adding a component

the whole thing is **2 steps**. there is no router, no props system, no
component registry. a component is just a `.svelte` file that `App.svelte`
imports and drops somewhere on the page.

## 1. create the file

new file in `src/sections/`, name it in **PascalCase**, same as the others:

```
src/sections/Whatever.svelte
```

start from the boring template — it's just html:

```svelte
<!-- short comment about what this is -->
<section class="py-5 mb-4" id="whatever">
    <div class="container container-custom">
        <h1>Title</h1>
        <p>text</p>
    </div>
</section>
```

copy the closest existing one instead if you're lazy (that's usually faster and
keeps things looking consistent):

| you want a… | copy |
|---|---|
| plain section + heading | `ContactHeader.svelte` |
| section with cards | `Skills.svelte` |
| section with a sliding row | `Projects.svelte` |

### need js?

only then add a `<script>` block at the top. if it touches the DOM, wrap it:

```svelte
<script>
  import { onMount } from 'svelte';

  onMount(() => {
    document.getElementById('whatever').addEventListener('click', () => {
      console.log('clicked');
    });
  });
</script>
```

## 2. wire it into the page

open `src/App.svelte` and add **two lines** — the import, and the tag:

```svelte
import Whatever from './sections/Whatever.svelte';   // with the other imports
```

```svelte
<Whatever />                <!-- where it should appear, top to bottom -->
```

order of the tags in `App.svelte` **is** the order of the page. want it higher?
move the `<Whatever />` line up. that's it.

## 3. (optional) link it from the navbar

skip this if the section doesn't need a menu button.

in your new file, give the `<section>` an `id`:

```svelte
<section id="whatever">
```

then in `src/sections/Navbar.svelte`, copy an existing `<li>` in the `<ul>`,
give it a unique id, and copy the matching `document.getElementById(...)`
block inside `onMount`:

```svelte
<li class="nav-item">
    <a class="nav-link mx-1 navnavnav" id="navWhatever" href="#whatever">
        Whatever
    </a>
</li>
```

```js
document.getElementById("navWhatever").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("whatever").scrollIntoView({ behavior: "smooth" });
});
```

> the button id (`navWhatever`) and the section id (`whatever`) are two
> different things, don't mix them up.

## gotchas

- **ids must be unique** across the page. two sections with `id="projects"` =
  `getElementById` finds the first one and you debug for an hour.
- **assets start with `/`** — `/assets/icons/foo.svg`, because the files live in
  `public/`. not `./assets/...`.
- **styling is mostly bootstrap classes.** `container container-custom`,
  `row g-4` + `col-md-4`, `py-5 mb-4`, `card mica-card`. only drop into
  `src/styles/app.css` when there's no class for it.
- **custom css?** always write `-webkit-backdrop-filter` **before**
  `backdrop-filter`. the other way works in dev but `pnpm build` drops the
  unprefixed line and the blur disappears.
- **importing a lib?** import it inside the component that uses it
  (`import 'swiper/css'`), not in `main.js` — keeps it from loading for
  everyone. only `app.css` + bootstrap belong in `main.js`.
- **no props / no `export let`** here. sections are self-contained. if you
  really need to pass data in, it's a plain `<script>` variable in
  `App.svelte`, not a component api.

## notes
- asset paths start with `/` (`/assets/...`, `/files/...`) because the files live in `public/`.
- the mobile menu is bootstrap's collapse module (imported in `Navbar.svelte`), driven by the same `data-bs-*` attributes as before.
- three.js / vanta are loaded lazily in `Background.svelte` so they don't block the first paint.
- the theme toggle is still hidden (`FIX-SOON` class in app.css).
- the contact form validates, but the mail api isn't wired yet (see the TODO in `ContactForm.svelte`).



