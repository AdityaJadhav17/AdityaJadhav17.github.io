import { SkipLink } from '@/components/layout/SkipLink'
import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/sections/Hero'
import { Work } from '@/components/sections/Work'
import { Experience } from '@/components/sections/Experience'
import { About } from '@/components/sections/About'
import { Certifications } from '@/components/sections/Certifications'

const SECTION_IDS = ['home', 'work', 'experience', 'about', 'certifications', 'contact']

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
        <Certifications />
        {/* contact lands in Task 10 */}
      </main>
    </>
  )
}
