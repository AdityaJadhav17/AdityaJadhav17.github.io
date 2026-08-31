# Portfolio Redesign — Design Document

**Date:** 2026-08-30
**Status:** Awaiting review
**Repo:** `AdityaJadhav17/AdityaJadhav17.github.io` (live at https://adityajadhav17.github.io)

## Purpose

The site is a live job-search and outreach asset. It was built in 2024 and has
drifted: it does not mention either of the owner's two current roles, its
metadata is unmodified Vite boilerplate, it ships 12 MB of images, and its dark
mode renders section headings at roughly 1.3:1 contrast. This project reworks
the site's aesthetic, structure, and content so it accurately represents current
work and reads as a professional engineering portfolio.

Success means: a recruiter landing on the site sees current roles and the
strongest project within one screen, the page loads fast on a phone, both themes
are legible, and every claim on the page is true.

## Constraints

1. **The live site must never be broken.** `.github/workflows/deploy.yml`
   triggers only on `branches: [main]`. All work happens on a `redesign` branch,
   which is invisible to the deploy pipeline. `main` is merged into exactly once,
   at the end, after browser verification.
2. **No AI image generation.** The `banner-design` and `design` skills reference
   `gemini_batch_process.py` and the `ai-artist` / `ai-multimodal` skills. None
   are installed and no API key is configured. Any hero or banner visual is
   HTML/CSS, or the owner is asked first.
3. **`.claude/` stays local.** Gitignored as of `.gitignore:36`; never committed.
4. **Content accuracy over completeness.** A claim that cannot be verified comes
   off the site rather than being softened.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Migration strategy | In-place, section by section, on a `redesign` branch | 2,300 lines across 8 components is small enough to convert incrementally; the app runs at every commit and every step is reviewable |
| Language | Migrate JS to TypeScript | shadcn/ui is TS-first; 8 components is cheap to convert now and expensive to retrofit; the portfolio repo is itself a listed project recruiters will open |
| Styling | Tailwind v4 via `@tailwindcss/vite`, tokens in `@theme` | Replaces 8 hand-written stylesheets and ~1,600 lines of CSS |
| Components | shadcn/ui | Its primitives are accessible by construction, which fixes several audit findings structurally rather than by patching |
| Visual direction | Swiss Minimal + monospace accent | Neutral ground lets the work carry the page; mono on technical content signals engineer rather than designer |
| Icons | Lucide (shadcn default) | Replaces `react-icons` and the emoji currently used as the theme toggle |

## Design System

Generated with `ui-ux-pro-max`, persisted to `design-system/MASTER.md` as the
single source of truth. Every component reads from it; no component invents a
value.

**Note on path:** the skill's `--persist` writes to
`design-system/<project-slug>/MASTER.md`. The requested location is
`design-system/MASTER.md`. The generated file is relocated to the requested path
and the reference prompt updated to match, so there is one canonical location.

### Color

Zinc monochrome with a single blue accent. Semantic tokens only — no raw hex in
components, which is the failure mode that produced the current dark-mode bug.

| Role | Light | Notes |
|---|---|---|
| `--color-primary` | `#18181B` | |
| `--color-accent` | `#2563EB` | Single accent; used for CTA and focus ring |
| `--color-background` | `#FAFAFA` | |
| `--color-foreground` | `#09090B` | |
| `--color-card` | `#FFFFFF` | |
| `--color-muted` | `#E8ECF0` | |
| `--color-muted-foreground` | `#475569` | |
| `--color-border` | `#E4E4E7` | |
| `--color-destructive` | `#DC2626` | |

The dark ramp is authored explicitly and contrast-checked independently — not
derived by inverting the light values. Every foreground/background pair must
clear 4.5:1 for body text and 3:1 for non-text UI, in **both** themes. This is
the specific defect being fixed: today `--secondary-color` is not remapped in
`.dark-mode`, so `.section-title` renders `#2c3e50` on `#1a1a1a`.

### Typography

- Headings: **Archivo**
- Body: **Space Grotesk**
- Technical: **JetBrains Mono** — tech tags, metrics, dates, code-adjacent labels
- Loaded via Google Fonts with `font-display: swap`; only the weights actually
  used are requested.

### Motion

Subtle tier: 300-400ms scroll reveals, 8-16px offsets, `power1.out`. All motion
sits behind `prefers-reduced-motion`, which the site currently ignores entirely
despite global `scroll-behavior: smooth` and hover transforms.

## Information Architecture

Based on the `portfolio-grid` pattern: hero, then work, then supporting detail,
then contact — on a neutral ground, visuals first.

1. **Hero** — name, current roles, one-line positioning, resume download, social links
2. **Selected Work** — featured project plus grid; moved up from position 3
3. **Experience** — new section; timeline of roles
4. **About** — condensed to one paragraph plus skills
5. **Certifications** — compact row
6. **Contact** — form and direct links

**Removed:** the standalone Resume section. The PDF stays in `public/`; download
moves to the hero and footer, and the embedded iframe viewer is dropped.

**Removed:** `section { min-height: 100vh }`. Sections size to their content.
Where viewport height is genuinely wanted (hero only), `min-h-dvh` is used, not
`100vh`.

**Changed:** navigation becomes real anchors targeting section ids, so
`/#projects` is a shareable URL. Active state is tracked with
`IntersectionObserver` and exposed as `aria-current`, replacing the unthrottled
scroll handler in `App.jsx:25-45` that reads `offsetTop` and `offsetHeight` on
every scroll event.

## Content Model

Content moves out of component bodies into typed data modules under
`src/content/`, so copy changes never require touching JSX.

```ts
type Project = {
  id: string
  title: string
  summary: string
  image: { src: string; width: number; height: number; alt: string }
  tech: string[]
  links: { github?: string; demo?: string; writeup?: string }
  featured: boolean
  period?: string
  context?: string   // e.g. "SANDHacks 2026" — provenance stated, not hidden
}

type Experience = {
  company: string
  role: string
  start: string
  end: string | "present"
  highlights: string[]
}

type Certification = {
  name: string
  issuer: string
  year: string
  badge: string
  pdf: string
  verify: string
}
```

### Experience entries

| Role | Organization | Period |
|---|---|---|
| Software Engineering Intern | Lumulus Technologies | Jun - Sep 2026 |
| IT Security Programmer | UC San Diego, ITS | Dec 2025 - Jun 2027 (expected) |
| Web Development Intern | NutrifitWorld | Jun - Oct 2025 |
| Founder & President | AI Club, Irvine Valley College | Aug 2024 - May 2025 |

The Lumulus entry is written role-shaped rather than product-shaped, for reasons
held outside this repository. Its copy is finalized separately and is not
reproduced or derived here. The UC San Diego entry is written from role scope and
is marked for replacement once accomplishment detail is available.

### Project list

Five entries. Removed from the current site: the C++ tic-tac-toe assignment, the
portfolio-website self-reference, and the IBM Watson chat demo.

| Project | Context | Notes |
|---|---|---|
| AI Travel Planning Agent | SANDHacks 2026, 3-person team | Built on Cisco's open-source AGNTCY framework; provenance stated on the card |
| WatchTower | UCSD CSE 110, Team 09 | Owner was Team Leader and Technical Lead (CI/CD, architecture) |
| Talk-to-Robot | UCSD CSE 190, team project | Carries the strongest quantitative results of any entry |
| Synthetic-to-Real Object Detection | Kaggle competition | mAP 0.9175 |
| Bird Classifier | Personal | |

Every card follows one structure: **Problem, What I built/engineered, Stack,
Result.** Team projects state team size and the owner's role. Projects built on
an existing framework or starter state that fact. An unverifiable claim is
removed rather than softened — the site's credibility with an interviewer who
opens the repository is worth more than any single bullet.

Project sources:

- WatchTower — `github.com/cse110-sp26-group09/Watchtower-Course-Project`,
  live at `cse110-sp26-group09.github.io/Watchtower-Course-Project/`
- Talk-to-Robot — `github.com/YangLin14/Talk-to-Robot`

The Lumulus desktop application was built in Python/Qt; that is a generic skill
and appears in the entry.

**Outstanding asset gaps** (block the content phase, not the design):

- Screenshots for WatchTower and Talk-to-Robot; neither has an image today.
  Cards without a screenshot use a typographic treatment driven by design-system
  tokens — no AI image generation, per constraint 2

**Open copy decisions** carried into the plan:

- Travel-Agntcy card wording: whether to state the AGNTCY framework provenance
  and team size, and whether the latency claim has a measured baseline
- Talk-to-Robot: which components of the pipeline the owner personally built,
  so the card claims neither more nor less than is accurate

## Performance

`public/` is currently 12 MB. Every project image loads eagerly with no declared
dimensions.

- Convert the six project screenshots to WebP at display resolution.
  `travel-agntcy.png` alone is 7.3 MB. Target: under 800 KB total.
- `loading="lazy"` plus intrinsic `width` and `height` on every below-fold image,
  eliminating cumulative layout shift.
- Originals are kept until the converted set is verified rendering correctly.

## Accessibility

Fixed as part of the rebuild rather than as a follow-up pass:

- Contrast verified in both themes against the token ramps
- Anchor-based navigation with `aria-current`
- `aria-expanded` and `aria-controls` on the mobile menu toggle
- `prefers-reduced-motion` honored globally
- `aria-live` on contact form status; errors placed next to their fields and
  wired with `aria-describedby`; focus moved to the first invalid field on
  failed submit
- Lucide icons replace the emoji theme toggle, which screen readers announce
- Skip-to-content link
- Keyboard traversal tested end to end

## Metadata

`index.html` is unmodified Vite boilerplate — title `Vite + React`, favicon
`vite.svg`, no description. Every link preview the owner has shared reads
"Vite + React".

Adds: real title and description, Open Graph and Twitter card tags with a
generated preview image (HTML/CSS, no AI generation), canonical URL,
`theme-color`, a real favicon, and JSON-LD `Person` structured data.

## Build and Deploy

- `npm install` becomes `npm ci` in the workflow, so the lockfile is respected
- `actions/checkout@v3` to `v4`, `actions/setup-node@v3` to `v4`
- `public/404.html` for GitHub Pages deep-link handling

## Out of Scope

- A blog or CMS
- Per-project detail routes (revisit once the single-page version is solid)
- Analytics
- Automated tests beyond typechecking and linting. This is a static content site
  with one form; a full test suite is not the highest-value use of effort here.
  The contact form's submit logic is the one candidate if scope allows.

## Verification

Each phase is verified in the browser preview before the next begins: console
clean, network requests as expected, both themes checked, 375px and 1440px
viewports, keyboard traversal. No phase is reported complete on inspection alone.
