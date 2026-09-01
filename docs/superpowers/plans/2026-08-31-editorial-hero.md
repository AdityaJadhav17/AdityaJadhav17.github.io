# Editorial Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the centred hero with a multi-column editorial composition that puts the positioning claim in display type, the portrait on the page as a subject rather than an avatar, and the proof numbers where a recruiter reads them.

**Architecture:** One full-viewport section built on a CSS grid: an information band across the top (name, discipline, positioning, capabilities), a cut-out portrait as the visual centre, an oversized claim anchored bottom-left that overlaps the portrait, and a footer band carrying availability and proof. Entrance choreography moves from hand-written CSS keyframes to Motion, which already handles stagger and reduced-motion natively. Everything below the hero is untouched.

**Tech Stack:** React 19, TypeScript, Tailwind v4 with the existing token layer, Motion 13.1.1, Vitest, Playwright.

**Spec:** [`docs/superpowers/specs/2026-08-30-portfolio-redesign-design.md`](../specs/2026-08-30-portfolio-redesign-design.md) — this plan amends that spec's Information Architecture section for the hero only. The section order, content model, and every constraint below it are unchanged.

## Design brief

The reference is the multi-column editorial hero pattern: name and supporting columns across the top, subject portrait centred on a flat ground, an oversized statement anchored low, and small metadata in the corners. We take the **structure and the choreography**, not the reference's typography, colour, or copy. Concretely:

| Reference slot | This site |
|---|---|
| Name, top-left | `site.name` |
| Discipline label | `site.discipline` (new) |
| "What I do" paragraph | `site.tagline` (the two current roles), labelled `Currently` |
| Services list | `site.capabilities` (new) |
| Oversized headline, bottom-left | `site.positioning`, in display type |
| "Open to work" line | `site.availability` |
| Counts, bottom-right | `site.proof` |
| Centred cut-out portrait | the owner's new photo, background removed |

## Global Constraints

- All work happens on branch `redesign`. `.github/workflows/deploy.yml` triggers on `branches: [main]` only. Never push, never merge.
- `.claude/`, `.superpowers/`, `*.tsbuildinfo` are gitignored and must never be committed.
- **No em dashes** anywhere in published copy. Rewrite the sentence rather than swapping punctuation.
- **No AI-generated imagery.** The portrait is the owner's own photo. Do not generate, source, or hotlink any image.
- **Semantic colour tokens only.** `src/styles/theme.css` is the one legal home for colour literals. No hex in any `.tsx`/`.ts`.
- **The hero must work in both themes.** It uses tokens like every other section; it is not a dark-only composition. The site has a working theme toggle and a hero that ignores it is a defect.
- Icons: Lucide for UI, `react-icons` for brand marks only.
- Contrast 4.5:1 for text, 3:1 for non-text UI, in **both** themes.
- `min-h-dvh`, never `100vh`.
- Node 20.
- If an instruction conflicts with the repo, or something referenced is absent, STOP and report rather than improvising.

## Asset dependency — RESOLVED

`public/portrait.webp` is already in place: 1467x1600, RGBA, 36.0% transparent with a
1.39% feathered edge, 276 KB.

Provenance, because it matters and the route was not obvious. Three exports from a
browser background remover reached the repo without an alpha channel: the first was a
JPEG carrying a `.png` extension, the next two were real PNGs saved as colour type 2
(RGB, no alpha) with the cutout flattened onto black. A flood-fill key from the image
borders was attempted and rejected: the subject's hair measures luminance 8.5 against a
background of exactly 0 and is spatially connected to it, so the fill walked into the
hair and punched holes visible on a light ground. `rembg` 2.0.81 with alpha matting was
then installed locally, with the owner's approval, and produced a clean mask. The last
2% of height was cropped to remove a warm fringe where the table edge met the forearms.

**Task 3 therefore uses the real asset directly and needs no placeholder.** Task 6 is
reduced to a verification pass.

---

## File Structure

| Path | Responsibility |
|---|---|
| `src/content/site.ts` | Adds `discipline` and `capabilities`; existing fields unchanged |
| `src/lib/motion.ts` | Shared Motion variants and the reduced-motion helper |
| `src/components/sections/Hero.tsx` | The composition. Rewritten, not extended |
| `src/components/sections/HeroPortrait.tsx` | The portrait layer, isolated because its sizing and theme behaviour are fiddly |
| `src/styles/theme.css` | Retires the `anim-*` keyframes the hero no longer uses, if nothing else references them |

