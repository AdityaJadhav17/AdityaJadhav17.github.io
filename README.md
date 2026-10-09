# Aditya Jadhav: Portfolio

Personal portfolio site, built as a single-page React app: hero, selected work, experience
timeline, and an about section (skills and certifications), with a contact form and light/dark
theming. It is prerendered at build time, so the full page is in the HTML before any JavaScript
runs.

Live at [adityajadhav.dev](https://adityajadhav.dev).

## Stack

- **React 19** + **TypeScript**, built with **Vite**
- **Tailwind CSS v4** with a token-based theme (`src/styles/theme.css`) and **shadcn/ui**
  (Radix primitives) for the accessible building blocks: `Button`, `Input`, `Textarea`,
  `Sheet` (mobile nav), etc.
- **lucide-react** for UI icons, **react-icons** for brand marks (GitHub/LinkedIn)
- **Motion** (via `LazyMotion` + `m`, `domMin` features only, which keeps gesture, layout and drag code out of the bundle) for the scroll reveal; fonts self-hosted via **@fontsource-variable** (Archivo) and **@fontsource** (JetBrains Mono, stack tags only)
- **Vitest** + **Testing Library** for tests

## Structure

```
src/
├── components/
│   ├── layout/        # Navbar, MobileSheet, Footer, ThemeMenu, SkipLink
│   ├── motion/        # Reveal
│   ├── sections/      # Hero, Work, Experience, About, Contact
│   ├── ui/            # shadcn/ui primitives
│   └── ProjectCard.tsx
├── content/           # Typed content: site.ts, projects.ts, experience.ts, certifications.ts
├── hooks/             # useActiveSection
├── lib/               # head.ts (head tags), theme.ts (light/dark/system), motion.ts, utils.ts
├── entry-server.tsx   # SSR entry used by the prerender step
└── styles/theme.css   # design tokens, dark-mode overrides, motion rules
scripts/               # prerender.mjs, check-bundle.mjs, check-links.mjs
```

Section content lives in `src/content/*.ts`, not hardcoded in components. Update those files
to change copy, projects, experience entries, or certifications (which render inside About).

## Getting started

Requires Node 20.

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`.

## Scripts

| Command               | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `npm run dev`         | Start the Vite dev server                                         |
| `npm run build`       | Client build, SSR build, then prerender into `dist/index.html`    |
| `npm run preview`     | Preview the production build locally                              |
| `npm test`            | Run the Vitest suite                                              |
| `npm run test:e2e`    | Run the Playwright suite (chromium and iPhone/WebKit)             |
| `npm run typecheck`   | `tsc --noEmit`                                                    |
| `npm run lint`        | ESLint                                                            |
| `npm run check:bundle`| Fail if gzipped JS in `dist/assets` is over 130 KB (runs in CI)   |
| `npm run check:links` | Check every `https://` URL in `src/content` (local only)          |
| `npm run deploy`      | Build and publish `dist/` via `gh-pages`                          |

## How it works

- **Prerendering**: `npm run build` runs `vite build`, then `vite build --ssr
  src/entry-server.tsx --outDir dist-ssr`, then `node scripts/prerender.mjs`. The script
  renders the app to a string and injects it, plus the head tags from `src/lib/head.ts`
  (title, description, Open Graph, JSON-LD, all generated from `src/content`), into
  `dist/index.html`. Do not hand-write meta tags in `index.html`.
- **Generated assets**: `public/favicon.svg` and `public/404.html` are generated from
  `src/styles/theme.css` by `scripts/palette.mjs` (runs on `predev` and `prebuild`) and are gitignored.
- **Reveal**: `src/components/motion/Reveal.tsx` wraps below-the-fold sections. The server and
  first client render are fully visible. Only after JS attaches an `IntersectionObserver` does
  it hide content that is still below the fold, then fade it in on scroll. With no JS or no
  observer, everything stays visible. Under `prefers-reduced-motion` nothing translates. Motion runs
  through `LazyMotion` + `m` with `domMin` only, which keeps gesture, layout and drag code out of the
  bundle. The hero entrance is plain CSS.
- **Theming**: light/dark/system, resolved before first paint (no flash) and persisted to
  `localStorage` (`src/lib/theme.ts`).
- **Accessibility**: skip link, visible focus states, `scroll-padding-top` so the sticky navbar
  never covers a focused element, form errors tied to fields via `aria-describedby` with focus
  moved to the first invalid field, semantic heading hierarchy.
- **Contact form**: client-side validation, submits to Formspree, preserves input on a failed
  submit.
- **Crawlers**: `public/robots.txt` points at adityajadhav.dev; `dist/sitemap.xml` is written at build by `scripts/prerender.mjs` with the build date as `<lastmod>`.

## End-to-end tests

`npm run test:e2e` runs the Playwright specs in `e2e/` against a production build served
locally, in two projects: `chromium` and `iphone` (WebKit). They cover behavior the unit tests
cannot: content visibility with JavaScript disabled, `prefers-reduced-motion` handling,
keyboard traversal past the sticky navbar, theme persistence across a reload, and axe
accessibility checks. See `playwright.config.ts` for how the build is served.

`e2e/perf.spec.ts` (main-thread long-task ceiling at 4x CPU throttle) is skipped unless asked for:
`PERF=1 npx playwright test e2e/perf.spec.ts --project=chromium`.

## Deployment

- `.github/workflows/ci.yml` runs on pull requests to `main`: typecheck, lint, unit tests,
  Playwright, build, and the JS bundle budget. It gates the merge.
- `.github/workflows/deploy.yml` runs on push to `main`: install, typecheck, lint, test, build,
  then publish `dist/` to GitHub Pages.
- `public/CNAME` binds the site to adityajadhav.dev.
