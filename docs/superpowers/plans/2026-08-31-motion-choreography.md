# Motion Choreography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the binary CSS section fade with staggered Motion reveals across the four sections below the hero, draw the Experience timeline against scroll position, and give the navbar an indicator that glides between sections.

**Architecture:** One new `Reveal` compound component becomes the site's only reveal mechanism, carrying shared variants, a fixed viewport config, and the `IntersectionObserver` fail-safe that `useScrollReveal` currently provides. `useScrollReveal` and the `.reveal` CSS are deleted. Reduced motion moves from per-component checks to a single `MotionConfig` at the app root, with one documented exception for the scroll-bound timeline.

**Tech Stack:** React 19, TypeScript (strict), Tailwind v4, Motion 13.1.1, Vitest + Testing Library, Playwright.

**Spec:** [`docs/superpowers/specs/2026-08-31-motion-choreography-design.md`](../specs/2026-08-31-motion-choreography-design.md)

## Global Constraints

- All work happens on branch `redesign`. `.github/workflows/deploy.yml` triggers on `branches: [main]` only. Never push, never merge.
- `.claude/`, `.superpowers/`, `*.tsbuildinfo` are gitignored and must never be committed.
- **No em dashes** in published copy. Rewrite the sentence rather than swapping punctuation.
- **Semantic colour tokens only.** `src/styles/theme.css` is the one legal home for colour literals. No hex in any `.tsx` or `.ts`.
- Everything works in **both themes**. Contrast 4.5:1 for text, 3:1 for non-text UI, in both.
- Icons: Lucide for UI, `react-icons` for brand marks only.
- `min-h-dvh`, never `100vh`.
- Node 20.
- If an instruction conflicts with the repo, or something referenced is absent, STOP and report rather than improvising.

---

## Read this before Task 1: jsdom has no IntersectionObserver

Verified in this repo:

```
node -e "const {JSDOM}=require('jsdom'); console.log(typeof new JSDOM().window.IntersectionObserver)"
  -> undefined
```

`src/test-setup.ts` stubs `window.matchMedia` and nothing else. So in **every** Vitest run,
`Reveal`'s `CAN_OBSERVE` check is false and the component renders plain DOM elements with
no Motion wrapper.

Two consequences, both load-bearing:

1. The existing unit tests (including `Contact.test.tsx`) keep passing through the
   migration, because they never see a Motion component at all.
2. The unit test in Task 1 can only exercise the fallback path. That is not a weakness:
   the fallback **is** the safety property, and the test fails loudly if a future edit
   removes the guard, because Motion would then render `style="opacity:0"` onto the
   element. The observe path is covered by Playwright in Task 7, which runs a real browser.

Do not "fix" this by stubbing `IntersectionObserver` in `test-setup.ts`. That would
silently disable the fallback coverage across the whole suite.

---

## File Structure

| Path | Responsibility |
|---|---|
| `src/lib/motion.ts` | All shared variants and the easing curve. Plain exported consts, no hooks |
| `src/components/motion/Reveal.tsx` | The only reveal mechanism: variants, viewport config, observer fail-safe |
| `src/components/motion/Reveal.test.tsx` | Asserts the fail-safe |
| `src/components/sections/TimelineEntry.tsx` | One Experience row; owns its slice of scroll progress |
| `src/App.tsx` | `MotionConfig` at the root |
| `src/components/layout/Navbar.tsx` | `layoutId` indicator, scoped per variant |
| `src/components/sections/{Work,Experience,About,Contact}.tsx` | Consume `Reveal` |
| `src/styles/theme.css` | Loses `.reveal`, `.reveal-hidden`, and their reduced-motion block |
| `src/hooks/useScrollReveal.ts` | Deleted |
| `e2e/accessibility.spec.ts` | Two tests rewritten |

---

### Task 1: The Reveal component

**Files:**
- Modify: `src/lib/motion.ts`
- Create: `src/components/motion/Reveal.tsx`
- Test: `src/components/motion/Reveal.test.tsx`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `revealContainer: Variants` and `revealItem: Variants` from `@/lib/motion`
  - `Reveal` from `@/components/motion/Reveal`, with `Reveal.Item` attached. Both accept
    `{ as?: 'section' | 'div' | 'ul' | 'ol' | 'li'; className?: string; id?: string; children: ReactNode }`
    plus `aria-label`, `aria-labelledby`, `aria-hidden`. Both default `as` to `'div'`.
  - Consumed by Tasks 3, 4, 5.

- [ ] **Step 1: Write the failing test**

