// Every claim here comes from the Watchtower-Course-Project README as of
// 2026-11-11, its merged pull requests and commit authors, or the WatchTower
// card in projects.ts. Limits are the constants in src/backend/server.js.
// GitHub logins map to the README's first names by role and commit names.
import type { CaseStudy } from '../case-study'

const study: CaseStudy = {
  slug: 'watchtower',
  title: 'WatchTower: Web Observability SDK and Dashboard',
  description:
    'WatchTower is a web observability tool from UC San Diego CSE 110: a browser SDK, a Node.js ingest API and a Clerk-secured dashboard. I led the team of 11.',
  facts: {
    result: 'Live Render backend and an SDK test app on GitHub Pages',
    role: 'Team and technical lead; CI, auth, data scoping',
    team: '11 people',
  },
  dateCreated: '2026-04',
  published: '2026-11-12',
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
    alt: 'Dark card with an AJ monogram, the title "WatchTower." and the line "Live Render backend and an SDK test app on GitHub Pages". Below it: Aditya Jadhav and adityajadhav.dev.',
  },
  sections: [
    {
      heading: 'The problem',
      body: [
        {
          p: 'A team running a web app in production needs to know which errors users hit, how fast pages load, which routes are slow and what users do. The usual answer is a vendor agent. WatchTower is a lightweight observability platform that gives that view from a small script you add to a page and a backend you run yourself.',
        },
        {
          p: 'It was the Spring 2026 course project of Team 09 in CSE 110 at UC San Diego, and we built it to deploy and run as a real product.',
        },
      ],
    },
    {
      heading: 'What I built',
      body: [
        {
          p: "There were 11 of us. The README lists me as Technical Lead for CI/CD and architecture, and I also ran the team as team lead and Scrum Master. Most of WatchTower's code is my teammates'. These are the parts the merged pull requests show I wrote:",
        },
        {
          ul: [
            'The GitHub Actions CI pipeline, from the first HTML and CSS validators to JavaScript linting, Jest unit tests, Playwright end-to-end tests and JSDoc.',
            "The first end-to-end backend run: the prototype SDK, server and SQLite event store working together, with unit and Playwright tests. It built on Jason's SQLite integration.",
            "The Clerk sign-in across the login, signup and landing pages, and the script that writes the browser's Clerk config from CLERK_PUBLISHABLE_KEY. Waleed researched Clerk and first wired it into prototype 3.",
            "Per-user data: the server verifies each Clerk session JWT against Clerk's public JWKS and scopes every dashboard read to that user, so a new account starts empty and keeps its own data.",
            'The owner mapping that lets the external test app, which has no sign-in, send events that show up on a demo dashboard.',
            'The repository restructure into backend, frontend, SDK and shared folders, with the first two prototypes moved to an archive.',
            'In September and October 2026, after the course, a security review of the deployed app and the fixes it led to.',
          ],
        },
        {
          p: "My teammates built the rest. Hieu merged the two dashboard candidates into prototype 3 and built its developer and manager views, the landing page and the static dashboard demo. James, Alex, Hemendra and Fahad built the candidate dashboards, login pages, landing page work and privacy dialogs. Woosik added Beacon API delivery and fuller Navigation Timing to the SDK, the first unit tests, and a stored XSS fix. Daniel moved those metrics and Supabase storage into prototype 3, sent alert emails to each signed-in user and wrote most of the architecture decision records. Jason built the Postgres storage on Supabase and the analytics history. Waleed wrote the first event schema and API contract, then built the Gmail alerts for error spikes, the timezone setting and the signed-in profile name. Fahad led product and process, and Josh wrote the requirements, user stories and retrospectives.",
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
          p: 'The dashboard signs people in with Clerk, which holds the accounts, so WatchTower keeps no login secrets. For every dashboard request the server reads the user id from a verified Clerk JWT and returns only that user\'s events: an error feed grouped by signature and deploy version, p95 latency per route, active users and session paths. A developer query box takes a small SQL-like query, returns at most 250 rows and is limited to 60 queries per user per minute. In production the server refuses to start unless JWT verification is on.',
        },
        {
          p: 'A separate test app on GitHub Pages embeds the SDK and sends real cross-origin telemetry to the Render backend, allowed by an explicit CORS list.',
        },
      ],
    },
    {
      heading: 'What it gets wrong',
      body: [
        {
          ul: [
            'Ingestion is public. Anyone can post events, and every event from the external test app goes to one demo owner. The fix is a key per monitored app, and it is not built.',
            "My own June code had holes I found in September. The JWT check kept a switch that trusted a user id header, and the ingest path kept the user id from the event itself, so a stranger could put events on someone else's dashboard. An event stream route also sent every event to every connected client. I removed all three and added regression tests.",
            'The server uses the Supabase service-role key, which bypasses row-level security. User scoping lives in application code only.',
            'Email alerts are gone. A Nodemailer advisory was plausibly reachable through a public recipient route, so I removed the Gmail mailer and that route. The README line saying alerting is email-only is out of date.',
            'There is no full Content Security Policy yet, because Clerk and the dashboard load scripts at run time. The dashboard also polls the API rather than receiving a live stream.',
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
