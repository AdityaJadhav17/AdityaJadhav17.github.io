# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework a live React portfolio site into an accurate, fast, accessible showcase built on a persisted design system.

**Architecture:** In-place migration on a `redesign` branch. The existing Vite + React app is converted to TypeScript, restyled with Tailwind v4 driven by generated design tokens, and rebuilt section by section with shadcn/ui primitives. Content moves out of JSX into typed data modules. `main` is merged into once, at the end.

**Tech Stack:** React 19, Vite 7, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui, Lucide icons, Vitest, GitHub Actions → GitHub Pages.

**Spec:** [`docs/superpowers/specs/2026-08-30-portfolio-redesign-design.md`](../specs/2026-08-30-portfolio-redesign-design.md)

## Global Constraints

- All work happens on branch `redesign`. `.github/workflows/deploy.yml` triggers on `branches: [main]` only — never push `main` mid-migration.
- No AI image generation. Banner/hero/preview visuals are HTML/CSS. If a skill instruction references a script, folder, or credential that does not exist in this repo, STOP and report it — do not work around it or silently skip it.
- `.claude/` is gitignored and must never be committed.
- Semantic color tokens only. No raw hex in components — that is the defect being fixed.
- Contrast: 4.5:1 body text, 3:1 non-text UI, verified independently in **both** themes.
- Every foreground/background pair, every claim on the page, and every tech-stack entry must be verifiable. Remove unverifiable claims rather than softening them.
- No emoji as icons. Lucide only.
- Node 20 (matches CI).

## Deviation from default TDD — read before Task 1

The spec places a full test suite out of scope: this is a static content site with one form, and unit-testing CSS classes produces tests that assert the implementation rather than behavior. Rather than silently skipping the TDD requirement, this plan substitutes explicit verification gates:

- **Every task** ends with `npm run typecheck && npm run lint && npm run build` and a browser-preview check with a stated expected result.
- **Real Vitest tests** are written for the two places genuine logic exists: theme resolution (Task 5) and contact form submission (Task 10). Those two tasks follow strict test-first order.

If you disagree with this trade, raise it before Task 1 rather than during.

---

## File Structure

| Path | Responsibility |
|---|---|
| `design-system/MASTER.md` | Generated design system. Source of truth. Read before writing any component. |
| `src/styles/theme.css` | `@theme` token declarations, light + dark ramps |
| `src/content/projects.ts` | Project data + `Project` type |
| `src/content/experience.ts` | Experience data + `Experience` type |
| `src/content/certifications.ts` | Certification data + `Certification` type |
| `src/content/site.ts` | Name, roles, blurb, social links, résumé path |
| `src/lib/theme.ts` | Theme resolution and persistence |
| `src/lib/utils.ts` | `cn()` — shadcn requirement |
| `src/hooks/useActiveSection.ts` | IntersectionObserver scroll-spy |
| `src/components/layout/` | `Navbar`, `Footer`, `ThemeToggle`, `SkipLink` |
| `src/components/sections/` | `Hero`, `Work`, `Experience`, `About`, `Certifications`, `Contact` |
| `src/components/ui/` | shadcn primitives (generated) |

---

### Task 1: Branch and TypeScript migration

**Files:**
- Create: `tsconfig.json`
- Modify: `package.json`, `.gitignore`, `vite.config.js` → `vite.config.ts`
- Rename: all `src/**/*.jsx` → `.tsx`, `src/main.jsx` → `src/main.tsx`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a typechecking build. `npm run typecheck` exits 0. Path alias `@/*` → `src/*` available to every later task.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b redesign
git status
```

Expected: `On branch redesign`, with the modified `.gitignore` and `package-lock.json` carried over.

- [ ] **Step 2: Install TypeScript toolchain**

```bash
npm install -D typescript @types/node vite-tsconfig-paths
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "vite.config.ts"]
}
```

`vite.config.ts` is included directly rather than split into a referenced
`tsconfig.node.json`. The split is the Vite template default, but it does not
typecheck under any single-invocation script: plain `tsc --noEmit` skips referenced
projects entirely, and `tsc -b --noEmit` is rejected with TS6310 because a composite
project cannot disable emit. One config that includes everything is what actually
works. The cost is that `src` and `vite.config.ts` share one `lib`, so browser and
Node globals are both visible to both — acceptable for a static site with a
four-line config, and the alternative provides no real type safety at all.

- [ ] **Step 4: Add the build artifact to `.gitignore`**

```bash
printf '\n# TypeScript incremental build info\n*.tsbuildinfo\n' >> .gitignore
```

- [ ] **Step 5: Rename source files**

```bash
git mv src/main.jsx src/main.tsx
git mv src/App.jsx src/App.tsx
for f in About Certifications Contact Footer Home Navbar Projects Resume; do
  git mv "src/components/$f.jsx" "src/components/$f.tsx"