Create `src/components/motion/Reveal.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Reveal } from './Reveal'

// jsdom does not implement IntersectionObserver (verified: it is `undefined`
// on a fresh JSDOM window, and src/test-setup.ts stubs only matchMedia). So
// this suite exercises Reveal's fallback path, which is exactly the safety
// property worth protecting: content must never be left stranded invisible
// when no observer exists. If a future edit drops the guard, Motion renders
// `style="opacity:0"` onto these elements and both assertions below fail.
describe('Reveal without an IntersectionObserver', () => {
  test('renders children visibly and applies no inline styles', () => {
    render(
      <Reveal as="section" id="probe" className="border-t">
        <Reveal.Item>
          <p>visible content</p>
        </Reveal.Item>
      </Reveal>,
    )

    expect(screen.getByText('visible content')).toBeVisible()

    const section = document.getElementById('probe')
    expect(section).not.toBeNull()
    expect(section?.tagName).toBe('SECTION')
    expect(section?.getAttribute('style')).toBeNull()
    expect(section?.className).toContain('border-t')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/motion/Reveal.test.tsx`
Expected: FAIL, unable to resolve `./Reveal`.

- [ ] **Step 3: Add the reveal variants to `src/lib/motion.ts`**

Append to the file, keeping the existing `EASE` const:

```ts
// Reveal choreography for the four sections below the hero. Exported as
// plain Variants rather than from a hook: reduced motion is handled once by
// the MotionConfig in App.tsx, so there is no per-component state left to
// compute. Tuned quicker than the hero's, because these carry body content
// rather than a cover.
export const revealContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}
```

- [ ] **Step 4: Create `src/components/motion/Reveal.tsx`**

```tsx
import { motion } from 'motion/react'
import type { AriaAttributes, ReactNode } from 'react'
import { revealContainer, revealItem } from '@/lib/motion'

// A closed, type-checked set of tags rather than an index into `motion` by
// string. Passing `as` is what keeps this wrapper from flattening the
// document's semantics into divs: a section stays a section, a list row
// stays an li.
const TAGS = {
  section: motion.section,
  div: motion.div,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
} as const

export type RevealTag = keyof typeof TAGS

// Feature-detected once, at module scope. useScrollReveal (which this
// replaces) was deliberately built "start visible, then enhance": no
// JavaScript, an unsupported observer, and an observer that throws all had
// to resolve to visible content rather than content stranded at opacity 0.
// Motion's whileInView defaults to the opposite, holding content at
// `initial` until an observer fires, so the guard below preserves the
// original guarantee. Rendering the plain element is stronger than a
// try/catch: Motion is never constructed at all.
const CAN_OBSERVE = typeof IntersectionObserver !== 'undefined'

// Matches the rootMargin useScrollReveal used, so the trigger point does not
// shift as part of this change.
const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' } as const

type RevealProps = {
  as?: RevealTag
  className?: string
  id?: string
  children: ReactNode
} & Pick<AriaAttributes, 'aria-label' | 'aria-labelledby' | 'aria-hidden'>

export function Reveal({ as = 'div', children, ...rest }: RevealProps) {
  if (!CAN_OBSERVE) {
    const Plain = as
    return <Plain {...rest}>{children}</Plain>
  }

  const Motion = TAGS[as]
  return (
    <Motion
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      {...rest}
    >
      {children}
    </Motion>
  )
}

function RevealItem({ as = 'div', children, ...rest }: RevealProps) {
  if (!CAN_OBSERVE) {
    const Plain = as
    return <Plain {...rest}>{children}</Plain>
  }

  // No initial/whileInView here on purpose. Motion propagates variant state
  // from the nearest parent motion component through React context, so
  // intervening plain elements (the max-w wrappers, the ol in Experience) do
  // not break the chain.
  const Motion = TAGS[as]
  return (
    <Motion variants={revealItem} {...rest}>
      {children}
    </Motion>
  )
}

Reveal.Item = RevealItem
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/components/motion/Reveal.test.tsx`
Expected: PASS, 1 test.

If `npm run typecheck` reports a props conflict on the spread into `Motion`, do **not**
widen `RevealProps` to `ComponentProps<'div'>`. That reintroduces the collision between
React's `onAnimationStart` / `onDrag` handlers and Motion's own props of the same names.
The narrow prop type above is deliberate. If a consumer later needs another attribute,
add it to the type explicitly.

- [ ] **Step 6: Verify the gate**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all four exit 0, 10 tests passing (9 existing plus the new one).

- [ ] **Step 7: Commit**

```bash
git add src/lib/motion.ts src/components/motion/Reveal.tsx src/components/motion/Reveal.test.tsx
git commit -m "feat: add Reveal component with observer fail-safe"
```

---

### Task 2: MotionConfig at the root, and retire the hero motion hook

