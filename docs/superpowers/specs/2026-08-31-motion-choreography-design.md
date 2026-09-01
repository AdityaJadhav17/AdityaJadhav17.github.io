# Motion Choreography Design Document

**Status:** approved in brainstorming, 2026-08-31
**Amends:** [`2026-08-30-portfolio-redesign-design.md`](2026-08-30-portfolio-redesign-design.md), the Motion section only. Every other section of that spec stands unchanged.

## Purpose

The hero is choreographed with Motion. Everything below it is not: `useScrollReveal`
fades each section in as one solid block on a 350ms CSS transition, so the whole Work
grid, all five Experience entries, and the entire About column arrive at once. The page
reads as five slabs appearing rather than as content arriving.

This work replaces that with staggered, scroll-aware choreography across the four
sections below the hero, draws the Experience timeline against scroll position, and
gives the navbar an indicator that glides between sections instead of blinking.

Motion is already in the bundle, so the incremental weight is close to zero. The cost of
this work is structural, not byte-based: it retires a mechanism four components depend on.

## Constraints

Inherited from the redesign spec and restated because they bind every task here:

- All work happens on branch `redesign`. `.github/workflows/deploy.yml` triggers on
  `branches: [main]` only. Never push, never merge.
- `.claude/`, `.superpowers/`, `*.tsbuildinfo` are gitignored and must never be committed.
- No em dashes in published copy.
- Semantic colour tokens only. `src/styles/theme.css` is the one legal home for colour
  literals. No hex in any `.tsx` or `.ts`.
- Everything works in both themes. Contrast 4.5:1 for text, 3:1 for non-text UI, in both.
- Node 20.
- If an instruction conflicts with the repo, or something referenced is absent, STOP and
  report rather than improvising.

## Decisions

Two forks were settled during brainstorming. Both are binding.

**D1. A single shared reveal mechanism, not two.** `useScrollReveal` and the
`.reveal` / `.reveal-hidden` CSS are deleted, not kept alongside Motion. Two independent
reveal systems firing on the same scroll event is harder to tune and to reason about than
either one alone.

**D2. The timeline is scrubbed to scroll position, not fired once on entry.** The
connector line's height tracks the scrollbar and responds when the reader scrolls back
up. This is the only one of the three options that keeps responding rather than firing
once and going inert.

## Architecture

### The Reveal component

`src/components/motion/Reveal.tsx` becomes the only reveal mechanism on the site.

It is a compound component. `<Reveal>` renders a Motion element carrying the container
variants plus `initial="hidden" whileInView="visible"`; `<Reveal.Item>` renders a Motion
element carrying the item variants. Both accept an `as` prop so a section stays a
`<section>`, a list stays a `<ul>` or `<ol>`, and a list row stays an `<li>`. Passing
`as` is what keeps this from flattening the document's semantics into `<div>` elements.

```tsx
type RevealTag = 'section' | 'div' | 'ul' | 'ol' | 'li'

type RevealProps = {
  as?: RevealTag        // default 'div'
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLElement>   // id, aria-*, role pass through
```

`as` resolves through an explicit record of Motion components rather than an index into
`motion` by string, so the set of legal tags is closed and type-checked:

```tsx
const TAGS = {
  section: motion.section,
  div: motion.div,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
} as const
```

Viewport configuration is fixed for every consumer, matching the rootMargin the current
hook uses so the trigger point does not shift:

```tsx
viewport={{ once: true, margin: '0px 0px -10% 0px' }}
```

### The fail-safe

`useScrollReveal` is deliberately built "start visible, then enhance": content renders
visible, and only goes hidden once an `IntersectionObserver` has been constructed and
started successfully. No JavaScript, an unsupported observer, and an observer that throws
all resolve to visible content rather than content stranded at `opacity: 0`. That
property must survive this change.

Motion's `whileInView` defaults to the opposite, holding content at `initial` until an
observer fires. So `Reveal` guards it:

```tsx
const CAN_OBSERVE = typeof IntersectionObserver !== 'undefined'
```

