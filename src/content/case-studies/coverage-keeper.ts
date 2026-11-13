// Every number here comes from the coverage-keeper README as of 2026-11-10
// (Evaluation section, prompt v7) and every role from its merged pull
// requests by author. The award wording is fixed by the design spec.
import type { CaseStudy } from '../case-study'

const study: CaseStudy = {
  slug: 'coverage-keeper',
  title: 'Coverage Keeper: AI Medicaid Letter Reader',
  description:
    'Coverage Keeper reads a photo of a Medicaid letter and finds the deadline. Winner of the AI in Healthcare track at the Solix AI Hackathon 2026.',
  facts: {
    result: 'Deadline right on 24 of 24 test letters',
    role: 'UI, state rules, Spanish, eval scoring, security fixes',
    team: '3 people',
  },
  dateCreated: '2026-10',
  published: '2026-11-11',
  keywords: [
    'Coverage Keeper',
    'Medicaid letter',
    'Solix AI Hackathon 2026',
    'AI in Healthcare',
    'Claude vision model',
    'structured output',
    'zod schema validation',
    'output guardrails',
    'prompt injection',
    'LLM evaluation',
    'Next.js',
  ],
  ogImage: {
    src: '/og/coverage-keeper.png',
    alt: 'Dark card with an AJ monogram, the title "Coverage Keeper." and the line "Winner, AI in Healthcare track, Solix AI Hackathon 2026". Below it: Aditya Jadhav and adityajadhav.dev.',
  },
  sections: [
    {
      heading: 'The problem',
      body: [
        {
          p: 'When states restarted Medicaid renewals after the pandemic, most people who lost coverage lost it over paperwork. KFF counted 69% of disenrollments as procedural across all states with data, and 66% in the final month of the unwinding.',
        },
        {
          p: "The paperwork is about to grow. The July 2025 federal budget law requires Medicaid enrollees in most states to show 80 hours a month of work, volunteering or school, starting January 1, 2027. If you get a letter asking for proof of those hours and miss its deadline, you can lose your coverage.",
        },
      ],
    },
    {
      heading: 'What I built',
      body: [
        {
          p: 'Three of us built Coverage Keeper for the Solix AI Hackathon 2026, where it won the AI in Healthcare track, and I kept working on it after we submitted. You photograph or upload a Medicaid letter. The app shows a plain-language summary, the deadline with the days left and the line it read the date from, a checklist of documents to send, and a phone number to call.',
        },
        { p: 'My merged work:' },
        {
          ul: [
            'The UI flow from the consent screen to the result, then the mobile polish, dark mode and the laptop and tablet layout.',
            'Rules data for Washington, Oregon, California, Nevada and Arizona, detection of the state that sent the letter (prompt v3), and exemption screening that starts from that state.',
            'English and Spanish: a Spanish interface, Spanish guardrail and rules wording, and letters read in either language (prompt v4).',
            "Prompts v6 and v7, plus the eval work around them: scoring the sending state, adding the Spanish-language and Nevada letters, and fairer scoring of a letter's required action.",
            'The fixes from a November 2026 security audit: a cap on PDF pages, closed guardrail gaps, chunked uploads and security headers.',
          ],
        },
        {
          p: 'Woosik Kim built the letter reader backend and its /api/read route, the first labeled set of sample notices, and reading a whole letter across several photos or a PDF. Waleed Alghaithi built the rate limit on /api/read and the draft note to a doctor.',
        },
      ],
    },
    {
      heading: 'How it works',
      body: [
        {
          p: 'The browser shrinks the photo and posts it to /api/read, which checks its type and size and applies the rate limit. A Claude vision model reads the letter and returns structured output in one fixed shape: notice type, summary, deadline, the quoted deadline line, required action, documents, phone number and confidence. zod validates that shape. If the answer fails validation or the model refuses, you see an "unsure" result instead of a guess.',
        },
        {
          p: 'The schema has no eligibility field, so the model has nowhere to put a verdict. After generation a guardrail checks every string and replaces any sentence like "you are eligible" with a safe fallback and the Oregon Health Plan phone number. The prompt treats letter text as data, which defends against prompt injection planted in a PDF, and adversarial fixtures test that defense. Exemption screening never calls the model: it matches your yes or no answers against the published exemption rules, and the app says those exemptions "may apply".',
        },
        {
          p: 'The app stores nothing. It processes the photo in memory and drops it after the response, and the logs record status, latency, model and error class with no letter content.',
        },
      ],
    },
    {
      heading: 'Results',
      body: [
        {
          p: 'The eval set has 33 labeled letters: public sample notices from state .gov sites, phone photos, full PDFs of the notices longer than one page, Spanish versions, and 4 Nevada letters added after prompt v6. We fixed the split before any run: 9 dev, 24 test. Every metric below except the document scores on full PDFs came out the same on all 3 runs.',
        },
        {
          table: {
            caption: 'Test split, prompt v7, English, mean of 3 runs, from the Coverage Keeper README',
            head: ['Metric', 'Page 1, 11 letters', 'Full PDF, 7 letters', 'Written in Spanish, 2 letters', 'Nevada (new), 4 letters', 'v6 page 1 / full PDF'],
            rows: [
              ['Deadline correct (printed or none)', '11 of 11', '7 of 7', '2 of 2', '4 of 4', '11 of 11 / 6 of 7'],
              ['State identified', '11 of 11', '7 of 7', '2 of 2', '4 of 4', '11 of 11 / 7 of 7'],
              ['Notice type correct', '10 of 11', '6 of 7', '2 of 2', '4 of 4', '10 of 11 / 6 of 7'],
              ['Required action correct', '10 of 11', '6 of 7', '2 of 2', '4 of 4', '10 of 11 / 5.7 of 7'],
              ['Document recall (mean)', '1.00', '0.76 (0.71 to 0.86)', '1.00', '1.00', '1.00 / 0.71'],
              ['Document precision (mean)', '0.77', '0.59 (0.57 to 0.64)', '1.00', '1.00', '0.80 / 0.71'],
              ['Guardrail hits', '0', '0', '0', '0', '0 / 0'],
            ],
          },
        },
        {
          p: 'Prompt v7 fixed the one deadline miss from v6, a letter whose January 1, 2027 move date the model had reported as a deadline. Answering in Spanish over all 24 test letters (1 run), it got 24 of 24 deadlines and 0 guardrail hits.',
        },
      ],
    },
    {
      heading: 'What it gets wrong',
      body: [
        {
          ul: [
            'The set is small and mostly Vermont. Oregon publishes only 3 sample notices online, Washington and California have 1 each in the set, and Arizona has published none.',
            'Document precision on full PDFs dropped to 0.59 from 0.71 under v6. The v7 change touched dates only, so run-to-run variation is the likely cause, but I have not shown that.',
            'Two letters miss their required action on every run, and one Vermont renewal decision gets the wrong notice type in both its page 1 and full PDF versions.',
            "One prompt rule came from a test letter: v7's effective-date rule. The 4 Nevada letters, which no prompt work saw, are the fresh check.",
            'The 3 phone photos show a screen rather than printed paper, and no eval letter arrives as several phone photos.',
          ],
        },
      ],
    },
    {
      heading: 'Stack',
      body: [
        {
          ul: [
            'Next.js 16 (App Router), React 19, TypeScript 6',
            'Claude (claude-opus-5-5) through the Anthropic SDK, with structured output',
            'zod 4 for schema validation',
            'Vitest, fast-check, Playwright and axe-core',
            'GitHub Actions with gitleaks, osv-scanner and Dependabot',
            'Vercel',
          ],
        },
      ],
    },
  ],
}

export default study