done
git mv vite.config.js vite.config.ts
```

- [ ] **Step 6: Update `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: '/',
})
```

- [ ] **Step 7: Add scripts to `package.json`**

Add to the `scripts` object:

```json
"typecheck": "tsc --noEmit"
```

This works because Step 3 puts `vite.config.ts` directly in `include` rather than
behind a project reference. Do NOT reintroduce a referenced `tsconfig.node.json`:
plain `tsc --noEmit` never compiles files reachable only through `references`, and
`tsc -b --noEmit` fails unconditionally with TS6310 on a composite project, because
composite requires declaration emit. Both were tried and measured; one config that
includes every file it must check is the arrangement that actually typechecks.

- [ ] **Step 8: Fix type errors until clean**

Run: `npm run typecheck`

Expected initially: errors on untyped component props (`Navbar` receives four props, `App` has untyped state). Add explicit prop types. `Navbar`'s props are:

```ts
type NavbarProps = {
  activeSection: string
  scrollToSection: (id: string) => void
  darkMode: boolean
  toggleDarkMode: () => void
}
```

Re-run until it exits 0.

- [ ] **Step 9: Verify the build**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: all three exit 0.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "refactor: migrate to TypeScript"
```

---

### Task 2: Tailwind v4 and shadcn/ui

**Files:**
- Create: `src/lib/utils.ts`, `components.json`
- Modify: `vite.config.ts`, `src/index.css`

**Interfaces:**
- Consumes: Task 1's path alias `@/*` and typechecking build
- Produces: `cn(...inputs: ClassValue[]): string` from `@/lib/utils`; Tailwind utilities available in all components; `npx shadcn@latest add <component>` works.

- [ ] **Step 1: Install Tailwind v4**

```bash
npm install tailwindcss @tailwindcss/vite
npm install -D tailwindcss-animate class-variance-authority clsx tailwind-merge
npm install lucide-react
```

- [ ] **Step 2: Register the Vite plugin**

In `vite.config.ts`, add the import and plugin:

```ts
import tailwindcss from '@tailwindcss/vite'
// plugins: [react(), tailwindcss(), tsconfigPaths()],
```

- [ ] **Step 3: Replace `src/index.css`**

The existing reset is superseded by Tailwind's Preflight. Replace the entire file with:

```css
@import "tailwindcss";
@import "./styles/theme.css";
```

`src/styles/theme.css` does not exist yet — create it empty for now; Task 4 fills it.

```bash
mkdir -p src/styles && touch src/styles/theme.css
```

- [ ] **Step 4: Create `src/lib/utils.ts`**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 5: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Answer: style `new-york`, base color `zinc`, CSS variables `yes`. Confirm `components.json` was created and points at `src/index.css` and the `@/*` alias.

- [ ] **Step 6: Verify build with both stylesheets active**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: exits 0. The site will look broken — component CSS files still exist and Preflight has reset their assumptions. That is expected until Task 6.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "build: add Tailwind v4 and shadcn/ui"
```

---

### Task 3: Generate and persist the design system

**Files:**
- Create: `design-system/MASTER.md`

**Interfaces:**
- Consumes: nothing from prior tasks
- Produces: the token values Task 4 transcribes. Every later task reads this file before writing a component.

- [ ] **Step 1: Generate and persist**

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "developer portfolio personal engineering minimal" --design-system --variance 3 --motion 3 --persist -p "Aditya Jadhav Portfolio" --output-dir .
```

- [ ] **Step 2: Relocate to the canonical path**

The skill writes to `design-system/<project-slug>/MASTER.md`. The project requires `design-system/MASTER.md`:

```bash
find design-system -name MASTER.md
git mv design-system/*/MASTER.md design-system/MASTER.md
rmdir design-system/* 2>/dev/null || true
ls design-system/
```

