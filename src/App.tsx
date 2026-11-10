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
    <>
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
    </>
  )
}