---

### Task 1: Commit Motion and build the shared variants

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `src/lib/motion.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `useHeroMotion(): { container: Variants; item: Variants; reduced: boolean }` from `@/lib/motion`, consumed by Tasks 3 and 4.

- [ ] **Step 1: Confirm Motion is present and commit it**

`motion@^13.1.1` is already installed but uncommitted in the working tree. Verify, then commit it on its own so the dependency change is separable from the redesign:

```bash
node -e "const p=require('./package.json');console.log(p.dependencies.motion||p.devDependencies.motion)"
git add package.json package-lock.json
git commit -m "build: add motion for hero choreography"
```

Expected output from the node line: `^13.1.1`. If Motion is absent, STOP and report — do not install a different version.

- [ ] **Step 2: Create `src/lib/motion.ts`**

```ts
import { useReducedMotion, type Variants } from 'motion/react'

// Shared entrance choreography for the hero. Motion's useReducedMotion reads
// the same prefers-reduced-motion query the global guard in theme.css uses,
// so honouring it here keeps JS-driven animation consistent with the CSS.
const EASE = [0.22, 1, 0.36, 1] as const

export function useHeroMotion() {
  const reduced = useReducedMotion() ?? false

  const container: Variants = {
    hidden: {},
    visible: {
      transition: reduced
        ? { staggerChildren: 0, delayChildren: 0 }
        : { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  }

  const item: Variants = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.75, ease: EASE },
    },
  }

  return { container, item, reduced }
}
```

- [ ] **Step 3: Verify the gate**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all four exit 0, 9/9 tests.

- [ ] **Step 4: Commit**

```bash
git add src/lib/motion.ts
git commit -m "feat: add shared hero motion variants"
```

---

### Task 2: Add the two new content fields

**Files:**
- Modify: `src/content/site.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `site.discipline: string` and `site.capabilities: string[]`, consumed by Task 4.

- [ ] **Step 1: Extend the `Site` type and data**

Add to the `Site` type, after `positioning`:

```ts
  discipline: string
  capabilities: string[]
```

Add to the `site` object, after `positioning`:

```ts
  // The two-word framing that sits under the name, the way a studio would
  // state its discipline. Narrower than the roles list, broader than any
  // single project.
  discipline: 'AI Systems & Security',

  // What he actually works on, each traceable to a project or a role in
  // this file's siblings. Not aspirational, and not a skills dump: the
  // skills list in About already serves that purpose.
  capabilities: [
    'Multi-agent LLM systems',
    'Computer vision pipelines',
    'Model evaluation and failure analysis',
    'Production observability tooling',
    'Penetration testing',
    'Security compliance (NIST SP 800-171)',
  ],
```

Every entry above traces to shipped work: multi-agent to TravelAGNTCY, computer vision to Synthetic-to-Real and the bird classifier, evaluation to Talk-to-Robot, observability to WatchTower, and the last two to the UC San Diego role. **Do not add a seventh.**

- [ ] **Step 2: Verify the gate**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all four exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/content/site.ts
git commit -m "content: add discipline and capabilities for the editorial hero"
```

---

### Task 3: The portrait layer

**Files:**
- Create: `src/components/sections/HeroPortrait.tsx`

**Interfaces:**
- Consumes: `useHeroMotion` from `@/lib/motion` (Task 1)
- Produces: `<HeroPortrait />`, a self-contained layer consumed by Task 4. It positions itself absolutely within a `relative` parent and takes no props.

- [ ] **Step 1: Create the component**

```tsx
import { motion } from 'motion/react'
import { site } from '@/content/site'
import { useHeroMotion } from '@/lib/motion'

