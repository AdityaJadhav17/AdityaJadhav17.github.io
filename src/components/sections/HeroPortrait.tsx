import { site } from '@/content/site'
import { PORTRAIT_SIZES, srcSet } from '@/lib/portrait'

// The portrait is the visual centre of the composition, so it gets its own
// file: its sizing is viewport-relative rather than token-driven, and it has
// to read correctly on both the light and the dark ground.
//
// The asset is a cut-out with a real alpha channel (36% transparent), which
// is what lets the display claim in Hero.tsx overlap the subject's lower edge
// and makes the composition read as one image rather than a photo with a
// caption beneath it. If a rectangular photo is ever substituted here, the
// overlap will look like a mistake rather than a design.
export function HeroPortrait() {
  return (
    <div
      // Right-anchored at lg rather than centred. A centred portrait puts the
    // subject's arm directly under the display claim's lower-right, which is
    // dark clothing behind dark type in the light theme. Offsetting right
    // keeps the two clear of each other while they still share the frame.
    //
    // 5% was measured, not guessed. The binding constraint is the proof row,
    // which reaches furthest right and overlaps the portrait vertically. At
    // 62vh the portrait is narrower than it was at 66vh, so the 7% used then
    // left only ~41px at 1440; 5% restores ~70px. Below roughly 50px the proof
    // labels start reading as though they sit on the subject's arm, which is
    // dark text on dark clothing in the light theme.
    className="pointer-events-none flex justify-center lg:absolute lg:inset-x-0 lg:bottom-0 lg:justify-end lg:pr-[5%]"
    >
      <div className="relative">
        {/* Sits behind the portrait. Purely presentational, so it is hidden
            from assistive technology and takes no pointer events. Inset
            negatively so the falloff extends past the image rather than
            stopping at its edge. */}
        <div aria-hidden="true" className="hero-glow pointer-events-none absolute -inset-[18%]" />

        <picture>
          <source type="image/avif" srcSet={srcSet('avif')} sizes={PORTRAIT_SIZES} />
          <source type="image/webp" srcSet={srcSet('webp')} sizes={PORTRAIT_SIZES} />
          <img
            src="/portrait-800.webp"
            alt={`${site.name}, ${site.discipline}`}
            width={1467}
            height={1600}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="relative h-[38vh] w-auto max-w-none object-contain object-bottom sm:h-[46vh] lg:h-[62vh]"
          />
        </picture>
      </div>
    </div>
  )
}
