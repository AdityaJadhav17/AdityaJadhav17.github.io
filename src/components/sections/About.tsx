import { certifications } from '@/content/certifications'
import { site } from '@/content/site'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { cn } from '@/lib/utils'

// Skills list carried over unchanged from the previous site's technical
// skills.
const SKILLS = [
  'Python',
  'C++',
  'Java',
  'JavaScript',
  'TypeScript',
  'React',
  'HTML/CSS',
  'PyTorch',
  'TensorFlow',
  'NumPy',
  'OpenCV',
  'YOLOv8',
  'Node.js',
  'SQL',
  'Git',
  'Linux',
  'Bash',
  'Nmap',
  'OWASP',
  'Docker',
  'AWS',
  'IBM Cloud',
]

// The previous About.tsx carried three paragraphs; every claim below traces
// to one of them. Dropped, not reworded: the AI Club mention only (now its
// own Experience entry). "Leading workshops for other students" is a
// distinct claim from a different sentence in the original prose (an
// organizational role vs. a teaching activity) and is kept.
const ABOUT_PARAGRAPH =
  "I've always been curious about how technology powers the world, and that curiosity pulled " +
  "me into tech. I went from small coding projects to building full AI pipelines, interactive " +
  'web apps, and leading workshops for other students. I learn by doing, whether it was ' +
  'training a bird classifier on thousands of rainforest images or building a responsive ' +
  'portfolio site, and each project has pushed me to take on bigger challenges. What excites ' +
  'me most now is using AI/ML and software development to solve real problems. I like ' +
  'collaborating with others, sharing ideas, and staying open to learning something new.'

// About: one condensed paragraph (was three), skills as font-mono tags
// matching ProjectCard's stack-tag treatment, and education pulled from
// site.ts rather than hardcoded.
export function About() {
  const { ref, revealed } = useScrollReveal<HTMLElement>()

  return (
    <section
      id="about"
      ref={ref}
      className={cn('reveal border-t border-border py-16 md:py-24', !revealed && 'reveal-hidden')}
    >
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <h2 className="font-heading text-3xl font-semibold text-foreground">About</h2>

        <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-[3fr_2fr]">
          <p className="max-w-2xl text-base text-foreground">{ABOUT_PARAGRAPH}</p>

          <div className="space-y-6">
            <div>
              <h3 className="font-heading text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Skills
              </h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {SKILLS.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-heading text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Education
              </h3>
              <p className="mt-3 text-sm text-foreground">
                {site.education.degree}, {site.education.institution}
              </p>
              <p className="font-mono text-xs text-muted-foreground">{site.education.status}</p>
            </div>

            {/* Certifications live here rather than in their own section.
                They are supporting credentials, not headline proof, and a
                full section for them sat between About and the contact CTA
                where it competed with the call to action. */}
            <div>
              <h3 className="font-heading text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Certifications
              </h3>
              <ul className="mt-3 space-y-3">
                {certifications.map((cert) => (
                  <li key={cert.id} className="flex items-start gap-3">
                    <div className="flex-none rounded-md bg-card p-1 shadow-sm">
                      <img
                        src={cert.badge}
                        alt=""
                        width={28}
                        height={28}
                        loading="lazy"
                        className="size-7 object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm leading-snug text-foreground">{cert.title}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {cert.issuer} · {cert.year} ·{' '}
                        <a
                          href={cert.verify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent underline-offset-2 hover:underline"
                        >
                          Verify
                        </a>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
