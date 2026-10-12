// Certifications, newest first. Owner decision: only AWS credentials are
// listed; the IBM SkillsBuild badges were dropped. Do not re-add them.

export type Certification = {
  id: string
  title: string
  issuer: string
  year: string
  badge: string
  pdf?: string
  verify: string
}

export const certifications: Certification[] = [
  {
    id: 'aws-cloud-practitioner',
    title: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    year: '2026',
    badge: '/badges/aws-cloud-practitioner.webp',
    verify: 'https://www.credly.com/badges/09d1646f-ca09-46fd-926b-6af8d878fb26/public_url',
  },
  {
    id: 'aws-ai-practitioner',
    title: 'AWS Certified AI Practitioner',
    issuer: 'Amazon Web Services',
    year: '2026',
    badge: '/badges/aws-ai-practitioner.webp',
    verify: 'https://www.credly.com/badges/e761ec4f-7806-4d0f-b497-303cc5533086/public_url',
  },
]