evaluated once at module scope. When it is false, `Reveal` and `Reveal.Item` render the
plain DOM element with no Motion wrapper at all. This is stronger than the current
try/catch, because Motion is never constructed rather than being constructed and caught.

### Shared variants

Reveal variants live in the existing `src/lib/motion.ts` alongside the hero's, exported
as plain `Variants` objects rather than a hook, because reduced motion is handled
globally (see below) and there is no longer per-component state to compute. Tuned quicker
than the hero's, since these carry body content rather than a cover:

| | Hero (existing) | Reveal (new) |
|---|---|---|
| rise | 20px | 16px |
| duration | 750ms | 500ms |
| stagger | 80ms | 60ms |
| delayChildren | 150ms | 0 |

### Stagger granularity

"Consumes `Reveal`" is not specific enough on its own, so the unit that staggers is named
per section. The rule behind the table: stagger the repeated elements a reader scans, and
treat prose as one unit rather than animating it line by line.

| Section | `<Reveal>` wraps | `<Reveal.Item>` units |
|---|---|---|
| Work | the `<section>` | heading, then each `ProjectCard` (5 items) |
| Experience | the `<section>` | heading, then each timeline entry (5 items) |
| About | the `<section>` | heading, the paragraph as one unit, then Skills, Education, Certifications as three blocks |
| Contact | the `<section>` | heading, intro copy, the form as **one** unit, then the social links |

The form is deliberately a single unit. Staggering individual fields animates elements a
keyboard user may be tabbing toward, and moving a focus target is worse than not
animating it. For the same reason no `Reveal.Item` wraps an element that can receive
focus on its own.

Skills tags inside About and stack tags inside `ProjectCard` do not stagger individually.
At 22 and 6 items respectively, a per-tag stagger reads as a loading state rather than as
choreography.

### Reduced motion

`<MotionConfig reducedMotion="user">` wraps the tree in `App.tsx`. Motion then disables
transform and layout animation globally while leaving opacity animation intact, which is
the correct treatment: an opacity fade is not what `prefers-reduced-motion` exists to
suppress, and a translate is.

Because that is now handled in one place, `useHeroMotion` drops its manual `reduced`
branches in the same pass. Leaving both would mean two systems doing one job, which is
the same duplication D1 rejects for reveals.

**One documented exception.** `useScroll` produces a MotionValue bound to a style, not an
animation, so `MotionConfig` does not neutralise it. The timeline therefore keeps an
explicit `useReducedMotion()` check and, when reduced, renders fully drawn with every dot
filled, statically. This exception must be commented in the code, because a future reader
who sees `MotionConfig` in `App.tsx` will reasonably assume it covers everything.

### The timeline

`Experience.tsx` currently renders a per-entry connector: each `<li>` carries a `w-px`
segment that stops at the next entry. A scrubbed draw needs one continuous line, so the
structure changes to a single track spanning the `<ol>`, with an accent line above it:

- a static track, `bg-border`, absolutely positioned down the dot column
- a `motion.span`, `bg-accent`, same geometry, `origin-top`, its `scaleY` bound to
  spring-smoothed scroll progress
- both `aria-hidden`, as the existing decorative dots and rules already are

Progress comes from `useScroll({ target: olRef, offset: ['start 0.8', 'end 0.6'] })`,
smoothed through `useSpring`.

Each entry becomes a `TimelineEntry` child component. This is not decorative
decomposition: each entry needs its own `useTransform` slice of the shared progress value
to fill its dot as the line arrives, and hooks cannot be called in a loop.

### The navbar indicator

The active `NavLink` renders a `motion.span` underline carrying a `layoutId`, which Motion
animates between positions as the active section changes.

The desktop nav and the mobile Sheet render the same `NavLink` component. The `layoutId`
is therefore scoped per variant (`nav-active-desktop` and `nav-active-mobile`). A single
shared id would make Motion attempt to animate the indicator between a visible navbar and
a drawer, which is a real bug and not a hypothetical one, because both can be mounted at
the same time.