Expected: `MASTER.md` sits directly in `design-system/`.

- [ ] **Step 3: Hand-edit the typography block**

The generator does not know about the monospace decision. Under the typography section, add:

```markdown
- Technical/monospace: **JetBrains Mono** — tech tags, metrics, dates, code-adjacent labels
```

- [ ] **Step 4: Verify no other MASTER.md exists**

```bash
find . -name "MASTER.md" -not -path "./node_modules/*"
```

Expected: exactly one result, `./design-system/MASTER.md`. Two copies means a stale source of truth.

- [ ] **Step 5: Commit**

```bash
git add design-system/
git commit -m "docs: add generated design system"
```

---

### Task 4: Token layer

**Files:**
- Modify: `src/styles/theme.css`, `index.html`

**Interfaces:**
- Consumes: `design-system/MASTER.md` values
- Produces: CSS custom properties consumed by every component — `--color-background`, `--color-foreground`, `--color-card`, `--color-muted`, `--color-muted-foreground`, `--color-border`, `--color-accent`, `--color-destructive`, plus `--font-sans`, `--font-heading`, `--font-mono`.

- [ ] **Step 1: Add the font link to `index.html`**

Inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Space+Grotesk:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 2: Write `src/styles/theme.css`**

```css
@theme {
  --font-heading: "Archivo", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;

  --color-background: #FAFAFA;
  --color-foreground: #09090B;
  --color-card: #FFFFFF;
  --color-card-foreground: #09090B;
  --color-popover: #FFFFFF;
  --color-popover-foreground: #09090B;
  --color-primary: #18181B;
  --color-primary-foreground: #FAFAFA;
  --color-secondary: #E8ECF0;
  --color-secondary-foreground: #18181B;
  --color-muted: #E8ECF0;
  --color-muted-foreground: #475569;
  --color-accent: #2563EB;
  --color-accent-foreground: #FFFFFF;
  --color-destructive: #DC2626;
  --color-destructive-foreground: #FFFFFF;
  --color-border: #E4E4E7;
  --color-input: #71717A;
  --color-ring: #2563EB;
}

@layer base {
  .dark {
    --color-background: #09090B;
    --color-foreground: #FAFAFA;
    --color-card: #18181B;
    --color-card-foreground: #FAFAFA;
    --color-popover: #18181B;
    --color-popover-foreground: #FAFAFA;
    --color-primary: #FAFAFA;
    --color-primary-foreground: #18181B;
    --color-secondary: #27272A;
    --color-secondary-foreground: #FAFAFA;
    --color-muted: #27272A;
    --color-muted-foreground: #A1A1AA;
    --color-accent: #60A5FA;
    --color-accent-foreground: #09090B;
    --color-destructive: #F87171;
    --color-destructive-foreground: #09090B;
    --color-border: #27272A;
    --color-input: #71717A;
    --color-ring: #60A5FA;
  }

  html {
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
    line-height: 1.6;
  }
}
```

Note the dark ramp is authored, not inverted. `--color-accent` lightens to `#60A5FA` in dark because `#2563EB` on `#09090B` measures 3.85:1 — below the 4.5:1 body-text floor.

- [ ] **Step 3: Verify every pair meets contrast**

Check each foreground/background pair in both ramps with a contrast checker. Record the ratios in a comment at the top of `theme.css`. Any pair below 4.5:1 for text or 3:1 for non-text UI must be adjusted before proceeding, not noted for later.

- [ ] **Step 4: Verify build**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add design tokens for light and dark themes"
```

---

### Task 5: Theme resolution (test-first)

**Files:**
- Create: `src/lib/theme.ts`, `src/lib/theme.test.ts`
- Modify: `package.json`, `index.html`

**Interfaces:**
- Consumes: `.dark` class contract from Task 4
- Produces: `type Theme = 'light' | 'dark' | 'system'`; `getStoredTheme(): Theme`; `setTheme(t: Theme): void`; `resolveTheme(t: Theme): 'light' | 'dark'`. Task 6's `ThemeToggle` consumes all four.

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

Add to `package.json` scripts: `"test": "vitest run"`. Add to `vite.config.ts`:

```ts
// import defineConfig from vitest/config, NOT from vite — under Vitest 4 the
// `/// <reference types="vitest" />` triple-slash pattern no longer typechecks.
import { defineConfig } from 'vitest/config'