**Files:**
- Modify: `src/App.tsx`, `src/lib/motion.ts`, `src/components/sections/Hero.tsx`, `src/components/sections/HeroPortrait.tsx`

**Interfaces:**
- Consumes: `EASE` from `@/lib/motion` (Task 1 left it in place)
- Produces: `heroContainer: Variants`, `heroItem: Variants`, `EASE` as named exports from `@/lib/motion`. `useHeroMotion` no longer exists.

- [ ] **Step 1: Wrap the tree in `MotionConfig`**

In `src/App.tsx`, add the import and wrap the existing fragment's contents:

```tsx
import { MotionConfig } from 'motion/react'
```

```tsx
export default function App() {
  return (
    // reducedMotion="user" makes Motion disable transform and layout
    // animation whenever the OS asks for reduced motion, while leaving
    // opacity alone. That is the correct split: a fade is not what
    // prefers-reduced-motion exists to suppress, a translate is. Handling it
    // here means individual components stop hand-rolling the check.
    //
    // One thing this does NOT cover: MotionValues bound to a style, such as
    // the scroll-driven timeline in Experience.tsx. Those are style
    // bindings, not animations, so that component keeps an explicit
    // useReducedMotion check of its own.
    <MotionConfig reducedMotion="user">
      <SkipLink />
      <Navbar sectionIds={SECTION_IDS} />
      <main id="main">
        <Hero />
        <Work />
        <Experience />
        <About />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  )
}
```

- [ ] **Step 2: Replace `useHeroMotion` with plain consts**

In `src/lib/motion.ts`, delete the entire `useHeroMotion` function and replace it with:

```ts
// Hero entrance choreography. Plain consts rather than a hook, matching the
// reveal variants below: with MotionConfig handling reduced motion at the
// app root there is no per-render state left for a hook to compute.
export const heroContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}
```

Keep `EASE` exported: `HeroPortrait` uses it directly.

- [ ] **Step 3: Update the two hero consumers**

In `src/components/sections/Hero.tsx`, replace the import and the destructuring call:

```tsx
import { heroContainer, heroItem } from '@/lib/motion'
```

Delete the line `const { container, item } = useHeroMotion()`. Then replace
`variants={container}` with `variants={heroContainer}` (one occurrence, on the
`motion.section`) and every `variants={item}` with `variants={heroItem}` (six
occurrences).

In `src/components/sections/HeroPortrait.tsx`, replace the import:

```tsx
import { EASE } from '@/lib/motion'
```

Delete the line `const { item, reduced, ease } = useHeroMotion()`, then apply:

- `variants={item}` becomes `variants={heroItem}` (add `heroItem` to the import)
- `initial={reduced ? false : { scale: 1.04 }}` becomes `initial={{ scale: 1.04 }}`
- `transition={reduced ? { duration: 0 } : { duration: 1.4, ease }}` becomes
  `transition={{ duration: 1.4, ease: EASE }}`

`scale` is a transform, so `MotionConfig` now suppresses it under reduced motion. Update
the comment above `initial` to say that, rather than leaving it describing a `reduced`
variable that no longer exists.

- [ ] **Step 4: Verify the gate**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all four exit 0, 10 tests.

Then confirm no reference survives:

```bash
grep -rn "useHeroMotion" src/ && echo "STOP: stale reference" || echo "clean"
```

- [ ] **Step 5: Verify the hero still animates, and still respects reduced motion**

Run `npx playwright test`. Expected: 7 passed. The reduced-motion and control tests still
target `.reveal` at this point and must both still pass; Task 7 rewrites them. If either
fails **now**, the `MotionConfig` change has broken the existing CSS reveal, which it
should not touch. Stop and report rather than proceeding.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/lib/motion.ts src/components/sections/Hero.tsx src/components/sections/HeroPortrait.tsx
git commit -m "refactor: handle reduced motion once via MotionConfig"
```

---

### Task 3: Migrate Work and About

**Files:**
- Modify: `src/components/sections/Work.tsx`, `src/components/sections/About.tsx`

**Interfaces:**
- Consumes: `Reveal` from `@/components/motion/Reveal` (Task 1)
- Produces: nothing. `#work` and `#about` keep their ids, which `useActiveSection` and `theme.css`'s `scroll-margin-top` rule depend on.

Stagger granularity comes from the spec and is not open to interpretation: stagger the
repeated elements a reader scans, treat prose as one unit.

- [ ] **Step 1: Rewrite `Work.tsx`**

Replace the `useScrollReveal` import with `Reveal`, drop the `cn` import if nothing else
in the file uses it, and replace the `<section>` wrapper:

