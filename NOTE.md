### dev
```sh
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # -> dist/
pnpm preview    # serve dist/
```

### deploy
using
``` sh
# pushing to cloudflare pages
pnpm build && wrangler pages deploy dist --project-name aryofyi
```

``` sh
# with docker
pnpm docker:up
```

### where stuff lives
```
index.html                 vite entry (meta tags)
public/                    served as-is: /assets, /files, /fijecraft, favicon
src/main.js                css imports + mount
src/App.svelte             page = list of sections
src/styles/app.css         the old style5.css, unchanged
src/lib/components/        Navbar, Hero, Skills, TechStack, Experience, Projects, Contact, Footer, ...
src/lib/data/              projects, skills, tech, experience, links (edit content here)
src/lib/actions/tilt.js    3D tilt on the profile picture
```
add a project: append an object in `src/lib/data/projects.js`.

