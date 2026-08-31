import { SkipLink } from '@/components/layout/SkipLink'
import { Navbar } from '@/components/layout/Navbar'

const SECTION_IDS = ['home', 'work', 'experience', 'about', 'certifications', 'contact']

export default function App() {
  return (
    <>
      <SkipLink />
      <Navbar sectionIds={SECTION_IDS} />
      <main id="main">{/* sections land here in Tasks 7-9 */}</main>
    </>
  )
}