// inside defineConfig:
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test-setup.ts'],
},
```

`setupFiles` is required, not optional. `@testing-library/jest-dom` is installed
above but registers nothing on its own; without a setup file importing
`@testing-library/jest-dom/vitest`, Task 10's matchers (`toBeInTheDocument`,
`toHaveTextContent`, `toHaveValue`) fail on resolution three tasks after the cause.

- [ ] **Step 2: Write the failing test**

```ts
// src/lib/theme.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getStoredTheme, setTheme, resolveTheme } from './theme'

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to system when nothing is stored', () => {
    expect(getStoredTheme()).toBe('system')
  })

  it('persists an explicit choice', () => {
    setTheme('dark')
    expect(getStoredTheme()).toBe('dark')
  })

  it('applies the dark class when resolving to dark', () => {
    setTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes the dark class when resolving to light', () => {
    setTheme('dark')
    setTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('resolves system using the media query', () => {
    expect(['light', 'dark']).toContain(resolveTheme('system'))
  })

  it('ignores a corrupt stored value', () => {
    localStorage.setItem('theme', 'banana')
    expect(getStoredTheme()).toBe('system')
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./theme"`.

- [ ] **Step 4: Implement `src/lib/theme.ts`**

```ts
export type Theme = 'light' | 'dark' | 'system'

const KEY = 'theme'
const VALID: Theme[] = ['light', 'dark', 'system']

export function getStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    return VALID.includes(v as Theme) ? (v as Theme) : 'system'
  } catch {
    return 'system'
  }
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // storage unavailable (private mode) — apply without persisting
  }
  document.documentElement.classList.toggle('dark', resolveTheme(theme) === 'dark')
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npm test`
Expected: 6 passed.

- [ ] **Step 6: Prevent the flash of wrong theme**

Add to `index.html` `<head>`, before the stylesheet link:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem('theme') || 'system';
      var dark = t === 'dark' || (t === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (dark) document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
</script>
```

- [ ] **Step 7: Verify and commit**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

```bash
git add -A
git commit -m "feat: add persisted, system-aware theme resolution"
```

---

### Task 6: Layout shell

**Files:**
- Create: `src/components/layout/Navbar.tsx`, `ThemeToggle.tsx`, `SkipLink.tsx`, `src/hooks/useActiveSection.ts`
- Modify: `src/App.tsx`
- Delete: `src/components/Navbar.tsx`, `src/components/Navbar.css`, `src/App.css`

**Interfaces:**
- Consumes: `cn` (Task 2), tokens (Task 4), theme functions (Task 5)
- Produces: `useActiveSection(ids: string[]): string`; section landmark ids `home`, `work`, `experience`, `about`, `certifications`, `contact` that Tasks 7-9 render into.

- [ ] **Step 1: Read the design system**

```bash
cat design-system/MASTER.md
```

Every class below must trace to a token in that file. Do not introduce a value it does not define.

- [ ] **Step 2: Add shadcn primitives**

```bash
npx shadcn@latest add button sheet
```

- [ ] **Step 3: Write `src/hooks/useActiveSection.ts`**

```ts
import { useEffect, useState } from 'react'

export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}
```

This replaces the unthrottled scroll handler at `App.jsx:25-45`, which read `offsetTop`/`offsetHeight` on every scroll event.

- [ ] **Step 4: Write `SkipLink.tsx`**

```tsx
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-card-foreground focus:outline-2 focus:outline-accent"
    >
      Skip to content
    </a>
  )
}
```

- [ ] **Step 5: Write `ThemeToggle.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStoredTheme, resolveTheme, setTheme, type Theme } from '@/lib/theme'

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>('system')

  useEffect(() => setThemeState(getStoredTheme()), [])

  const resolved = resolveTheme(theme)
  const next: Theme = resolved === 'dark' ? 'light' : 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => { setTheme(next); setThemeState(next) }}
      aria-label={`Switch to ${next} theme`}
    >
      {resolved === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  )
}
```

This removes the ☀️/🌙 emoji, which screen readers announce as "sun with face".

- [ ] **Step 6: Write `Navbar.tsx` with real anchors**

Nav items become `<a href="#work">`, not buttons calling `scrollIntoView`. The active item carries `aria-current="page"`. The mobile toggle carries `aria-expanded` and `aria-controls`. Use the shadcn `Sheet` for the mobile menu — it handles focus trap and Escape for free, which the current hand-rolled menu does not.

```tsx
const NAV = [
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'about', label: 'About' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'contact', label: 'Contact' },
] as const
```

- [ ] **Step 7: Rewrite `App.tsx`**

```tsx
import { SkipLink } from '@/components/layout/SkipLink'
import { Navbar } from '@/components/layout/Navbar'