```tsx
import { projects } from '@/content/projects'
import { ProjectCard } from '@/components/ProjectCard'
import { Reveal } from '@/components/motion/Reveal'

// Featured projects (the first two, `featured: true`) render full width,
// one per row; the rest render in a responsive grid. Same ProjectCard
// shape throughout: only the container width differs.
//
// Each card is its own Reveal.Item so the grid arrives as a sequence rather
// than as one slab. Stack tags inside a card are deliberately not staggered:
// at six per card that reads as a loading state, not as choreography.
export function Work() {
  const featured = projects.filter((project) => project.featured)
  const rest = projects.filter((project) => !project.featured)

  return (
    <Reveal as="section" id="work" className="border-t border-border py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <Reveal.Item>
          <h2 className="font-heading text-3xl font-semibold text-foreground">Selected Work</h2>
        </Reveal.Item>

        <div className="mt-8 flex flex-col gap-6 md:mt-12">
          {featured.map((project) => (
            <Reveal.Item key={project.id}>
              <ProjectCard project={project} />
            </Reveal.Item>
          ))}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((project) => (
            <Reveal.Item key={project.id}>
              <ProjectCard project={project} />
            </Reveal.Item>
          ))}
        </div>
      </div>
    </Reveal>
  )
}
```

Note the grid: `Reveal.Item` renders a `div`, which becomes the grid item in place of the
card. `ProjectCard`'s root is an `<article>` with `flex flex-1 flex-col`, so the wrapper
needs no extra classes for the cards to keep filling their cells. Verify this visually in
Step 3 rather than assuming it.

- [ ] **Step 2: Rewrite the `About.tsx` wrapper**

Replace the `useScrollReveal` import with `Reveal`, drop `cn` if now unused, and change
the section wrapper and the four content blocks. Leave `SKILLS`, `ABOUT_PARAGRAPH`, and
every inner element exactly as they are:

```tsx
    <Reveal as="section" id="about" className="border-t border-border py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <Reveal.Item>
          <h2 className="font-heading text-3xl font-semibold text-foreground">About</h2>
        </Reveal.Item>

        <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-[3fr_2fr]">
          <Reveal.Item>
            <p className="max-w-2xl text-base text-foreground">{ABOUT_PARAGRAPH}</p>
          </Reveal.Item>

          <div className="space-y-6">
            {/* Skills, Education and Certifications each wrapped in a
                Reveal.Item, three blocks rather than 22 individual tags. */}
          </div>
        </div>
      </div>
    </Reveal>
```

Wrap each of the three existing `<div>` blocks inside `space-y-6` (Skills, Education,
Certifications) in its own `<Reveal.Item>`. The paragraph is one unit: animating prose
line by line is not the effect wanted here.

- [ ] **Step 3: Verify the gate, then verify in the browser**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all four exit 0, 10 tests.

Then start the preview (`preview_start`, config `portfolio-dev`) and confirm, reporting
literal expressions and outputs:

- Scrolling to Work shows the heading first, then the cards in sequence, not all at once
- Every card is fully opaque after the section has been scrolled to:
  `[...document.querySelectorAll('#work article')].map(e => getComputedStyle(e).opacity)`
  is `["1","1","1","1","1"]`
- The same for About's four blocks
- The Work grid still lays out three across at `lg`, unchanged by the wrapper divs
- `document.documentElement.scrollWidth <= window.innerWidth` is `true` at 1440px

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Work.tsx src/components/sections/About.tsx
git commit -m "feat: stagger Work and About reveals"
```

---

### Task 4: Migrate Contact

**Files:**
- Modify: `src/components/sections/Contact.tsx`

**Interfaces:**
- Consumes: `Reveal` (Task 1)
- Produces: nothing. `#contact` keeps its id.

Separated from Task 3 because of one rule a reviewer could reasonably reject on its own.

- [ ] **Step 1: Rewrite the section wrapper**

Remove the `useScrollReveal` import and the `const { ref: sectionRef, revealed } = ...`
line. Drop `cn` if now unused. Leave every piece of form state, validation, and submit
handling untouched. Replace the wrapper at lines 104 to 109 and wrap three blocks:

```tsx
    <Reveal as="section" id="contact" className="border-t border-border py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <Reveal.Item>
          <h2 className="font-heading text-3xl font-semibold text-foreground">Contact</h2>
        </Reveal.Item>

        <Reveal.Item>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            I&apos;m always interested in new opportunities, collaborations, or just a conversation
            about technology and development. Feel free to reach out.
          </p>
        </Reveal.Item>

        <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-[3fr_2fr]">
          {/* The form is ONE Reveal.Item, never one per field. Staggering
              individual inputs animates elements a keyboard user may be
              tabbing toward, and moving a focus target is worse than not
              animating it. Same rule everywhere: no Reveal.Item wraps a
              single focusable element. */}
          <Reveal.Item>
            <form noValidate onSubmit={handleSubmit} className="max-w-xl space-y-5">
              {/* unchanged */}
            </form>
          </Reveal.Item>

          <Reveal.Item>
            {/* the existing "Elsewhere" / social links column, unchanged */}
          </Reveal.Item>
        </div>
      </div>
    </Reveal>
```

