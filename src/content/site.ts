// Site-wide identity content: name, current roles, contact, and education.
// Sourced from task-7-content.md — do not add claims not present there.

export type SocialLink = {
  label: string
  url: string
}

export type Education = {
  degree: string
  institution: string
  status: string
}

export type Site = {
  name: string
  roles: string[]
  tagline: string
  location: string
  email: string
  social: SocialLink[]
  resumePath: string
  education: Education
}

export const site: Site = {
  name: 'Aditya Jadhav',
  roles: [
    'Software Engineering Intern @ Lumulus Technologies',
    'IT Security Programmer @ UC San Diego',
  ],
  tagline: 'Software Engineering Intern @ Lumulus Technologies · IT Security Programmer @ UC San Diego',
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
