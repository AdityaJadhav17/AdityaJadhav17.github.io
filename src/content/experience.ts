// Work/leadership experience, newest first by start date.
//
// The Lumulus Technologies entry is governed by a signed NDA: the company
// name and job title are cleared, the technical substance is not. Only the
// highlights explicitly permitted by the owner are used, in approximately
// their given wording. Do not add detail beyond that list.
//
// Every other entry is transcribed from the owner's resume. The security
// wording in the UC San Diego entry ("authorized", "under defined scope",
// "responsible disclosure") is his own and is deliberately careful. Keep it
// verbatim: paraphrasing it looser would change what the sentence claims.

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
    end: 'Present',
    highlights: [
      'AI infrastructure penetration testing: conducted authorized security validation on an academic AI compute environment, identifying configuration weaknesses and access control gaps under defined scope',
      'Documented findings and remediation recommendations, supporting secure deployment practices while adhering to confidentiality and responsible disclosure guidelines',
      'Risk and compliance assessment: assessed System Security Plans against NIST SP 800-171 controls, identifying access control and configuration management gaps to support remediation planning',
      'Organized audit evidence and mapped security controls to NIST SP 800-171 requirements, supporting risk assessment and audit readiness',
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
      'Served as Outreach Officer, onboarding new members and connecting them to cybersecurity resources and events',
      'Organized cybersecurity workshops and supported new members with technical guidance',
    ],
  },
]