- [ ] **Step 2: Verify the existing Contact tests still pass**

Run: `npx vitest run src/components/sections/Contact.test.tsx`
Expected: PASS, unchanged count.

These tests cover validation and focus management. They pass through this change because
jsdom has no `IntersectionObserver`, so `Reveal` renders plain elements and the DOM the
tests query is structurally the same apart from two wrapper divs. If a query that used a
direct-child or sibling selector now fails, fix the **test selector**, not the component
structure, and say so in the report.

- [ ] **Step 3: Verify the gate, then verify focus in the browser**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all four exit 0, 10 tests.

In the preview, confirm the form still works end to end: tab into Name, Email and Message,
submit empty, and check that focus lands on the first invalid field. Report the literal
value of `document.activeElement.id` after the failed submit. Expected: `contact-name`.

Known environment characteristic: the `computer` click tool silently no-ops on some
controls here. Drive interactions with a dispatched pointer sequence
(`pointerdown`, `mousedown`, `pointerup`, `mouseup`, `click`) and say that is what you did.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Contact.tsx
git commit -m "feat: stagger Contact reveal, form as a single unit"
```

---

### Task 5: The scrubbed Experience timeline

**Files:**
- Modify: `src/components/sections/Experience.tsx`
- Create: `src/components/sections/TimelineEntry.tsx`

**Interfaces:**
- Consumes: `Reveal` (Task 1); the `Experience` type and `experience` array from `@/content/experience`
- Produces: `<TimelineEntry entry={Experience} index={number} total={number} progress={MotionValue<number>} reduced={boolean} />`

Note the type is named `Experience`, the same name as the section component. Import it as
a type-only import in `TimelineEntry.tsx`, where there is no component of that name to
collide with.

- [ ] **Step 1: Create `src/components/sections/TimelineEntry.tsx`**

```tsx
import { motion, useTransform, type MotionValue } from 'motion/react'
import { Reveal } from '@/components/motion/Reveal'
import type { Experience } from '@/content/experience'

type TimelineEntryProps = {
  entry: Experience
  index: number
  total: number
  progress: MotionValue<number>
  reduced: boolean
}

