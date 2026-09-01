// Site-wide identity content: name, current roles, contact, and education.
// Do not add claims beyond what the owner has verified.

export type SocialLink = {
  label: string
  url: string
}

export type Education = {
  degree: string
  institution: string
  status: string
}

export type ProofPoint = {
  value: string
  label: string
}

export type Site = {
  name: string
  positioning: string
  discipline: string
  capabilities: string[]
  roles: string[]
  tagline: string
  availability: string
  proof: ProofPoint[]
  location: string
  email: string
  social: SocialLink[]
  resumePath: string
  education: Education
}

export const site: Site = {
  name: 'Aditya Jadhav',

  // The one claim the page is built around. Not a new assertion: it is the
  // thread already running through the work. Talk-to-Robot isolates where
  // LLM grounding breaks, Synthetic-to-Real measures where models fail on
  // real data, WatchTower catches production errors, and the UC San Diego
  // role is authorized penetration testing and control-gap assessment.
  positioning: 'I build AI systems and find where they break.',

  // The framing that sits under the name, the way a studio states its
  // discipline. Narrower than the roles list, broader than any single project.
  discipline: 'AI Systems & Security',

  // What he actually works on, each traceable to a project or a role in this
  // file's siblings. Not aspirational, and not a skills dump: the skills list
  // in About already serves that purpose. Multi-agent traces to TravelAGNTCY,
  // computer vision to Synthetic-to-Real and the bird classifier, evaluation
  // to Talk-to-Robot, observability to WatchTower, and the last two to the
  // UC San Diego role. Do not add a seventh.
  capabilities: [
    'Multi-agent LLM systems',
    'Computer vision pipelines',
    'Model evaluation and failure analysis',
    'Production observability tooling',
    'Penetration testing',
    'Security compliance (NIST SP 800-171)',
  ],

  roles: [
    'Software Engineering Intern @ Lumulus Technologies',
    'IT Security Programmer @ UC San Diego',
  ],
  tagline: 'Software Engineering Intern @ Lumulus Technologies · IT Security Programmer @ UC San Diego',

  // Senior year, so this is new-grad recruiting rather than internships.
  availability: 'Graduating June 2027. Open to new-grad software engineering roles.',

  // Numbers that already appear inside project and experience bullets,
  // surfaced where a recruiter actually reads them. Every one is verifiable
  // from a linked repository or the experience entries below.
  proof: [
    { value: '11', label: 'engineers led on WatchTower' },
    { value: '0.9175', label: 'mAP, sim-to-real detection' },
    { value: '150+', label: 'members in the AI club I founded' },
  ],

  location: 'San Diego, CA',
  email: 'aditya.jadhav7910@gmail.com',
  social: [
    { label: 'GitHub', url: 'https://github.com/AdityaJadhav17' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/aditya-jadhav-06484123a/' },
  ],
  resumePath: '/Aditya_Jadhav_Resume.pdf',
  education: {
    degree: 'B.S. Computer Science',
    institution: 'UC San Diego',
    status: 'Expected June 2027',
  },
}
