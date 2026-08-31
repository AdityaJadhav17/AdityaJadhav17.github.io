# Aditya Jadhav: Portfolio

Personal portfolio site, built as a single-page React app: hero, selected work, experience
timeline, about/skills, certifications, and a contact form, with light/dark theming and a
subtle scroll-reveal on each section.

Live at [adityajadhav17.github.io](https://adityajadhav17.github.io).

## Stack

- **React 19** + **TypeScript**, built with **Vite**
- **Tailwind CSS v4** with a token-based theme (`src/styles/theme.css`) and **shadcn/ui**
  (Radix primitives) for the accessible building blocks: `Button`, `Input`, `Textarea`,
  `Sheet` (mobile nav), etc.
- **lucide-react** for UI icons, **react-icons** for brand marks (GitHub/LinkedIn)
- **Vitest** + **Testing Library** for tests

## Structure

```
src/
├── components/
│   ├── layout/        # Navbar, Footer, ThemeToggle, SkipLink
│   ├── sections/       # Hero, Work, Experience, About, Certifications, Contact
│   ├── ui/             # shadcn/ui primitives
│   └── ProjectCard.tsx
├── content/            # Typed content: site.ts, projects.ts, experience.ts, certifications.ts
├── hooks/              # useActiveSection, useScrollReveal
├── lib/                # theme.ts (persisted light/dark/system), utils.ts
└── styles/theme.css    # design tokens, dark-mode overrides, motion rules
```

Section content lives in `src/content/*.ts`, not hardcoded in components. Update those files
to change copy, projects, experience entries, or certifications.

## Getting started

Requires Node 20.

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`.

## Scripts

| Command              | Description                                |
| --------------------- | ------------------------------------------- |
| `npm run dev`         | Start the Vite dev server                   |
| `npm run build`       | Production build to `dist/`                 |
| `npm run preview`     | Preview the production build locally        |
| `npm test`            | Run the Vitest suite                        |
| `npm run test:e2e`    | Run the Playwright end-to-end a11y suite    |
| `npm run typecheck`   | `tsc --noEmit`                              |
| `npm run lint`        | ESLint                                      |
| `npm run deploy`      | Build and publish `dist/` via `gh-pages`    |

## Features

- **Theming**: light/dark/system, resolved and applied before first paint (no flash), persisted
  to `localStorage` (`src/lib/theme.ts`).
- **Scroll reveal**: each section fades/rises into view once via `IntersectionObserver`
  (`src/hooks/useScrollReveal.ts`). It degrades to fully visible with no JS or if the observer is
  unavailable, and is neutralized under `prefers-reduced-motion`.
- **Accessibility**: skip link, visible focus states, `scroll-padding-top` so the sticky navbar
  never covers a focused element, accessible form validation (errors tied via
  `aria-describedby`, focus moves to the first invalid field), semantic heading hierarchy.
- **Contact form**: client-side validation, submits to Formspree, preserves input on a failed
  submit.

## End-to-end tests

`npm run test:e2e` runs a Playwright suite (`e2e/accessibility.spec.ts`) against a production
build served locally, covering behavior the unit tests cannot: content visibility with
JavaScript disabled, `prefers-reduced-motion` handling, keyboard traversal past the sticky
navbar, and theme persistence across a reload. See `playwright.config.ts` for how the build is
served.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`: install, typecheck, lint, test, build,
then publish `dist/` to GitHub Pages. A failing check blocks the deploy. The Playwright suite is
a local verification tool and intentionally does not run in that workflow (see
`playwright.config.ts` for why).