// One row of the Experience timeline. This is a separate component because
// each row needs its own useTransform slice of the shared scroll progress to
// fill its dot as the drawn line arrives, and hooks cannot be called in a
// loop inside the parent's map.
export function TimelineEntry({ entry, index, total, progress, reduced }: TimelineEntryProps) {
  // Where this dot sits along the line: the first at 0, the last at 1.
  // The 0.08 lead-in makes the dot fill just as the line reaches it rather
  // than snapping after it has already passed.
  const at = total > 1 ? index / (total - 1) : 0
  const fill = useTransform(progress, [Math.max(at - 0.08, 0), at], [0, 1])

  return (
    <Reveal.Item as="li" className="relative flex gap-4 sm:gap-6">
      <div aria-hidden="true" className="flex w-4 flex-none justify-center">
        <span className="relative mt-1.5 size-2.5 flex-none rounded-full bg-border ring-4 ring-background">
          <motion.span
            className="absolute inset-0 rounded-full bg-accent"
            style={{ scale: reduced ? 1 : fill }}
          />
        </span>
      </div>

      <div className="flex-1 pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-heading text-lg font-semibold text-foreground">{entry.role}</h3>
          <span className="font-mono text-xs whitespace-nowrap text-muted-foreground">
            {entry.start} – {entry.end}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {entry.organization}
          {entry.location ? ` · ${entry.location}` : ''}
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-foreground">
          {entry.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </div>
    </Reveal.Item>
  )
}
```

The dot's resting colour changes from `bg-accent` to `bg-border`, with the accent fill
layered on top. That is intentional: an undrawn dot should read as pending.

- [ ] **Step 2: Rewrite `Experience.tsx`**

```tsx
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { experience } from '@/content/experience'
import { Reveal } from '@/components/motion/Reveal'
import { TimelineEntry } from '@/components/sections/TimelineEntry'

// Vertical timeline, newest first (order comes from src/content/experience.ts,
// which also carries a code comment noting the UC San Diego entry's
// highlights are scope-derived pending real accomplishments; not repeated
// or altered here). Dates render in font-mono per MASTER.md's typography rule.
//
// The connector was previously a per-entry segment inside each row. It is now
// one continuous track down the whole list, with an accent line drawn over it
// whose height follows scroll position, because a scrubbed draw needs a single
// element to scale rather than five independent ones.
export function Experience() {
  const listRef = useRef<HTMLOListElement>(null)

  // Explicit check, deliberately not delegated to the MotionConfig in
  // App.tsx. That handles animations; the line below is a MotionValue bound
  // to a style, which MotionConfig does not touch. Under reduced motion the
  // timeline renders fully drawn and every dot filled, statically.
  const reduced = useReducedMotion() ?? false

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 0.8', 'end 0.6'],
  })
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <Reveal as="section" id="experience" className="border-t border-border py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <Reveal.Item>
          <h2 className="font-heading text-3xl font-semibold text-foreground">Experience</h2>
        </Reveal.Item>

        <ol ref={listRef} className="relative mt-8 space-y-10 md:mt-12">
          {/* Static track and drawn line. left-[7px] centres a 1px rule under
              a 2.5-unit (10px) dot inside a 4-unit (16px) column: (16-1)/2
              rounds to 7. Verify by measurement, not by trusting this sum. */}
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[7px] w-px bg-border"
          />
          <motion.span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-accent"
            style={{ scaleY: reduced ? 1 : progress }}
          />

          {experience.map((entry, index) => (
            <TimelineEntry
              key={`${entry.organization}-${entry.role}`}
              entry={entry}
              index={index}
              total={experience.length}
              progress={progress}
              reduced={reduced}
            />
          ))}
        </ol>
      </div>
    </Reveal>
  )
}
```

- [ ] **Step 3: Verify the gate**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all four exit 0, 10 tests.

- [ ] **Step 4: Verify the line geometry by measuring**

The `left-[7px]` above is arithmetic, and arithmetic about box models has been wrong three
times on this project. Measure it. In the preview, with the Experience section scrolled
into view:

```js
const track = document.querySelector('#experience ol > span')
const dot = document.querySelector('#experience li span')
const t = track.getBoundingClientRect(), d = dot.getBoundingClientRect()
;({ trackCentre: t.left + t.width / 2, dotCentre: d.left + d.width / 2 })
```

Expected: the two centres are within 1px. If they are not, adjust `left-[Npx]` on **both**
spans to match the measured dot centre and say what the measured values were.

- [ ] **Step 5: Verify the scrub, in both directions and both themes**

Report literal expressions and outputs:

- Scrolling down through Experience, the accent line grows and each dot fills as the line
  reaches it
- Scrolling back up, the line retreats. This is the behaviour that distinguishes the
  chosen design from a one-shot draw; if it does not reverse, the scroll binding is wrong
- At the end of the section the line is fully drawn:
  `getComputedStyle(document.querySelector('#experience ol > span:nth-child(2)')).transform`
  resolves to a matrix with a y-scale at or very near 1
- In both themes the drawn line and the filled dots meet 3:1 against the section
  background. Report the computed colours

- [ ] **Step 6: Verify reduced motion renders the timeline fully drawn**

Emulate `prefers-reduced-motion: reduce` and reload. Expected: the line is at full height
and every dot is filled immediately, with no scroll dependence. Report the same
`transform` expression from Step 5, sampled **before** scrolling into the section.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/Experience.tsx src/components/sections/TimelineEntry.tsx
git commit -m "feat: draw the Experience timeline against scroll position"
```

---

### Task 6: The navbar indicator

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: nothing

- [ ] **Step 1: Add the indicator to `NavLink`**

Add `import { motion } from 'motion/react'`. Inside the `<a>`, after `{label}`, add:

```tsx
      {active && (
        // layoutId is what makes Motion animate this between nav items
        // rather than cross-fading two separate elements. Scoped per
        // variant: the desktop nav and the mobile Sheet render this same
        // component, and both can be mounted at once, so a single shared id
        // would have Motion trying to animate the indicator between a
        // visible navbar and a drawer.
        <motion.span
          layoutId={variant === 'mobile' ? 'nav-active-mobile' : 'nav-active-desktop'}
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-1.5 h-px bg-accent"
        />
      )}
```

The `<a>` must become a positioning context for it. Add `relative` to the base classes in
the existing `cn(...)` call:

```tsx
        'relative font-heading text-sm font-medium transition-colors',
```

- [ ] **Step 2: Verify the gate**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all four exit 0, 10 tests.

- [ ] **Step 3: Verify the indicator tracks the active section**

In the preview at 1440px, scroll from top to bottom and confirm the underline moves
between Work, Experience, About and Contact rather than disappearing and reappearing.
Report, for two different active sections, the literal output of:

```js
const el = document.querySelector('nav[aria-label="Primary"] a[aria-current="page"]')
;({ label: el.textContent, indicator: !!el.querySelector('span') })
```

