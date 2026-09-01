import { motion } from 'motion/react'
import { site } from '@/content/site'
import { useHeroMotion } from '@/lib/motion'

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
  const { item, reduced, ease } = useHeroMotion()

  return (
    <motion.div
      variants={item}
      className="pointer-events-none flex justify-center lg:absolute lg:inset-x-0 lg:bottom-0"
    >
      <motion.img
        src="/portrait.webp"
        alt={`${site.name}, ${site.discipline}`}
        width={1467}
        height={1600}
        loading="eager"
        fetchPriority="high"
        // A slow settle from very slightly oversized. Set as initial/animate
        // rather than a variant so it runs independently of the band stagger:
        // the portrait should still be moving while the text has landed.
        initial={reduced ? false : { scale: 1.04 }}
        animate={{ scale: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 1.4, ease }}
        className="h-[38vh] w-auto max-w-none object-contain object-bottom sm:h-[46vh] lg:h-[68vh]"
      />
    </motion.div>
  )
}
