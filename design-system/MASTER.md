# Design System Master File

> **LOGIC:** No page-level override files exist in `design-system/`. This Master file governs
> every page and component in the project directly — nothing supersedes it.

---

**Project:** Aditya Jadhav Portfolio
**Generated:** 2026-08-30 20:38:49
**Category:** Portfolio/Personal
**Design Dials:** Variance 3/10 (Centered / Minimal) | Motion 3/10 (Subtle)

---

## Global Rules

### Color Palette

Zinc monochrome with a single blue accent. Light is the default theme; dark is a first-class
second theme, not an inverted afterthought — several dark values are hand-authored rather than
flipped (see note below the tables). These are the exact tokens Task 4 transcribes into the
`@theme` block and `.dark` class in `src/styles/theme.css`; this table is the single source of
truth for both ramps.

Several tokens beyond the obvious `background`/`foreground`/`accent` exist because shadcn/ui's
Radix-based components (`Card`, `Popover`, `Dialog`, `Select`, `Tooltip`, form inputs, focus
rings, destructive-variant `Button`/`AlertDialog`, etc.) reference them directly. Do not remove
a token because it looks unused in page content — check component usage first.

#### Light theme (default)

| Role | CSS Variable | Hex | Notes |
|------|--------------|-----|-------|
| Background | `--color-background` | `#FAFAFA` | Page background |
| Foreground | `--color-foreground` | `#09090B` | Default text |
| Card | `--color-card` | `#FFFFFF` | Card/panel surface |
| Card Foreground | `--color-card-foreground` | `#09090B` | Text on card |
| Popover | `--color-popover` | `#FFFFFF` | Radix Popover/Dialog/Select/Tooltip surface |
| Popover Foreground | `--color-popover-foreground` | `#09090B` | Text on popover surface |
| Primary | `--color-primary` | `#18181B` | Primary buttons, high-emphasis UI |
| Primary Foreground | `--color-primary-foreground` | `#FAFAFA` | Text/icons on primary |
| Secondary | `--color-secondary` | `#E8ECF0` | Secondary buttons, low-emphasis fills |
| Secondary Foreground | `--color-secondary-foreground` | `#18181B` | Text on secondary |
| Muted | `--color-muted` | `#E8ECF0` | Muted backgrounds (subtle sections, disabled fills) |
| Muted Foreground | `--color-muted-foreground` | `#475569` | Secondary/supporting text |
| Accent | `--color-accent` | `#2563EB` | The single blue accent — links, active states, CTAs |
| Accent Foreground | `--color-accent-foreground` | `#FFFFFF` | Text/icons on accent |
| Destructive | `--color-destructive` | `#DC2626` | Errors, destructive actions |
| Destructive Foreground | `--color-destructive-foreground` | `#FFFFFF` | Text/icons on destructive |
| Border | `--color-border` | `#E4E4E7` | Default borders/dividers — decorative separation, outside WCAG 1.4.11's scope (not required to identify a component or understand content), so its sub-3:1 contrast against `background` is an accepted trade, not a defect |
| Input | `--color-input` | `#71717A` | Form control borders — draws the boundary that identifies form controls and the outline `Button` variant, which WCAG 1.4.11 does cover; set to zinc-500 so it clears 3:1 against both `background` and `card` |
| Ring | `--color-ring` | `#2563EB` | Focus ring |

#### Dark theme

| Role | CSS Variable | Hex | Notes |
|------|--------------|-----|-------|
| Background | `--color-background` | `#09090B` | Page background |
| Foreground | `--color-foreground` | `#FAFAFA` | Default text |
| Card | `--color-card` | `#18181B` | Card/panel surface |
| Card Foreground | `--color-card-foreground` | `#FAFAFA` | Text on card |
| Popover | `--color-popover` | `#18181B` | Radix Popover/Dialog/Select/Tooltip surface |
| Popover Foreground | `--color-popover-foreground` | `#FAFAFA` | Text on popover surface |
| Primary | `--color-primary` | `#FAFAFA` | Primary buttons, high-emphasis UI |
| Primary Foreground | `--color-primary-foreground` | `#18181B` | Text/icons on primary |
| Secondary | `--color-secondary` | `#27272A` | Secondary buttons, low-emphasis fills |
| Secondary Foreground | `--color-secondary-foreground` | `#FAFAFA` | Text on secondary |
| Muted | `--color-muted` | `#27272A` | Muted backgrounds (subtle sections, disabled fills) |
| Muted Foreground | `--color-muted-foreground` | `#A1A1AA` | Secondary/supporting text |
| Accent | `--color-accent` | `#60A5FA` | The single blue accent, lightened for dark contrast |
| Accent Foreground | `--color-accent-foreground` | `#09090B` | Text/icons on accent |
| Destructive | `--color-destructive` | `#F87171` | Errors, destructive actions |
| Destructive Foreground | `--color-destructive-foreground` | `#09090B` | Text/icons on destructive |
| Border | `--color-border` | `#27272A` | Default borders/dividers — decorative separation, outside WCAG 1.4.11's scope (not required to identify a component or understand content), so its sub-3:1 contrast against `background` is an accepted trade, not a defect |
| Input | `--color-input` | `#71717A` | Form control borders — draws the boundary that identifies form controls and the outline `Button` variant, which WCAG 1.4.11 does cover; set to zinc-500 so it clears 3:1 against both `background` and `card` |
| Ring | `--color-ring` | `#60A5FA` | Focus ring |