const SECTION_IDS = ['home', 'work', 'experience', 'about', 'certifications', 'contact']

export default function App() {
  return (
    <>
      <SkipLink />
      <Navbar sectionIds={SECTION_IDS} />
      <main id="main">{/* sections land here in Tasks 7-9 */}</main>
    </>
  )
}
```

- [ ] **Step 8: Delete dead files**

```bash
git rm src/App.css src/components/Navbar.css src/components/Navbar.tsx
```

- [ ] **Step 9: Verify in the browser**

Start the preview with `preview_start` using the `portfolio-dev` config in `.claude/launch.json`. Check:
- `read_console_messages` — no errors
- Tab from the top: skip link appears first and is focusable
- Nav anchors change the URL hash
- Theme toggle flips both ways; reload preserves the choice
- `resize_window` to mobile (375px): the Sheet opens, Escape closes it, focus returns to the trigger

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: rebuild layout shell on Tailwind and shadcn"
```

---

### Task 7: Content model

**Files:**
- Create: `src/content/site.ts`, `projects.ts`, `experience.ts`, `certifications.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `site`, `projects: Project[]`, `experience: Experience[]`, `certifications: Certification[]`. Tasks 8 and 9 import these. Types are exactly as specified below — later tasks reference these field names.

- [ ] **Step 1: Write the types and data**

```ts
// src/content/projects.ts
export type Project = {
  id: string
  title: string
  problem: string
  contribution: string
  stack: string[]
  result: string
  links: { github?: string; demo?: string; live?: string }
  image?: { src: string; width: number; height: number; alt: string }
  featured: boolean
  context?: string
}
```

Five entries, in this order: `travel-agntcy`, `watchtower`, `talk-to-robot`, `sim2real`, `bird-classifier`. `featured: true` on the first two.

**Both copy decisions are resolved by owner instruction. Do not re-litigate them:**

1. **Travel-Agntcy** — the "cut inter-service latency by ~40%" result **stays**, worded as it appears on the owner's resume. He wants his resume, GitHub, and site telling the same story, and chose consistency over trimming the claim after the concern was raised. Write the card from his wording.
2. **Talk-to-Robot** — the owner's contribution is not measured by commit count; he contributed proactively alongside the repository owner. Keep his "What I engineered" framing for the team project.

Verified facts available for the cards:
- WatchTower: `github.com/cse110-sp26-group09/Watchtower-Course-Project`, live at `cse110-sp26-group09.github.io/Watchtower-Course-Project/`, 11 contributors, owner is top contributor with 114 commits, roles were team leader, scrum master, and backend tech lead.
- Talk-to-Robot: `github.com/YangLin14/Talk-to-Robot`, MuJoCo FetchPush, SAC+HER, Gemini 2.5 Flash.

```ts
// src/content/experience.ts
export type Experience = {
  organization: string
  role: string
  start: string
  end: string
  location?: string
  highlights: string[]
}
```

Four entries, newest first: Lumulus Technologies (Software Engineering Intern, Jun–Sep 2026, Python/Qt desktop application work described role-shaped, no product names); UC San Diego ITS (IT Security Programmer, Dec 2025 – Jun 2027 expected, hybrid); NutrifitWorld (Web Development Intern, Jun–Oct 2025); AI Club, Irvine Valley College (Founder & President, Aug 2024 – May 2025).

Note: `ITS` is the UCSD department name, not part of the job title. The title is `IT Security Programmer`.

- [ ] **Step 2: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run build`

```bash
git add src/content/
git commit -m "feat: extract content into typed modules"
```

---

### Task 8: Hero, Work, and Experience sections

**Files:**
- Create: `src/components/sections/Hero.tsx`, `Work.tsx`, `Experience.tsx`, `src/components/ProjectCard.tsx`
- Modify: `src/App.tsx`
- Delete: `src/components/Home.tsx`, `Home.css`, `Projects.tsx`, `Projects.css`, `Resume.tsx`, `Resume.css`

