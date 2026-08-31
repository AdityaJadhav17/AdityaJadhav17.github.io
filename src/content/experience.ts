// Work/leadership experience, newest first. Sourced from task-7-content.md.
//
// The Lumulus Technologies entry is governed by a signed NDA: the company
// name and job title are cleared, the technical substance is not. Only the
// highlights explicitly permitted in task-7-content.md are used, in
// approximately their given wording. Do not add detail beyond that list.

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
    organization: 'Lumulus Technologies',
    role: 'Software Engineering Intern',
    start: 'Jun 2026',
    end: 'Sep 2026',
    highlights: [
      'Built a Windows desktop application in Python/Qt for configuring and validating USB-connected hardware devices',
      'Implemented read/write and data-integrity logic against published industry specifications',
      'Extended an existing internal software platform; contributed testing, validation, and documentation',
    ],
  },
  {
    organization: 'UC San Diego (ITS)',
    role: 'IT Security Programmer',
    start: 'Dec 2025',
    end: 'Jun 2027 (expected)',
    location: 'Hybrid — Torrey Pines Center South',
    // Scope-derived from the role description, since concrete accomplishment
    // detail is not yet available. Replace with real accomplishments once
    // the owner updates his résumé.
    highlights: [
      'Build web services and application components for enterprise information security projects',
      'Analyze legacy and modern enterprise data; write queries and matching algorithms',
      'Create test cases and documentation',
    ],
  },
  {
    organization: 'NutrifitWorld',
    role: 'Web Development Intern',
    start: 'Jun 2025',
    end: 'Oct 2025',
    highlights: ['Contributed to web development work for the NutrifitWorld platform.'],
  },
  {
    organization: 'Irvine Valley College',
    role: 'Founder & President, AI Club',
    start: 'Aug 2024',
    end: 'May 2025',
    highlights: ['Founded and led the Irvine Valley College AI Club as President.'],
  },
]
