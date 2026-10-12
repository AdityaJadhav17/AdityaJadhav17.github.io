// Certifications. Owner decision: only the AWS credential is listed; the
// IBM SkillsBuild badges were dropped. Do not re-add them.

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
    id: 'aws-ai-practitioner',
    title: 'AWS Certified AI Practitioner',
    issuer: 'Amazon Web Services',
    year: '2026',
    badge: '/badges/aws-ai-practitioner.webp',
    verify: 'https://www.credly.com/badges/e761ec4f-7806-4d0f-b497-303cc5533086/public_url',
  },
]