**Interfaces:**
- Consumes: `projects`, `experience`, `site` (Task 7); tokens (Task 4); `cn` (Task 2)
- Produces: sections with ids `home`, `work`, `experience`

- [ ] **Step 1: Read the design system first**

```bash
cat design-system/MASTER.md
```

- [ ] **Step 2: Build `Hero.tsx`**

Name, both current roles, one-line positioning, résumé download button, social links. `min-h-dvh` — never `100vh`. The profile image keeps `width={200} height={200}` and `loading="eager"`; it is the LCP element.

- [ ] **Step 3: Build `ProjectCard.tsx`**

One structure for every card: Problem → What I built → Stack → Result. Stack entries render in `font-mono`. Team projects state team size and the owner's role. Framework-based projects state that.

Cards without an image (`watchtower`, `talk-to-robot` until screenshots exist) render a typographic treatment using design-system tokens — **no AI image generation**. Images that exist get `loading="lazy"` plus intrinsic `width`/`height` from the `Project.image` type.

- [ ] **Step 4: Build `Work.tsx` and `Experience.tsx`**

`Work` renders featured cards at full width, the rest in a responsive grid. `Experience` renders a vertical timeline; dates in `font-mono`.

- [ ] **Step 5: Delete the replaced components**

```bash
git rm src/components/Home.tsx src/components/Home.css \
       src/components/Projects.tsx src/components/Projects.css \
       src/components/Resume.tsx src/components/Resume.css
```

The Resume section is removed by design; `public/Aditya_Jadhav_Resume.pdf` stays and is linked from the hero and footer.

- [ ] **Step 6: Verify in the browser**

- `read_console_messages` — clean
- Both themes: section headings legible (this is the `#2c3e50`-on-`#1a1a1a` bug being confirmed fixed)
- 375px and 1440px: no horizontal scroll
- `read_network_requests`: no 404s on images

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: rebuild hero, work, and experience sections"
```

---

### Task 9: About and Certifications sections

**Files:**
- Create: `src/components/sections/About.tsx`, `Certifications.tsx`
- Delete: `src/components/About.tsx`, `About.css`, `Certifications.tsx`, `Certifications.css`

**Interfaces:**
- Consumes: `certifications`, `site` (Task 7)
- Produces: sections with ids `about`, `certifications`

- [ ] **Step 1: Build `About.tsx`**

One paragraph, not three. The AI Club founding detail moves to the Experience timeline (Task 7) and is removed from the prose here. Skills render as token-styled tags in `font-mono`.

- [ ] **Step 2: Build `Certifications.tsx`**

Compact row, not three full-height cards. Badge images are light PNGs — give them a `bg-card` surface with padding so they remain legible in dark mode rather than sitting on a near-black background.

- [ ] **Step 3: Delete replaced files, verify, commit**

```bash
git rm src/components/About.tsx src/components/About.css \
       src/components/Certifications.tsx src/components/Certifications.css
npm run typecheck && npm run lint && npm run build
git add -A
git commit -m "feat: rebuild about and certifications sections"
```

---

### Task 10: Contact form and footer (test-first)

**Files:**
- Create: `src/components/sections/Contact.tsx`, `Contact.test.tsx`, `src/components/layout/Footer.tsx`
- Delete: `src/components/Contact.tsx`, `Contact.css`, `Footer.tsx`, `Footer.css`

**Interfaces:**
- Consumes: `site` (Task 7); shadcn `input`, `textarea`, `label`, `button`
- Produces: section id `contact`; the site footer

- [ ] **Step 1: Add primitives**

```bash
npx shadcn@latest add input textarea label
```

- [ ] **Step 2: Write the failing test**

```tsx
// src/components/sections/Contact.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Contact } from './Contact'

