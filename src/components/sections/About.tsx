import { certifications } from '@/content/certifications'
import { site } from '@/content/site'
import { Reveal } from '@/components/motion/Reveal'

// Skills grouped for scanning. Extended 2026-10-06: each added item comes
// from a project or role already on the page (C# and ASP.NET Core from
// Stockroom, LangGraph and FastAPI from TravelAGNTCY, Supabase from
// WatchTower, Playwright from WatchTower/Stockroom/Personal Tracker, Qt from
// the Lumulus highlight). The owner reviews this list at PR.
const SKILL_GROUPS: { group: string; items: string[] }[] = [
  {
    group: 'Languages',
    items: ['Python', 'C++', 'Java', 'JavaScript', 'TypeScript', 'C#', 'SQL', 'Bash', 'HTML/CSS'],
  },
  {
    group: 'AI and ML',
    items: ['PyTorch', 'TensorFlow', 'NumPy', 'OpenCV', 'YOLOv8', 'LangGraph'],
  },
  {
    group: 'Web, backend and desktop',
    items: ['React', 'Node.js', 'FastAPI', 'ASP.NET Core', 'Supabase', 'Qt'],
  },
  { group: 'Security', items: ['Nmap', 'OWASP'] },
  {
    group: 'Tools and cloud',
    items: ['Git', 'Linux', 'Docker', 'AWS', 'IBM Cloud', 'Playwright'],
  },
]

// Rewritten 2026-10-06 from facts already on the page.
const ABOUT_PARAGRAPH =
  "I'm a computer science student at UC San Diego, graduating in June 2027. I like building a " +
  'system and then hunting for the input that breaks it. On Talk-to-Robot, a CSE 190 team ' +
  'project, we watched end-to-end success fall from 98% to 50% while the controller held up, ' +
  "which put the failures in the language model's grounding. At Lumulus Technologies I was the " +
  'sole engineer on a Windows desktop application that cut a 15 to 20 minute task to under 5 ' +
  "minutes. Before UC San Diego I founded Irvine Valley College's first AI club, which grew " +
  'past 150 members, and led workshops on penetration testing and network defense for its ' +
  'cybersecurity club.'

// About: one condensed paragraph (was three), skills as font-mono tags
// matching ProjectCard's stack-tag treatment, and education pulled from
// site.ts rather than hardcoded.
export function About() {
  return (
    <Reveal as="section" id="about" className="py-16 md:py-20">
      <div className="container-site">
        <Reveal.Item>
          <h2 className="section-title">About</h2>
        </Reveal.Item>

        <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-[3fr_2fr]">
          <div className="space-y-8">
            <Reveal.Item>
              <p className="max-w-2xl text-base text-foreground">{ABOUT_PARAGRAPH}</p>
            </Reveal.Item>

            <Reveal.Item>
              <div className="space-y-4">
                {SKILL_GROUPS.map(({ group, items }) => (
                  <div key={group}>
                    <h3 className="label">{group}</h3>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {items.map((skill) => (
                        <li
                          key={skill}
                          className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal.Item>
          </div>

          <div className="space-y-6">
            <Reveal.Item>
              <div>
                <h3 className="label">
                  Education
                </h3>
                <p className="mt-3 text-sm text-foreground">
                  {site.education.degree}, {site.education.institution}
                </p>
                <p className="font-mono text-xs text-muted-foreground">{site.education.status}</p>
              </div>
            </Reveal.Item>

            {/* Certifications live here rather than in their own section.
                They are supporting credentials, not headline proof, and a
                full section for them sat between About and the contact CTA
                where it competed with the call to action. */}
            <Reveal.Item>
              <div>
                <h3 className="label">
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
                            className="text-accent underline underline-offset-2 hover:decoration-2"
                          >
                            Verify
                          </a>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal.Item>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