**Color Notes:** Monochrome + blue accent. The dark ramp is authored, not a mechanical
inversion of light — `accent` and `ring` lighten from `#2563EB` to `#60A5FA` in dark because
`#2563EB` on `#09090B` measures 3.85:1, below the 4.5:1 floor required for text-sized UI.
`destructive` lightens for the same reason. `--color-input` is `#71717A` (zinc-500) in both
ramps rather than following `--color-border`, because 1.4.11 requires 3:1 for the boundary of
an interactive control, unlike the purely decorative `--color-border`. Task 4 Step 3 records
the full per-pair contrast audit as a comment at the top of `theme.css`.

### Typography

Three-family system: two for prose and one dedicated to technical/data content, so tech tags,
metrics, and dates read visually distinct from headings and body copy.

- **Heading Font:** **Archivo** — page titles, section headings, nav
- **Body Font:** **Space Grotesk** — paragraph copy, UI labels, buttons
- **Technical/monospace: JetBrains Mono** — tech tags, metrics, dates, code-adjacent labels
- **Mood:** minimal, portfolio, designer, creative, clean, artistic

**Google Fonts:** [Archivo + Space Grotesk + JetBrains Mono](https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Space+Grotesk:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Space+Grotesk:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');
```

The weights above (Archivo 500/600/700, Space Grotesk 400/500, JetBrains Mono 400/500) are the
exact set Task 4 loads via `<link>` in `index.html` and exposes as `--font-heading`,
`--font-sans`, and `--font-mono` in `theme.css`.

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--color-accent);
  color: var(--color-accent-foreground);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: var(--color-card);
  color: var(--color-card-foreground);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

`--color-card` is deliberately distinct from `--color-background` (`#FFFFFF` vs `#FAFAFA` in
light) so a card reads as a raised surface against the page, not as invisible camouflage.

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid var(--color-input);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: var(--color-ring);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-ring) 20%, transparent);
}
```

### Modals

```css
/* .modal-overlay's scrim is intentionally a fixed black rgba(), not a theme token — a
   backdrop dim should stay dark behind the modal in both light and dark mode; it doesn't
   represent any of the 19 semantic roles. */
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--color-popover);
  color: var(--color-popover-foreground);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Minimalism & Swiss Style

**Keywords:** Clean, simple, spacious, functional, white space, high contrast, geometric, sans-serif, grid-based, essential

**Best For:** This project specifically — a single-owner developer/engineer portfolio and
personal site. The Swiss-minimal treatment favors scannable work samples, credibility signals
(experience, certifications), and a direct contact path over broad marketing conversion flows.

**Key Effects:** Subtle hover (200-250ms), smooth transitions, sharp shadows if any, clear type hierarchy, fast loading

### Page Pattern

**Pattern Name:** Portfolio Grid

> The generator's aggregate output for this brief also surfaced "Scroll-Triggered
> Storytelling" (chapter-based narrative sections with a climax CTA). That pattern does not fit
> a portfolio site and is intentionally not used here — the information architecture below is
> already decided in the project spec and supersedes it.

- **Section Order:** Hero → Selected Work → Experience → About → Certifications → Contact
- **CTA Placement:** Hero (primary intro CTA) + Contact (final CTA); no forced per-section CTAs
- **Conversion Strategy:** Straightforward single-scroll grid/list layout — no chapter framing,
  no scroll-scrubbed narrative. Selected Work and Experience read as scannable grids/lists, not
  as story beats. Keep DOM reading order complete and disable non-essential motion under
  `prefers-reduced-motion`, consistent with the Motion section below.

---

## Motion

**Scroll Reveal** (Subtle) — Trigger: scroll (viewport enter) | Duration: 300-400ms | Easing: `power1.out`

```js
gsap.from(el, { opacity: 0, y: 12, duration: 0.35, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' } });
```

**Framework notes:** Requires the ScrollTrigger plugin registered once via gsap.registerPlugin(ScrollTrigger); Use matchMedia('(prefers-reduced-motion: reduce)') to skip non-essential motion and render the final state immediately

- ✅ Keep the y offset small (8-16px) so it reads as a fade, not a slide
- ❌ Don't reveal below-the-fold content needed for SEO/crawlers as invisible-by-default without a no-JS fallback
- ⚡ toggleActions 'play none none reverse' avoids re-triggering on every scroll direction change

---

## Anti-Patterns (Do NOT Use)

- ❌ Corporate templates
- ❌ Generic layouts

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y
- ❌ **Touch targets under 44×44 CSS px on mobile** — if the visual control must stay
  smaller (e.g. a compact icon button), expand the hit area with padding or a pseudo-element
  overlay rather than enlarging the visible icon

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] Touch targets ≥44×44 CSS px on mobile (expand hit area via padding/pseudo-element if the
      visual control must stay smaller)
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