- [ ] **Step 4: Verify the desktop and mobile indicators do not interfere**

At 375px, open the mobile menu with a dispatched pointer sequence and confirm no console
warning mentioning `layoutId` appears, and the drawer's active row shows its own
indicator. Report the output of `read_console_messages` with `onlyErrors: false`, filtered
for `layout`.

This is the specific bug the per-variant scoping exists to prevent, so an empty result
here is the point of the step, not a formality.

- [ ] **Step 5: Verify focus is still visible**

Tab through the nav. Every link keeps a visible focus ring, and the indicator does not
sit on top of it. The existing e2e keyboard-traversal test also covers focus not being
obscured by the sticky navbar; run `npx playwright test` and expect 7 passed.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: glide the navbar indicator between sections"
```

---

### Task 7: Delete the old mechanism and rewrite the two e2e tests

**Files:**
- Delete: `src/hooks/useScrollReveal.ts`
- Modify: `src/styles/theme.css`, `e2e/accessibility.spec.ts`

**Interfaces:**
- Consumes: everything Tasks 1 through 6 produced
- Produces: nothing

This task comes last on purpose. Deleting the hook before every consumer is migrated
breaks the build.

- [ ] **Step 1: Confirm nothing still imports the hook**

```bash
grep -rn "useScrollReveal\|reveal-hidden\|'reveal'\|\"reveal\"" src/ e2e/ index.html
```

Expected: matches only in `src/hooks/useScrollReveal.ts` and `src/styles/theme.css`, both
of which this task removes. **Any match in a section component means an earlier task is
incomplete: STOP and report which one.**

- [ ] **Step 2: Delete the hook and the CSS**

```bash
git rm src/hooks/useScrollReveal.ts
```

In `src/styles/theme.css`, remove the `.reveal` rule, the `.reveal-hidden` rule, their
shared explanatory comment, and the `@media (prefers-reduced-motion: reduce)` block that
contains only `.reveal { transition-duration: 0.01ms; }`.

**Do not touch** the site-wide `@media (prefers-reduced-motion: reduce)` block near
line 156 that sets `animation-duration` and `transition-duration` globally. That one is
independent of the reveal mechanism and still does real work.

- [ ] **Step 3: Rewrite the two e2e tests**

In `e2e/accessibility.spec.ts`, replace the two `test.describe` blocks named
`prefers-reduced-motion suppresses the scroll-reveal animation` and
`control: without reduced motion the reveal transition is real` with:

```ts
test.describe('reduced motion suppresses the reveal translate', () => {
  // (See the note on contextOptions in the keyboard-traversal block below for
  // why the preference is set this way rather than through test.use({ ... }).)
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  // Sampled while #work is still below the fold, which is what makes this
  // deterministic: no race against an in-flight animation. Motion under
  // MotionConfig reducedMotion="user" suppresses transform but not opacity,
  // so the heading never carries a translate at any point.
  test('the Work heading never carries a translate, and ends opaque', async ({ page }) => {
    await page.goto('/')

    const heading = page.locator('#work h2')
    await expect(heading).toHaveCSS('transform', 'none')

    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toHaveCSS('opacity', '1')
  })
})

test.describe('control: without reduced motion the reveal does translate', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } })

  // The same two samples in the opposite state. This is what stops the test
  // above from passing vacuously: it proves the media query changes the
  // rendered result rather than merely being read.
  test('the Work heading starts translated below the fold, then settles opaque', async ({
    page,
  }) => {
    await page.goto('/')

    const heading = page.locator('#work h2')
    const transform = await heading.evaluate((el) => getComputedStyle(el).transform)
    expect(transform).not.toBe('none')

    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toHaveCSS('opacity', '1')
  })
})
```

If `firstDurationMs` is now unused, delete it and its comment. If another test still uses
it, leave it. Check before deleting.

`#work h2` is a `Reveal.Item`, not the section: the container variant carries no `y`, so
the section itself never translates. Targeting the section would make both assertions
vacuous, which is the exact failure mode this rewrite exists to remove.

- [ ] **Step 4: Verify both new tests fail for the right reason if inverted**

Before accepting a green run, prove the tests can fail. Temporarily change
`expect(transform).not.toBe('none')` to `expect(transform).toBe('none')` in the control
test and confirm it fails. Revert it.

Report the failure output. A test that has never been seen to fail is not yet evidence.

- [ ] **Step 5: Verify the gate**

Run: `npm run typecheck && npm run lint && npm test && npm run build && npx playwright test`
Expected: all exit 0, 10 unit tests, 7 e2e tests.

- [ ] **Step 6: Commit**

