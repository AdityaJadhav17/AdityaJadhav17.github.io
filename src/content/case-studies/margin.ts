// Every claim here comes from the AdityaJadhav17/Margin README and code at
// 698fe49 (2026-11-10), its commit authors and merged pull requests, or the
// card in projects.ts. The note lock is src/domain/lock.ts (PBKDF2-SHA256,
// 600,000 iterations, 16-byte salt, AES-GCM 256 with a 12-byte IV per seal),
// src/domain/types.ts (Lock, Sealed) and src/components/NotesView.tsx (key in
// React state, RELOCK_AFTER five minutes, eight-character minimum). Sync is
// src/state/useSync.ts and src/domain/sync.ts; the server is scripts/serve.mjs.
// Test files: 82 Playwright specs in e2e/, 55 Vitest files in src/ and
// scripts/. "In daily use since September 2026" is Aditya's own account.
import type { CaseStudy } from '../case-study'

const study: CaseStudy = {
  slug: 'margin',
  title: 'Margin: A Local-First Personal Tracker',
  description:
    'Margin is a React tracker for deadlines, notes, goals and courses that keeps its data in the browser, with notes locked by AES-GCM under a passcode.',
  facts: {
    result: 'Nine views on two runtime dependencies, React and React DOM',
    role: 'Everything: design, code, tests, CI',
    team: 'Solo',
  },
  dateCreated: '2026-09',
  published: '2026-11-12',
  keywords: [
    'Margin',
    'local-first app',
    'personal tracker',
    'deadline tracker',
    'localStorage',
    'Web Crypto API',
    'AES-GCM',
    'PBKDF2',
    'iCalendar export',
    'React',
    'TypeScript',
    'Vite',
    'Vitest',
    'Playwright',
  ],
  ogImage: {
    src: '/og/margin.png',
    alt: 'Dark card with an AJ monogram, the title "Margin." and the line "Nine views on two runtime dependencies, React and React DOM". Below it: Aditya Jadhav and adityajadhav.dev.',
  },
  sections: [
    {
      heading: 'The problem',
      body: [
        {
          p: 'A student term has deadlines, courses, notes and goals, and keeping them usually means four apps, or one that wants an account and keeps your data on its servers. I wanted one app that opens with no sign-in, works offline, and keeps my data on my own machines.',
        },
        {
          p: 'Margin has no public deployment. It runs in the browser on my laptop, served by a small Node server bound to the laptop, and on my iPhone over Tailscale, a private network of my own devices. I have used it daily since September 2026.',
        },
      ],
    },
    {
      heading: 'What I built',
      body: [
        {
          p: 'I built Margin on my own, starting on 15 September 2026. All 131 human commits and every merged pull request are mine; the rest are Dependabot updates. The repository started as Personal Tracker and was later renamed.',
        },
        {
          p: 'It is React 18 and TypeScript on Vite, with nine views: Home, Calendar, Goals, Courses, Reflections, Notes, Routine, Trends and Data. The only runtime dependencies are React and React DOM. There is no router (the open view is one piece of state), no state library, no date library and no chart library. The trend charts and icons are inline SVG, and the US holidays on the calendar are worked out from their rules, so nothing is fetched.',
        },
      ],
    },
    {
      heading: 'How it works',
      body: [
        {
          p: "All of the data sits in the browser's localStorage under one key. The page's content security policy limits scripts and requests to its own origin, and a Playwright test drives the busiest flows and fails on any request to another origin. Dates are stored as fixed moments, so a deadline set for 5pm still reads 5pm after a daylight saving change.",
        },
        {
          p: 'A repeating deadline creates its successor only when you finish the current one, so a repeat you ignore stops repeating. Deleting a deadline, a step, a note or a routine line happens at once and offers Undo; deleting a course or a goal asks first. Export calendar writes an .ics file of open deadlines with reminders set by priority, so the phone\'s own calendar does the reminding.',
        },
        {
          p: 'Locked notes are the only stored data that is encrypted. Setting a passcode, at least eight characters, makes a random 16-byte salt, and the browser\'s Web Crypto API runs PBKDF2 with SHA-256 and 600,000 iterations over the passcode and salt to derive a 256-bit AES-GCM key that cannot be exported. Each time a locked note is saved, its text is sealed under a fresh random 12-byte IV. The salt, the IV and the ciphertext are stored in the same localStorage record as everything else; the passcode and the key are never stored. A known value is sealed under the key too, and a wrong passcode is caught when GCM\'s authentication check fails on it.',
        },
        {
          p: 'While a note is unlocked, the key lives only in the page\'s memory. It is dropped when you leave Notes or after five minutes without typing. Changing the passcode decrypts every locked note in memory, seals each under a new key, and writes them all at once, so no note is left under the old one.',
        },
        {
          p: 'Sync goes only to the laptop that serves the app. Each device keeps its own copy, sends it to the laptop a few seconds after an edit and once a minute, and the two are merged record by record, the newer change winning. The server answers only localhost or its own Tailscale name, so any other host name gets a 403.',
        },
      ],
    },
    {
      heading: 'Results',
      body: [
        {
          p: 'The repository holds 55 Vitest files of unit and component tests, written with React Testing Library, and 82 Playwright spec files run in Chromium, including axe scans for WCAG 2.2 AA in both colour schemes. GitHub Actions runs typecheck, lint, a format check, the unit tests, the end-to-end tests and the build on every pull request and every push to main. An updater on the laptop deploys a commit from main only after that CI run has passed.',
        },
      ],
    },
    {
      heading: 'What it gets wrong',
      body: [
        {
          p: "The lock protects a note's body and nothing else. Its first line stays readable as the title, and every other record, deadlines included, is plain text in localStorage, readable by anyone at the unlocked laptop and by any browser extension. I chose that, judging that full-disk encryption covers the realistic threat, and the repository's decision log records why.",
        },
        {
          ul: [
            'Anyone with a copy of the data can guess passcodes offline. The 600,000 iterations make each guess cost about a tenth of a second, which slows a short passcode down without making it safe.',
            'While a note is open, its text and key are in page memory, where a malicious extension could read them.',
            'A backup or export taken before a note was locked still holds that note in plain text.',
            'A forgotten passcode cannot be recovered, and the locked notes are lost with it.',
            'Sync keeps the newer change per record, so an edit made to the same record on both devices loses one of the two.',
            'Clearing site data deletes everything not backed up, automatic backups to a folder work only in Edge and Chrome, and there are no push notifications.',
          ],
        },
      ],
    },
    {
      heading: 'Stack',
      body: [
        {
          ul: [
            'React 18 and TypeScript on Vite',
            'Web Crypto API (PBKDF2, AES-GCM) for locked notes',
            'localStorage, plus IndexedDB for the backup folder handle',
            'A small Node server on the laptop, reached over Tailscale',
            'Vitest, React Testing Library, Playwright and axe-core',
            'GitHub Actions, CodeQL and Dependabot',
          ],
        },
      ],
    },
  ],
}

export default study