// The portrait is the visual centre of the composition, so it gets its own
// file: its sizing is viewport-relative rather than token-driven, and it has
// to read correctly on both the light and the dark ground.
//
// Sits behind the claim (Task 4 gives the claim a higher z-index) so the
// display type overlaps the lower edge of the subject, which is what makes
// the composition read as one image rather than a photo with a caption.
export function HeroPortrait() {
  const { item, reduced } = useHeroMotion()

  return (
    <motion.div
      variants={item}
      className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center"
      aria-hidden="false"
    >
      <motion.img
        src="/portrait.webp"
        alt={`${site.name}, ${site.discipline}`}
        width={900}
        height={1200}
        loading="eager"
        fetchPriority="high"
        initial={reduced ? false : { scale: 1.04 }}
        animate={{ scale: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="h-[52vh] w-auto max-w-none object-contain object-bottom md:h-[64vh] lg:h-[70vh]"
      />
    </motion.div>
  )
}
```

- [ ] **Step 2: Confirm the asset is present and correct**

```bash
node -e "
const {chromium}=require('@playwright/test');const {pathToFileURL}=require('node:url');const {resolve}=require('node:path');
(async()=>{const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage();
await p.goto(pathToFileURL(resolve('public/portrait.webp')).href);
console.log(await p.evaluate(async()=>{const i=document.images[0];await i.decode();
const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;
const x=c.getContext('2d');x.drawImage(i,0,0);
const d=x.getImageData(0,0,c.width,c.height).data;let clear=0;
for(let k=3;k<d.length;k+=4)if(d[k]<10)clear++;
return i.naturalWidth+'x'+i.naturalHeight+' transparent '+(100*clear/(d.length/4)).toFixed(1)+'%';}));
await b.close()})()"
```

Expected: `1467x1600 transparent 36.0%`. A transparent percentage at or near 0 means the
wrong file is in place: STOP and report rather than building against a rectangular photo.

- [ ] **Step 3: Verify the gate**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all four exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/HeroPortrait.tsx public/portrait.webp
git commit -m "feat: add hero portrait layer"
```

---

### Task 4: Rebuild the hero composition

**Files:**
- Modify: `src/components/sections/Hero.tsx` (full rewrite)

**Interfaces:**
- Consumes: `useHeroMotion` (Task 1); `site.discipline`, `site.capabilities` (Task 2); `<HeroPortrait />` (Task 3)
- Produces: the `#home` section landmark, which `useActiveSection` and `theme.css`'s `scroll-margin-top` rule already reference. The id must not change.

**Read `design-system/MASTER.md` before writing any class.** Every token used must exist there.

- [ ] **Step 1: Rewrite `Hero.tsx`**

Layout, desktop (`lg` and up), inside a `relative min-h-dvh overflow-hidden` section:

- **Top band**, a 4-column grid with `items-start`:
  1. `site.name` in `font-heading`, plus `site.discipline` beneath it in `font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground`
  2. empty spacer column
  3. label `Currently` in the same mono-uppercase treatment, then `site.tagline` as body copy, with `site.location` beneath it in `font-mono text-xs text-muted-foreground`
  4. label `Capabilities`, then `site.capabilities` as a plain `<ul>`, one per line, `text-sm`
- **Portrait**: `<HeroPortrait />`, absolutely positioned by its own component
- **Claim**: `site.positioning` again, but as the display element — `font-heading font-bold uppercase leading-[0.95] tracking-tight text-balance`, sized `text-[clamp(2.25rem,7vw,5.5rem)]`, anchored bottom-left, `relative z-10` so it overlaps the portrait
- **Footer band**, `flex items-end justify-between`, above the claim's baseline or below it depending on space:
  - left: `site.availability`
  - right: `site.proof` as a horizontal row, value in `font-mono text-accent`, label in `text-xs text-muted-foreground`
- **Actions**: résumé download and the two brand links, as they are today. Keep the existing `Button` usage and `SOCIAL_ICONS` map verbatim — Ruling AJ established react-icons for brand marks because Lucide 1.x removed them.

Wrap the whole thing in `<motion.section variants={container} initial="hidden" animate="visible">` and give each band `variants={item}`.

**Accessibility requirements, non-negotiable:**
- `site.positioning` appears exactly once, as the display claim (see Ruling A). It is real content, so it stays in the accessibility tree. Nothing in the hero carries `aria-hidden="true"` except decorative icons.
- `<h1>` stays `site.name`. The e2e suite asserts `getByRole('heading', { level: 1, name: 'Aditya Jadhav' })` and the JSON-LD names him. Do not promote the claim to `h1`.
- Every interactive element keeps a visible focus ring.

**Mobile (`< lg`)**: the four-column band collapses to a single column in source order — name and discipline, claim, portrait, roles, capabilities, proof, availability, actions. Do not attempt the overlap at mobile widths; let the portrait sit in flow.

- [ ] **Step 2: Verify the gate**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all four exit 0, 9/9 unit tests.

- [ ] **Step 3: Verify in the browser, both themes**

Start the preview with `preview_start` using `portfolio-dev`. With literal expressions and outputs, confirm:
- `document.querySelectorAll('h1').length` → `1`, and its text is `Aditya Jadhav`
- The display claim carries `aria-hidden="true"`; the top-band positioning paragraph does not
- No horizontal scroll at 375px, 768px, 1440px: `document.documentElement.scrollWidth <= window.innerWidth` → `true` at each
- Both themes: every string in the hero is legible. Report the computed colour of the claim against the section background in each.

Known environment characteristic: the `computer` click tool silently no-ops on some controls here. Drive interactions with a dispatched pointer sequence (`pointerdown` → `mousedown` → `pointerup` → `mouseup` → `click`) and say that is what you did.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat: rebuild hero as an editorial composition"
```

---

### Task 5: Retire the unused CSS animation classes

**Files:**
- Modify: `src/styles/theme.css`

**Interfaces:**
- Consumes: nothing
- Produces: nothing. Cleanup only.

- [ ] **Step 1: Find what still references the `anim-*` classes**

```bash
grep -rn "anim-fade-in\|anim-rise-in\|anim-fade-up\|anim-line" src/ index.html
```

- [ ] **Step 2: Remove only the classes with zero references**

If a class still has a consumer, leave it and say so in the report. Do **not** touch:
- the `.reveal` / `.reveal-hidden` pair, which `useScrollReveal` uses for every section below the hero
- the global `prefers-reduced-motion` block, which neutralises transitions site-wide and which Motion's `useReducedMotion` complements rather than replaces

- [ ] **Step 3: Verify the gate and the reveals still work**

Run: `npm run typecheck && npm run lint && npm test && npm run build && npx playwright test`
Expected: all exit 0, 9/9 unit, 7/7 e2e. The e2e suite includes a reduced-motion test and a control test; both must still pass.

- [ ] **Step 4: Commit**

```bash
git add src/styles/theme.css
git commit -m "refactor: drop hero CSS keyframes now superseded by Motion"
```

---

### Task 6: Final verification pass

**Files:** none. Verification only.

**Interfaces:**
- Consumes: everything Tasks 1 through 5 produced
- Produces: nothing

The portrait landed before implementation began, so there is no swap to perform. What
remains is confirming the finished composition holds up.

- [ ] **Step 1: Full gate from a clean install**

```bash
rm -rf node_modules && npm ci
npm test && npm run typecheck && npm run lint && npm run build && npx playwright test
```

Expected: 9/9 unit, 7/7 e2e, every command exits 0. A cold `npm ci` catches state that
only works because of a warm `node_modules`.

- [ ] **Step 2: Both themes, three widths**

With the preview running, capture the hero at 375px, 768px and 1440px in light and dark.
Report, with literal expressions and outputs:
- `document.documentElement.scrollWidth <= window.innerWidth` is `true` at each width
- the computed colour of the display claim and of the section background, in each theme
- the rendered size of the portrait, and confirmation that it is anchored to the bottom
  rather than floating

- [ ] **Step 3: Confirm the cut-out edge reads correctly on the light ground**

The dark ground hides masking flaws; the light ground does not. Look specifically at the
hair edge and the forearms. If a halo or a hard jagged edge is visible at display size,
report it rather than accepting it.

- [ ] **Step 4: Commit any fixes**

If Steps 1 to 3 surface nothing, there is nothing to commit and that is a valid outcome.
Say so explicitly rather than manufacturing a change.

---

## Self-Review

**Spec coverage.** This plan amends only the hero. The spec's IA lists "Hero — name, current roles, positioning line, résumé download, social links"; all five survive, with the positioning line promoted to the display element and roles carried by `site.tagline` in the top band. Every constraint in the spec's Constraints section is restated in Global Constraints above. Sections below the hero are untouched, so the rest of the spec is unaffected.

**Placeholder scan.** No TBD, no "handle edge cases", no "similar to Task N". Task 6 has a genuine external dependency (the owner's photo) and states explicitly what to do when it is absent: stop and report.

**Type consistency.** `useHeroMotion` is defined in Task 1 and consumed by name in Tasks 3 and 4. `site.discipline` and `site.capabilities` are defined in Task 2 and consumed in Task 4; `HeroPortrait` also reads `site.discipline` for its alt text. `<HeroPortrait />` takes no props in Task 3 and is used with none in Task 4. The asset path `/portrait.webp` is written in Task 3 and verified in Task 3 Step 2; it is already on disk, so nothing replaces it later.

**Known risks carried deliberately.**
- The claim appears once, not twice. See Ruling A for why the brief's original mapping was rejected.
- The hero uses tokens rather than committing to a permanently dark ground. That is a deliberate departure from the reference, which is dark-only: this site has a working theme toggle and the rest of the page respects it.

---

## Rulings recorded during execution

### Ruling A: the top band carries the roles, not a second copy of the claim

**Raised at:** plan review, before Task 1.

The design brief mapped `site.positioning` to both the reference's "What I do"
paragraph and its oversized headline. In the reference those slots hold two different
strings. Rendering one sentence in both places puts the same twelve words on screen
twice within one viewport, which reads as a duplication bug rather than as emphasis.

The plan's mitigation was `aria-hidden="true"` on the display copy. That fixes only the
screen reader, and it does so by declaring the largest element on the page decorative,
which is false: the claim is the single most important sentence on the site.

**Ruling:** the display claim keeps `site.positioning` and stays in the accessibility
tree. The top band's third column carries `site.tagline` under the label `Currently`,
with `site.location` beneath it. This is what the two slots hold in the reference: a
statement and the supporting facts behind it.

**Cost if wrong:** low and reversible. Both strings already exist in `site.ts`; swapping
which slot holds which is a one-line change in a single component.

### Ruling B: `aria-hidden="false"` dropped from the portrait wrapper

**Raised at:** Task 3.

Task 3's code sets `aria-hidden="false"` on the portrait's wrapper `div`. The attribute
is a no-op: absent and `"false"` are equivalent, and the `img` inside carries its own
`alt`. Explicitly writing it invites a future reader to assume it is load-bearing.

**Ruling:** omit it. The `alt` on the image is what makes the portrait accessible.

**Cost if wrong:** none. Removing a no-op attribute cannot change behaviour.

### Ruling C: the portrait is absolute only at `lg` and up

**Raised at:** Task 3.

Task 3's code positions the portrait `absolute inset-x-0 bottom-0` at every width. Task 4
requires the opposite at mobile: "Do not attempt the overlap at mobile widths; let the
portrait sit in flow." Absolute positioning at every width makes that impossible, because
an absolutely positioned element is out of flow by definition and would sit underneath
the stacked single-column content.

**Ruling:** the wrapper is `flex justify-center` by default and gains
`lg:absolute lg:inset-x-0 lg:bottom-0` at the breakpoint where the overlap is wanted.
Task 4's mobile requirement is the binding one; Task 3's class list was the error.

**Cost if wrong:** low. The failure would be visible immediately at 375px as a portrait
overlapping the text stack, and it is a one-class fix.

### Ruling D: Task 5 is a no-op, and nothing is deleted to make it look otherwise

**Raised at:** Task 5.

Task 5 instructs the executor to retire the `anim-fade-in`, `anim-rise-in`, `anim-fade-up`
and `anim-line` classes from `src/styles/theme.css` once Motion supersedes them. Those
classes are not in that file, and never have been on this branch:

```
grep -rn "anim-fade-in\|anim-rise-in\|anim-fade-up\|anim-line" src/ index.html e2e/
  -> no matches
git log -S"anim-fade"  -- src/styles/theme.css  -> no commits
git log -S"@keyframes" -- src/styles/theme.css  -> no commits
```

The only animation CSS in the file is the pair Task 5 explicitly forbids touching: the
global `prefers-reduced-motion` block and the `.reveal` / `.reveal-hidden` pair that
`useScrollReveal` drives for every section below the hero. The hero's previous entrance
was not CSS keyframes at all, so replacing it with Motion left nothing behind.

**Ruling:** Task 5 completes with no change. Deleting the reduced-motion block or the
reveal pair to produce a diff would break every section below the hero and one passing
e2e test. An empty task is the correct outcome, and is reported as such rather than
quietly satisfied with an unrelated edit.

**Cost if wrong:** none in the no-op direction. The cost of the alternative, deleting
live CSS to manufacture a commit, is a broken page and a failing suite.