```bash
git add -A src/hooks src/styles/theme.css e2e/accessibility.spec.ts
git commit -m "refactor: retire useScrollReveal in favour of Reveal"
```

---

### Task 8: Final verification pass

**Files:** none. Verification only.

**Interfaces:**
- Consumes: everything above
- Produces: nothing

- [ ] **Step 1: Full gate from a clean install**

```bash
rm -rf node_modules && npm ci
npm test && npm run typecheck && npm run lint && npm run build && npx playwright test
```

Expected: 10 unit, 7 e2e, every command exits 0.

- [ ] **Step 2: No section is stranded invisible**

This is the primary regression risk of deleting `useScrollReveal` and must be checked
explicitly rather than assumed. In the preview, scroll the full page top to bottom, then
report the literal output of:

```js
['work','experience','about','contact'].map(id => {
  const el = document.getElementById(id)
  return [id, getComputedStyle(el).opacity, el.getBoundingClientRect().height > 0]
})
```

Expected: every entry reads `["<id>", "1", true]`. Repeat in both themes.

- [ ] **Step 3: Three widths, both themes**

At 375px, 768px and 1440px, in light and dark, report:

- `document.documentElement.scrollWidth <= window.innerWidth` is `true` at each width
- The Experience timeline line and dots are aligned and reach full draw
- The navbar indicator is present and positioned under the active item

- [ ] **Step 4: Report the bundle delta**

```bash
npm run build 2>&1 | grep "index-.*\.js"
```

The pre-task baseline is `422.38 kB` raw, `136.71 kB` gzip. Report both new numbers and
the delta. `useScroll`, `useSpring` and `useTransform` are new imports, so a small
increase is expected; a large one means something unintended was pulled in.

- [ ] **Step 5: Commit any fixes**

If Steps 1 through 4 surface nothing, there is nothing to commit and that is a valid
outcome. Say so explicitly rather than manufacturing a change.

---

## Self-Review

**Spec coverage.** Walked the spec section by section:

| Spec section | Task |
|---|---|
| The Reveal component | 1 |
| The fail-safe | 1 (implementation), 1 Step 1 (test) |
| Shared variants, with the hero/reveal table | 1 Step 3, 2 Step 2 |
| Stagger granularity table | 3 (Work, About), 4 (Contact), 5 (Experience) |
| Reduced motion, `MotionConfig` | 2 |
| Reduced motion, the timeline exception | 5 Steps 2 and 6 |
| The timeline | 5 |
| The navbar indicator | 6 |
| File Structure table, all 12 rows | 1 through 7 |
| Testing, two e2e rewrites | 7 Step 3 |
| Testing, the unchanged no-JS test | untouched; Task 7 Step 5 reruns it |
| Testing, new unit test | 1 Step 1 |
| Verification, all five bullets | 8 |

No gaps.

**Placeholder scan.** No TBD, no "handle edge cases", no "similar to Task N". Every code
step carries the actual code. Two steps deliberately specify *no* change as the expected
outcome (7 Step 2's warning about the global reduced-motion block, 8 Step 5), which is a
stated outcome rather than a placeholder.

**Type consistency.**

- `revealContainer` / `revealItem` defined in Task 1 Step 3, consumed in Task 1 Step 4.
- `Reveal` and `Reveal.Item` defined in Task 1, consumed in Tasks 3, 4, 5 with the same
  prop names (`as`, `className`, `id`).
- `heroContainer` / `heroItem` / `EASE` defined in Task 2 Step 2, consumed in Task 2
  Step 3. `useHeroMotion` is deleted in the same task that removes its last caller, and
  Step 4 greps to prove it.
- `TimelineEntry`'s five props are declared in Task 5 Step 1 and passed with identical
  names in Step 2.
- The content type is `Experience`, verified in `src/content/experience.ts:13`, not
  `ExperienceEntry`. Task 5 imports it under that name and flags the collision with the
  section component of the same name.
- `progress` is a `MotionValue<number>` produced by `useSpring` in Task 5 Step 2 and
  consumed with that exact type in Step 1.

**Known risks carried deliberately.**

- Motion propagates variants through React context, so the plain wrapper elements between
  `Reveal` and `Reveal.Item` (the `max-w-5xl` divs, the `ol` in Experience) do not break
  the chain. Task 3 Step 3 and Task 5 Step 5 verify the stagger actually happens rather
  than assuming this.
- Every unit test runs without an `IntersectionObserver`, so `Reveal`'s Motion path is
  covered only by Playwright. Called out at the top of the plan so a reviewer does not
  read the thin unit coverage as an oversight.
- `left-[7px]` in Task 5 is arithmetic about a box model, which has been wrong three times
  on this project. Task 5 Step 4 measures it instead of trusting it.
