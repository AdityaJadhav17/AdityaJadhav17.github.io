import { MotionConfig } from 'motion/react'
import { SkipLink } from '@/components/layout/SkipLink'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Work } from '@/components/sections/Work'
import { Experience } from '@/components/sections/Experience'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'

const SECTION_IDS = ['home', 'work', 'experience', 'about', 'contact']

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
