// Certifications. Unchanged from the previous site content.

export type Certification = {
  id: string
  title: string
  issuer: string
  year: string
  badge: string
  pdf: string
  verify: string
}

export const certifications: Certification[] = [
  {
    id: 'code-generation-ibm',
    title: 'Code Generation and Optimization Using IBM Granite',
    issuer: 'IBM SkillsBuild',
    year: '2025',
    badge: '/code-generation-ibm.png',
    pdf: '/code-generation-ibm.pdf',
    verify: 'https://www.credly.com/badges/b414adea-8ca1-45f2-adbe-7feb64c95470/public_url',
  },
  {
    id: 'cybersecurity-fundamentals',
    title: 'Cybersecurity Fundamentals',
    issuer: 'IBM SkillsBuild',
    year: '2025',
    badge: '/cybersecurity-fundamentals.png',
    pdf: '/cybersecurity-fundamentals.pdf',
    verify: 'https://www.credly.com/badges/507ef381-fd3b-4fd3-ad51-73a4b833382b/public_url',
  },
  {
    id: 'data-classification-ibm',
    title: 'Data Classification and Summarization Using IBM Granite',
    issuer: 'IBM SkillsBuild',
    year: '2025',
    badge: '/data-classification-ibm.png',
    pdf: '/data-classification-ibm.pdf',
    verify: 'https://www.credly.com/badges/c4c60ccc-efec-4752-8cbf-dee061d4f490/public_url',
  },
]