## File Structure

| Path | Change | Responsibility |
|---|---|---|
| `src/components/motion/Reveal.tsx` | create | The only reveal mechanism: variants, viewport config, observer fail-safe |
| `src/components/sections/TimelineEntry.tsx` | create | One Experience row; owns its slice of scroll progress |
| `src/lib/motion.ts` | modify | Adds reveal variants; `useHeroMotion` sheds its manual reduced-motion branches |
| `src/App.tsx` | modify | Wraps the tree in `MotionConfig` |
| `src/components/layout/Navbar.tsx` | modify | `layoutId` indicator, scoped per variant |
| `src/components/sections/Work.tsx` | modify | Consumes `Reveal` |
| `src/components/sections/Experience.tsx` | modify | Consumes `Reveal`; continuous track replaces per-entry segments |
| `src/components/sections/About.tsx` | modify | Consumes `Reveal` |
| `src/components/sections/Contact.tsx` | modify | Consumes `Reveal` |
| `src/styles/theme.css` | modify | Removes `.reveal`, `.reveal-hidden`, and their `prefers-reduced-motion` block |
| `src/hooks/useScrollReveal.ts` | delete | Superseded |
| `e2e/accessibility.spec.ts` | modify | Two tests rewritten against the new mechanism |

## Testing

### The two e2e tests that must be rewritten

`e2e/accessibility.spec.ts` currently asserts `transitionDuration` on `#work` and
`#experience`: under 10ms with reduced motion, between 300 and 400ms without. Both
assertions become vacuous once `.reveal` is gone, since Motion animates through inline
styles rather than a CSS transition and `transitionDuration` will read `0s` in both
states. A test that passes for the wrong reason is worse than no test.

The replacement uses the fact that Motion under `reducedMotion="user"` suppresses
transform but not opacity, and samples the section **while it is still below the fold**,
which makes the assertion deterministic rather than a race against an in-flight animation:

- **Reduced motion:** before scrolling to it, `#work` has `transform: none`. After
  `scrollIntoViewIfNeeded`, `opacity: 1`.
- **Control, no preference:** before scrolling to it, `#work` has a `transform` matrix
  carrying a non-zero translate. After `scrollIntoViewIfNeeded`, `opacity: 1`.

The pair proves the media query does something, which is what makes the reduced-motion
test meaningful, and preserves the intent of the control test it replaces.

Both sections sit below the `min-h-dvh` hero, so "still below the fold at load" holds.

### Test that does not change

The JavaScript-disabled test exercises the `<noscript>` block in `index.html` and is
untouched by any of this.

### New unit test

One test in `src/components/motion/Reveal.test.tsx`: with `IntersectionObserver` deleted
from the jsdom global, `Reveal` renders its children visibly. This is the safety property
from the fail-safe section, it is the single most important behaviour in the new
component, and it is cheap to assert.

## Verification

- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npx playwright test`
  all exit 0 from a cold `npm ci`.
- Every section below the hero is visible after scrolling to it, in both themes. A
  section left stranded invisible is the primary regression risk of deleting
  `useScrollReveal` and must be checked explicitly rather than assumed.
- No horizontal scroll at 375px, 768px, 1440px.
- The navbar indicator tracks the active section while scrolling the full page, and does
  not animate between the desktop nav and an open mobile drawer.
- The timeline line and dots reach a fully drawn state by the end of the section, and
  return as the reader scrolls back up.

## Out of Scope

Named because they were discussed and deliberately excluded, so a later reader does not
read their absence as an oversight:

- Card hover choreography on `ProjectCard`, hero portrait parallax, and masked heading
  reveals. All three are viable and were ranked below these; they are separate work.
- Letter-by-letter or typing effects on the hero claim, page preloaders, and parallax on
  anything beyond a single element. Rejected on merit, not deferred.
- Any change to the hero composition itself beyond `useHeroMotion` shedding its
  reduced-motion branches.
- The merge to `main`, which remains gated on the owner's explicit sign-off.