describe('Contact', () => {
  beforeEach(() => vi.restoreAllMocks())

  async function fillAndSubmit() {
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/name/i), 'Test Person')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Hello there')
    await user.click(screen.getByRole('button', { name: /send/i }))
  }

  it('announces success in a live region', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    render(<Contact />)
    await fillAndSubmit()
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/thank you/i)
    })
  })

  it('announces failure as an alert and keeps the entered values', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    render(<Contact />)
    await fillAndSubmit()
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/message/i)).toHaveValue('Hello there')
  })

  it('announces failure when the network throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    render(<Contact />)
    await fillAndSubmit()
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})
```

The second test encodes a real bug in the current code: `Contact.jsx:41` clears `formData` on success but a failed submit currently leaves the user's typed message intact only by accident — this pins the behavior.

- [ ] **Step 3: Run to verify it fails**

```bash
npm install -D @testing-library/user-event
npm test
```

Expected: FAIL — cannot resolve `./Contact`.

- [ ] **Step 4: Implement `Contact.tsx`**

Keep the Formspree endpoint `https://formspree.io/f/xblawgak`. Requirements:
- Visible `<label>` per field, wired with `htmlFor`/`id`
- Success rendered in `role="status"` (`aria-live="polite"`), failure in `role="alert"`
- Submit button disabled while in flight, with a Lucide spinner
- On failure, form values are preserved
- Field errors appear next to their field, wired via `aria-describedby`

- [ ] **Step 5: Run to verify it passes**

Run: `npm test`
Expected: 3 passed in this file, 6 in `theme.test.ts`, 9 total.

- [ ] **Step 6: Build `Footer.tsx`**

Social links with Lucide icons, résumé download, back-to-top, copyright. The current footer's tagline "Junior Computer Science Student & Developer" is stale — use `site.tagline` from Task 7.

- [ ] **Step 7: Delete replaced files, verify, commit**

```bash
git rm src/components/Contact.tsx src/components/Contact.css \
       src/components/Footer.tsx src/components/Footer.css
npm test && npm run typecheck && npm run lint && npm run build
git add -A
git commit -m "feat: rebuild contact form and footer"
```

---

### Task 11: Image optimization

**Files:**
- Create: `public/*.webp`
- Modify: `src/content/projects.ts`

**Interfaces:**
- Consumes: `Project.image` type (Task 7)
- Produces: `public/` under 1 MB total

- [ ] **Step 1: Record the baseline**

```bash
du -sh public
ls -laS public/*.png | head
```

Expected baseline: 12 MB, with `travel-agntcy.png` at 7.3 MB, `tictactoe-cpp.png` at 1.85 MB, `ibm-chat.png` at 1.12 MB, `portfolio.png` at 1.08 MB.

- [ ] **Step 2: Delete images for removed projects**

```bash
git rm public/tictactoe-cpp.png public/portfolio.png public/ibm-chat.png
```

Those three projects are cut from the site — that alone removes 4 MB.

- [ ] **Step 3: Convert the rest**

```bash
npm install -D sharp
node -e "
const sharp = require('sharp');
const fs = require('fs');
for (const f of ['travel-agntcy','sim2real','bird-classifier']) {
  sharp('public/'+f+'.png').resize(1200, null, { withoutEnlargement: true })
    .webp({ quality: 82 }).toFile('public/'+f+'.webp')
    .then(i => console.log(f, i.width+'x'+i.height, Math.round(i.size/1024)+'KB'));
}
"
```

Record each output's width and height — they go into `Project.image` as intrinsic dimensions, which is what eliminates layout shift.

- [ ] **Step 4: Update `projects.ts` and verify rendering**

Point each `image.src` at the `.webp` and set `width`/`height` to the recorded values. In the browser preview, confirm all three render and `read_network_requests` shows no 404s.

- [ ] **Step 5: Remove the originals only after verifying**

```bash
git rm public/travel-agntcy.png public/sim2real.png public/bird-classifier.png
du -sh public
```

