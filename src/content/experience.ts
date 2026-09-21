// Work/leadership experience, newest first by END date, with an ongoing
// role sorting above one that finished later. Start date is the wrong key:
// it buried the current UC San Diego role under a summer internship that
// started later but has already ended. Matches the resume ordering.
//
// The Lumulus Technologies entry is governed by a signed NDA: the company
// name and job title are cleared, the technical substance is not. Only the
// highlights explicitly permitted by the owner are used, in approximately
// their given wording. Do not add detail beyond that list.
//
// The UC San Diego highlights are the owner's own wording, supplied verbatim
// in September 2026, and describe the scope of an ongoing role in present
// tense rather than claiming finished work. Keep them verbatim. Note that the
// SQL and REST lines track the job posting; he flagged some of that as work
// still ahead of him, so do not restate them in the past tense anywhere.

export type Experience = {
  organization: string
  role: string
  start: string
  end: string
  location?: string
  highlights: string[]
}

export const experience: Experience[] = [
  {
    organization: 'UC San Diego (ITS)',
    role: 'IT Security Programmer',
    start: 'Dec 2025',
    end: 'Present',
    highlights: [
      "Support enterprise IT security and data-focused initiatives within UC San Diego's ITS organization",
      'Develop and maintain Python-based scripts and SQL queries to analyze and validate enterprise security data across legacy and modern systems',
      'Contribute to the design, testing, and documentation of REST-based application components for information security projects',
      'Work within defined security scopes and confidentiality requirements while collaborating with engineers and administrators',
    ],
  },
  {
    organization: 'Lumulus Technologies',
    role: 'Software Engineering Intern',
    start: 'Jun 2026',
    end: 'Sep 2026',
    highlights: [
      'Built a Windows desktop application in Python/Qt for configuring and validating USB-connected hardware devices, replacing a legacy internal tool and a paid third-party subscription and cutting a 15 to 20 minute task to under 5 minutes',
      'Implemented read/write and data-integrity logic against published industry specifications as the sole engineer on the project',
      'Extended an existing internal software platform; contributed testing, validation, documentation, CI/CD, and an installer with auto-update that replaced manual downloads',
    ],
  },
  {
    organization: 'NutrifitWorld',
    role: 'Web Development Intern',
    start: 'Jun 2025',
    end: 'Oct 2025',
    highlights: [
      'Delivered and deployed a responsive business platform integrating CRM automation, scheduling, and customer management workflows, increasing client engagement by 25% and reducing manual operations by 40%',
      'Created analytics dashboards and automated marketing pipelines to track user behavior and campaign performance, improving lead conversion rates by 20%',
    ],
  },
  {
    organization: 'Irvine Valley College',
    role: 'Founder & President, AI Club',
    start: 'Aug 2024',
    end: 'Jun 2025',
    highlights: [
      "Founded and expanded IVC's first AI-focused club, growing membership to over 150",
      'Organized 5+ workshops and projects averaging 30 attendees, covering machine learning, computer vision, and NLP',
      'Secured $2,000 in sponsorships to support practical AI projects and interdisciplinary collaborations',
    ],
  },
  {
    organization: 'Irvine Valley College',
    role: 'Board Member, Cybersecurity Club',
    start: 'Aug 2023',
    end: 'Jun 2025',
    highlights: [
      'Held both Outreach Officer and Treasurer roles, onboarding new members and managing the club budget',
      'Led 5+ hands-on workshops on penetration testing and network defense for 30+ members',
      'Mentored 20+ students through ethical hacking labs',
    ],
  },
]
