// Every claim here comes from the Watchtower-Course-Project README as of
// 2026-11-11, its merged pull requests and commit authors, or the WatchTower
// card in projects.ts. Limits are the constants in src/backend/server.js.
// GitHub logins map to the README's first names by role and commit names.
// The README lists Aditya as Technical Lead for CI/CD and architecture; team
// lead and Scrum Master are his own account. The sources stay in this comment:
// the page states the facts without citing the README or the pull requests.
import type { CaseStudy } from '../case-study'

const study: CaseStudy = {
  slug: 'watchtower',
  title: 'WatchTower: Web Observability SDK and Dashboard',
  description:
    'WatchTower is a web observability tool from UC San Diego CSE 110: a browser SDK, a Node.js ingest API and a Clerk-secured dashboard. I led the team of 11.',
  facts: {
    result: 'Deployed browser SDK, ingest API and live dashboard',
    role: 'Team lead and tech lead: CI, sign-in, data isolation',
    team: '11 people',
  },
  highlights: [
    'Led the team of 11 to a deployed product: a browser SDK, an ingest API and a live dashboard.',
    "Kept each account's data separate by verifying every Clerk session token on the server and scoping every dashboard query to its user.",
    'Found and closed three access-control holes in my own code in a security review after the course, each with a regression test.',
  ],
  dateCreated: '2026-04',
  published: '2026-11-12',
  updated: '2026-11-13',
  keywords: [
    'WatchTower',
    'web observability',
    'JavaScript error tracking',
    'browser SDK',
    'Navigation Timing API',
    'Beacon API',
    'p95 latency',
    'Node.js',
    'Supabase',
    'Postgres',
    'Clerk JWT verification',
    'UC San Diego CSE 110',
  ],
  ogImage: {
    src: '/og/watchtower.png',
    alt: 'Dark card with an AJ monogram, the title "WatchTower." and the line "Deployed browser SDK, ingest API and live dashboard". Below it: Aditya Jadhav and adityajadhav.dev.',
  },
  sections: [
    {
      heading: 'The problem',
      body: [
        {
          p: 'A team running a web app in production needs to know which errors users hit, how fast pages load, which routes are slow and what users do. The usual answer is a vendor agent. WatchTower gives that view from a small script you add to a page and a backend you run yourself.',
        },
        {
          p: 'We were Team 09 in CSE 110 at UC San Diego in spring 2026, and we built it to deploy and run as a real product.',
        },
      ],
    },
    {
      heading: 'What I built',
      body: [
        {
          p: "I led the team of 11 as team lead and Scrum Master, and I was the technical lead for CI/CD and architecture. My own code is the test pipeline, the sign-in, and the rule that each account sees only its own data.",
        },
        {
          ul: [
            'Built the GitHub Actions CI pipeline and grew it from HTML and CSS validators to JavaScript linting, Jest unit tests, Playwright end-to-end tests and JSDoc.',
            "Got the first full path working, from the SDK through the server to a SQLite event store, with unit and Playwright tests. It built on Jason's SQLite integration.",
            "Added Clerk sign-in across the login, signup and landing pages, building on Waleed's first Clerk integration.",
            "Isolated each account's data: the server verifies every Clerk session token against Clerk's public keys and scopes every dashboard read to that user, so a new account starts empty and sees only its own events.",
            'Restructured the repository into backend, frontend, SDK and shared folders, and archived the first two prototypes.',
            'Reviewed the deployed app for security in September and October 2026, after the course ended, and shipped the fixes.',
          ],
        },
        {
          p: "Ten teammates wrote most of WatchTower's code. Hieu, James, Alex, Hemendra and Fahad built the dashboards, the landing page and the privacy dialogs. Woosik added Beacon delivery and fuller page timing to the SDK. Jason and Daniel built the Postgres storage and the analytics history, and Waleed wrote the event schema and the alerts. Fahad led product and process, and Josh wrote the requirements and retrospectives.",
        },
      ],
    },
    {
      heading: 'How it works',
      body: [
        {
          p: 'A monitored app loads the WatchTower browser SDK, a single file with no dependencies. It captures unhandled JavaScript errors, clicks, custom events, route changes and Navigation Timing data, and sends them to POST /api/events, or through the Beacon API when the page is closing.',
        },
        {
          p: 'The backend is a plain Node.js HTTP server with no framework, hosted on Render. It caps a request body at 1 MiB, a batch at 100 events and one event at 16 KiB, and rejects JSON nested deeper than 64 levels. Events go to Postgres on Supabase, or to memory when no database is configured, which is how tests and local runs work.',
        },
        {
          p: 'The dashboard signs people in with Clerk, which holds the accounts, so WatchTower keeps no login secrets. For every dashboard request the server reads the user id from a verified Clerk JWT and returns only that user\'s events: an error feed grouped by signature and deploy version, p95 latency per route, active users and session paths.',
        },
        {
          p: 'A developer query box takes a small SQL-like query, returns at most 250 rows and allows 60 queries per user per minute. In production the server refuses to start unless JWT verification is on. A separate test app on GitHub Pages embeds the SDK and sends real cross-origin telemetry to the Render backend, allowed by an explicit CORS list.',
        },
      ],
    },
    {
      heading: 'Limits and next steps',
      body: [
        {
          ul: [
            "My September review found three holes in code I wrote in June. A leftover switch trusted a user id header, the ingest path trusted the user id inside an event, and an event stream sent every event to every connected client, so a stranger could put events on someone else's dashboard. I removed all three and added regression tests.",
            "Ingestion is still public: anyone can post events, and the test app's events all go to one demo owner. The next step is a key per monitored app.",
            'User scoping lives in application code. The server uses the Supabase service-role key, which bypasses row-level security, so the database would not stop a scoping bug.',
            'I removed email alerts when a Nodemailer advisory looked reachable through a public route, and they have not come back.',
            'There is no full Content Security Policy yet, because Clerk and the dashboard load scripts at run time. The dashboard also polls the API instead of receiving a live stream.',
          ],
        },
      ],
    },
    {
      heading: 'Stack',
      body: [
        {
          ul: [
            'JavaScript, HTML and CSS with no front-end framework',
            'Node.js HTTP server on Render',
            'Supabase (Postgres) through supabase-js',
            'Clerk for sign-in, with jose verifying session JWTs',
            'Jest and Playwright',
            'GitHub Actions and Dependabot',
            'GitHub Pages for the external test app',
          ],
        },
      ],
    },
  ],
}

export default study