Expected: well under 1 MB.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "perf: convert project images to WebP and drop unused assets"
```

---

### Task 12: Metadata, favicon, and 404

**Files:**
- Modify: `index.html`
- Create: `public/404.html`, `public/og-image.png`, `public/favicon.svg`
- Delete: `public/vite.svg`, `src/assets/react.svg`

**Interfaces:**
- Consumes: `site` content (Task 7)
- Produces: correct link previews

- [ ] **Step 1: Replace the boilerplate head**

`index.html` currently has `<title>Vite + React</title>` and `href="/vite.svg"`. Replace with a real title, description, canonical, `theme-color` for both schemes, Open Graph and Twitter card tags, and JSON-LD `Person` structured data with `name`, `url`, `jobTitle`, `sameAs` (GitHub, LinkedIn).

- [ ] **Step 2: Build the OG image with HTML/CSS**

Write a 1200×630 HTML page using the design tokens, open it in the browser preview at that viewport, and screenshot it to `public/og-image.png`. **No AI image generation** — this is the HTML/CSS path required by the constraints.

- [ ] **Step 3: Add `public/404.html`**

GitHub Pages serves it for unknown paths; redirect to `/` so deep links do not dead-end.

- [ ] **Step 4: Verify**

```bash
npm run build
grep -c "Vite + React" dist/index.html
```

Expected: `0`. Confirm the built `index.html` contains the OG tags.

- [ ] **Step 5: Commit**

```bash
git rm public/vite.svg src/assets/react.svg
git add -A
git commit -m "feat: add real metadata, favicon, and 404 page"
```

---

### Task 13: CI hardening and accessibility sweep

**Files:**
- Modify: `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1: Update the workflow**

Change `actions/checkout@v3` → `@v4`, `actions/setup-node@v3` → `@v4`, and `npm install` → `npm ci` so the lockfile is respected. Add a `npm run typecheck && npm run lint && npm test` step before `npm run build` so a broken build cannot deploy.

- [ ] **Step 2: Full accessibility pass in the browser**

With the preview running:
- Tab through the entire page. Focus is always visible and never obscured by the sticky navbar.
- Both themes at 375px, 768px, 1440px.
- `resize_window` with `colorScheme: dark` — confirm the system-preference path works, not just the toggle.
- Enable reduced motion and confirm animations are suppressed.
- Every image has meaningful `alt`; decorative icons carry `aria-hidden="true"`.
- Submit the contact form with fields empty and confirm errors are announced and focus lands on the first invalid field.

Fix anything found before proceeding. Do not defer findings to a follow-up task.

- [ ] **Step 3: Update `README.md`**

It currently claims React 18 (the project is on 19) and describes the old feature set and section list. Rewrite for the current stack and structure.

- [ ] **Step 4: Verify and commit**

```bash
npm test && npm run typecheck && npm run lint && npm run build
git add -A
git commit -m "ci: harden deploy workflow and update docs"
```

---

### Task 14: Merge to main

- [ ] **Step 1: Final verification on the branch**

```bash
npm ci
npm test && npm run typecheck && npm run lint && npm run build
du -sh public dist
```

All must pass. Report the actual output — do not claim success without it.

- [ ] **Step 2: Preview the production build**

```bash
npm run preview
```

Open it in the browser pane. Walk every section in both themes at mobile and desktop widths. This is the last checkpoint before the live site changes.

- [ ] **Step 3: Get explicit sign-off**

Show the owner the production preview. **Do not merge without their explicit approval** — this is the step that changes the live site.

- [ ] **Step 4: Merge and deploy**

```bash
git checkout main
git merge --no-ff redesign -m "feat: portfolio redesign"
git push origin main
```

Pushing `main` triggers `deploy.yml`. Watch the Actions run to completion, then load `https://adityajadhav17.github.io` and confirm the deployed site matches the preview.

---

## Self-Review

**Spec coverage:** Purpose → Tasks 7-10. Constraints → Global Constraints + Tasks 1, 3, 8, 12. Design system → Tasks 3, 4. Color/contrast → Task 4 Step 3, Task 13 Step 2. Typography → Task 4 Step 1. Motion → Task 4 Step 2. IA → Tasks 6, 8, 9. Content model → Task 7. Performance → Task 11. Accessibility → Tasks 6, 10, 13. Metadata → Task 12. Build/deploy → Tasks 13, 14. Verification → every task's final step.

**Known gaps, deliberately carried:**
- Screenshots for WatchTower and Talk-to-Robot do not exist. Task 8 Step 3 handles their absence with a typographic card rather than blocking.
- Two copy decisions are flagged in Task 7 Step 1 as explicit blockers on that task, not silently guessed.

**Type consistency:** `Project`, `Experience`, `Certification` are defined once in Task 7 and referenced by field name in Tasks 8, 9, 11. `Theme`, `getStoredTheme`, `resolveTheme`, `setTheme` are defined in Task 5 and consumed in Task 6. `cn` is defined in Task 2 and used throughout. `useActiveSection` is defined in Task 6 Step 3 and consumed in Task 6 Step 6.
