// Project card content. Do not add claims beyond what the owner has
// verified. `result` and `image` are optional. `links.paper` is a PDF served from public/, currently
// only on talk-to-robot; it opens in a new tab rather than downloading,
// so a reader can skim it without committing a file to their machine.

export type Project = {
  id: string
  // URL name: /projects/<slug>/. Unlike `id`, it may differ from the anchor id.
  slug: string
  title: string
  // Plain-English one-liner shown directly under the title.
  summary: string
  // One line shown on the collapsed card. `metric` is a substring of it, set in mono.
  outcome: string
  metric?: string
  problem: string
  contribution: string
  stack: string[]
  result?: string
  links: { github?: string; demo?: string; live?: string; paper?: string }
  // `src` is the largest variant and the fallback; `srcSet` lists the cropped
  // WebP widths (480, 640 where the crop is wider, plus the largest the crop supports). width/height are the
  // intrinsic size of `src`. `tone` is the screenshot's own ground: only 'light' ones are dimmed in dark theme.
  image?: {
    src: string
    width: number
    height: number
    alt: string
    srcSet?: string
    // A 4:3 crop of the same capture for phones (below md), where the 16:10 one
    // would shrink its text too far. Only the featured projects have one.
    mobileSrcSet?: string
    tone: 'light' | 'dark'
  }
  // The only chart is the Talk-to-Robot tier chart, drawn from tokens by TierChart instead of an <img>.
  chart?: { alt: string }
  featured: boolean
  context?: string
  // Exact award wording, shown on the project page and in its structured data.
  award?: string
}

export const projects: Project[] = [
  {
    id: 'coverage-keeper',
    slug: 'coverage-keeper',
    title: 'Coverage Keeper',
    summary: 'Photograph a Medicaid letter and see what it asks for, when it is due, and who to call.',
    // Sources: the coverage-keeper README evaluation table (prompt v7, test
    // split, mean of 3 runs): deadline correct 11 + 7 + 2 + 4 = 24 of 24.
    outcome: 'Got the deadline right on 24 of 24 test letters and won the AI in Healthcare track',
    metric: '24 of 24',
    problem:
      'Most people who lost Medicaid when renewals restarted after the pandemic lost it over paperwork, not eligibility: KFF counted 69% of disenrollments as procedural. A missed letter can end coverage.',
    // Roles from the repo's merged pull requests, by author.
    contribution:
      'Built in a team of three for the Solix AI Hackathon 2026, then extended. I built the UI flow, the rules for Washington, Oregon, California, Nevada and Arizona, English and Spanish support, the eval scoring and the security audit fixes. Woosik Kim built the letter reader backend and multi-page reading; Waleed Alghaithi built the rate limiter and the doctor-note draft.',
    stack: ['Next.js', 'TypeScript', 'Claude API', 'zod', 'Vitest', 'Playwright', 'Vercel'],
    result:
      'With prompt v7 the deadline was right on all 24 test letters in each of three runs, including 2 written in Spanish and 4 Nevada letters no prompt work had seen, with zero guardrail hits.',
    links: {
      github: 'https://github.com/AdityaJadhav17/coverage-keeper',
      live: 'https://coverage-keeper.vercel.app',
    },
    // A phone capture (1179 x 1977, the repo's docs/assets/screenshots/light-2-result.png), cropped to the deadline card.
    image: {
      src: '/coverage-keeper-1100.webp',
      srcSet:
        '/coverage-keeper-480.webp 480w, /coverage-keeper-640.webp 640w, /coverage-keeper-960.webp 960w, /coverage-keeper-1100.webp 1100w',
      mobileSrcSet:
        '/coverage-keeper-m-480.webp 480w, /coverage-keeper-m-640.webp 640w, /coverage-keeper-m-780.webp 780w, /coverage-keeper-m-1080.webp 1080w',
      width: 1100,
      height: 688,
      alt: "Coverage Keeper's result screen: the deadline Feb 15, 2027 with 5 days left, above the highlighted line from the letter it was read from",
      tone: 'light',
    },
    featured: true,
    context: 'Team of 3: with Woosik Kim and Waleed Alghaithi',
    award: 'Winner, AI in Healthcare track, Solix AI Hackathon 2026',
  },
  {
    id: 'watchtower',
    slug: 'watchtower',
    title: 'WatchTower',
    summary: 'A lightweight tool that shows web teams the errors, slowdowns and user activity on their live site.',
    outcome: 'Led 11 engineers to a deployed SDK, ingest API and live dashboard',
    metric: '11 engineers',
    problem:
      'Web teams need lightweight production visibility for JS errors, latency, and user activity without a heavyweight vendor agent.',
    contribution:
      'As Team Leader, Scrum Master, and backend tech lead for UCSD CSE 110 Team 09, directed delivery and system design for a browser SDK, Node.js ingest API, Supabase/Postgres persistence, and a Clerk-authenticated real-time dashboard. Shipped CI with Jest and Playwright, plus a deployed Render backend.',
    stack: ['JavaScript', 'Node.js', 'Supabase', 'Clerk', 'Jest', 'Playwright', 'Render'],
    result: 'Deployable observability platform with live backend and SDK test app.',
    image: {
      src: '/watchtower-light-1100.webp',
      srcSet:
        '/watchtower-light-480.webp 480w, /watchtower-light-640.webp 640w, /watchtower-light-680.webp 680w, /watchtower-light-960.webp 960w, /watchtower-light-1100.webp 1100w',
      mobileSrcSet:
        '/watchtower-light-m-480.webp 480w, /watchtower-light-m-640.webp 640w, /watchtower-light-m-780.webp 780w',
      width: 1100,
      height: 688,
      alt: "WatchTower's Production health page, with a percentage score for each of availability, errors, latency, signal and feedback",
      tone: 'light',
    },
    links: {
      github: 'https://github.com/cse110-sp26-group09/Watchtower-Course-Project',
      live: 'https://cse110-sp26-group09.github.io/Watchtower-Course-Project/',
    },
    featured: true,
    // Owner, 2026-10-06: he led 11 engineers. "11-person team" contradicted that, so the team size is not stated.
    context: 'UC San Diego course project (CSE 110)',
  },
  {
    id: 'travel-agntcy',
    slug: 'travel-agntcy',
    title: 'TravelAGNTCY',
    summary: 'A travel planner where separate AI agents for flights, hotels and activities work together on one plan.',
    outcome: "Won Cisco's AGNTCY track at SANDHacks 2026, with ~40% lower inter-service latency",
    metric: '~40%',
    problem:
      'Travel planning spans flights, hotels, and activities, but stitching those sources into a coherent plan is slow and fragmented.',
    contribution:
      "A distributed multi-agent travel planner built on Cisco's open-source AGNTCY framework, with a LangGraph supervisor, FastAPI services, and a React/TypeScript UI. Containerized the stack with Docker, used NATS for inter-service messaging, and added Grafana/ClickHouse observability.",
    stack: ['Python', 'FastAPI', 'LangGraph', 'React', 'TypeScript', 'Docker', 'NATS', 'Grafana'],
    result:
      "Won Cisco's AGNTCY track at SANDHacks 2026. Cut inter-service latency by ~40% with containerized microservices and NATS messaging.",
    links: {
      github: 'https://github.com/AdityaJadhav17/Travel-Agntcy',
      demo: 'https://youtu.be/T0EkJ9J_IQU',
    },
    image: {
      src: '/travel-agntcy-light-1100.webp',
      srcSet:
        '/travel-agntcy-light-480.webp 480w, /travel-agntcy-light-640.webp 640w, /travel-agntcy-light-680.webp 680w, /travel-agntcy-light-960.webp 960w, /travel-agntcy-light-1100.webp 1100w',
      mobileSrcSet:
        '/travel-agntcy-light-m-480.webp 480w, /travel-agntcy-light-m-640.webp 640w, /travel-agntcy-light-m-860.webp 860w, /travel-agntcy-light-m-1080.webp 1080w',
      width: 1100,
      height: 688,
      alt: 'TravelAGNTCY agent graph: a Travel Agent supervisor linked to a NATS transport, which links to a Flight Agent, a Hotel Agent and an Activity Agent',
      tone: 'light',
    },
    featured: true,
    context: 'SANDHacks 2026',
    award: "Won Cisco's AGNTCY track at SANDHacks 2026",
  },
  {
    id: 'talk-to-robot',
    slug: 'talk-to-robot',
    title: 'Talk-to-Robot',
    summary: "Tested where a language model goes wrong when it turns spoken robot commands into target positions, separately from the robot's own controller.",
    outcome: 'End-to-end success falls from 98% to 50% while policy success holds at 93 to 100%',
    metric: '98% to 50%',
    problem:
      'Natural-language robot commands fail when spatial grounding is mixed with control, making it hard to see where LLM understanding breaks.',
    contribution:
      'Team project (CSE 190) with a decoupled LLM grounder and SAC+HER controller in MuJoCo FetchPush-v4. Benchmarked a regex baseline against zero-shot, few-shot and chain-of-thought prompting across five instruction tiers, from literal coordinates to functional intent, then retrained the controller to test which grounding failures were recoverable.',
    stack: ['Python', 'Gemini', 'MuJoCo', 'Gymnasium', 'Stable-Baselines3 (SAC + HER)'],
    // Figures are Table 1 of the CSE 190 paper, the baseline evaluation,
    // few-shot variant. Note T3: the paper scores that tier at an 8cm
    // tolerance rather than the 5cm used for T0-T2, because "next to" has no
    // single correct distance, and it says plainly that under 5cm "every
    // single T3 case fails". The near-zero T3 figure that appears in the
    // post-retraining table is that stricter-threshold artefact, which the
    // paper itself calls misleading. Do not quote it as the headline result.
    result:
      'End-to-end success falls from 98% on literal coordinates to 50% on functional intent, while policy success held between 93 and 100%, which places the failures in grounding rather than control. Each tier fails differently rather than degrading smoothly: relative offsets land goals off the table, where a plain regex beat the LLM 85% to 77%; reference objects are off by a consistent 6 cm bias that controller retraining can absorb; and functional intent is not a coordinate problem at all, since annotators disagreed with each other about as much as the model did.',
    chart: {
      alt: 'Bar chart of end-to-end success by instruction tier: 98.3% on literal coordinates, 93.3% on named regions, 76.7% on relative offsets, 73.3% on reference objects, and 50% on functional intent',
    },
    links: {
      github: 'https://github.com/YangLin14/Talk-to-Robot',
      paper: '/llm-spatial-grounding-paper.pdf',
    },
    featured: true,
    context: 'UC San Diego team project (CSE 190)',
  },
  {
    id: 'bayt-qareeb',
    slug: 'bayt-qareeb',
    title: 'Bayt Qareeb',
    summary: 'A map-first housing and roommate finder for Muslim college students, open only to verified .edu students.',
    outcome: 'Won a $200 prize at the MTC x Replit x Manara West Buildathon',
    metric: '$200',
    problem:
      'Students moving to a new campus find housing through scattered group chats, and Muslim students also need details generic listing sites leave out, such as brothers-only or sisters-only houses and a halal kitchen.',
    // Roles as Aditya set them in the design spec; the repo README's Team
    // section is out of date. Never publish the README's judge sign-in.
    contribution:
      'Team project. I built the backend on Supabase Postgres, the Clerk sign-in that admits only .edu students and the CI/CD pipeline, and reworked the landing page. Waleed Alghaithi built the map UI and Abas Mohamed built the first landing page.',
    stack: ['Next.js', 'TypeScript', 'Supabase', 'Clerk', 'Mapbox', 'Prisma', 'GitHub Actions'],
    result:
      'Won a $200 prize at the MTC x Replit x Manara West Buildathon. Live with 80 seed listings around seven California campuses, each checked in CI to sit within 5 miles of a campus.',
    links: {
      github: 'https://github.com/waleedA13/Bayt-Qareeb',
      live: 'https://manara-west.vercel.app',
      demo: 'https://youtu.be/dgyNZPzzhyE',
    },
    // The repo's docs/screenshots/landing.jpg is 800 x 500, so 800 is the largest width.
    image: {
      src: '/bayt-qareeb-800.webp',
      srcSet: '/bayt-qareeb-480.webp 480w, /bayt-qareeb-640.webp 640w, /bayt-qareeb-800.webp 800w',
      width: 800,
      height: 500,
      alt: "Bayt Qareeb's landing page: the headline A new city should still feel like home, a search for a sisters' room near UCI with a halal kitchen, and a $1,150 private room in Irvine on the map",
      tone: 'light',
    },
    featured: false,
    context: 'Team of 3: with Waleed Alghaithi and Abas Mohamed',
    award: 'Won a $200 prize at the MTC x Replit x Manara West Buildathon',
  },
  {
    id: 'stockroom',
    slug: 'stockroom',
    title: 'Stockroom',
    summary: 'A shared inventory and purchasing app that records who approved what, and when.',
    outcome: '156 integration tests and 11 end-to-end cases gate a seven-job CI pipeline',
    metric: '156',
    problem:
      'Shared inventory and purchase approvals usually live in a spreadsheet, where nobody can reconstruct who approved what, or when.',
    contribution:
      "Built in C# on ASP.NET Core Razor Pages with Entity Framework Core over SQLite. Member and manager roles run through ASP.NET Core Identity, with every permission check resolved against the database rather than trusted from the session, and logout terminating all sessions for an account. Each stock movement carries an audit record with actor, UTC timestamp, quantity change and reason.",
    stack: ['C#', 'ASP.NET Core', 'Entity Framework Core', 'SQLite', 'xUnit', 'Playwright', 'GitHub Actions'],
    result:
      '156 xUnit integration cases covering business rules, authorization, transactions and race conditions, plus 11 Chromium end-to-end cases, gated by a seven-job pipeline running on Ubuntu and Windows with CodeQL scanning.',
    links: {
      github: 'https://github.com/AdityaJadhav17/Stockroom',
    },
    image: {
      src: '/stockroom-920.webp',
      srcSet: '/stockroom-480.webp 480w, /stockroom-640.webp 640w, /stockroom-680.webp 680w, /stockroom-920.webp 920w',
      width: 920,
      height: 575,
      alt: "Stockroom's History page: a read-only log of purchase request events, each with its time, action, request, item, quantity and stock change",
      tone: 'light',
    },
    featured: false,
  },
  {
    id: 'personal-tracker',
    slug: 'margin',
    title: 'Margin',
    summary: 'One app for deadlines, courses, notes and goals that runs entirely in the browser, with no account or server.',
    outcome: 'In daily use since September 2026, with no runtime dependencies beyond React',
    problem:
      'Tracking deadlines, courses, notes and goals usually means either four separate apps or one that wants an account and a server.',
    contribution:
      'A local-first tracker in React 18 and TypeScript on Vite, spanning nine views with all state in localStorage and no network calls after the page loads. Deliberately takes no runtime dependencies beyond React and React DOM, so the routing, state management, date handling and charts are hand-written rather than pulled from four libraries.',
    stack: ['React', 'TypeScript', 'Vite', 'Vitest', 'React Testing Library', 'Playwright'],
    result:
      'In daily use since September 2026. Repeating deadlines create successors only on completion, notes can be encrypted, every destructive action is undoable, and deadlines export to .ics. Covered by Vitest and React Testing Library unit tests and Playwright end-to-end cases that gate deployment.',
    links: {
      github: 'https://github.com/AdityaJadhav17/Margin',
    },
    image: {
      src: '/personal-tracker-840.webp',
      srcSet: '/personal-tracker-480.webp 480w, /personal-tracker-640.webp 640w, /personal-tracker-840.webp 840w',
      width: 840,
      height: 420,
      alt: "Margin's Home view: today's date, one overdue item first, then the coming days with course tags",
      tone: 'light',
    },
    featured: false,
  },
  {
    id: 'sim2real',
    slug: 'synthetic-to-real',
    title: 'Synthetic-to-Real Object Detection',
    summary: 'An object detector trained only on synthetic images, built to work on real photos.',
    outcome: 'Final mAP 0.9175, with 22% better real-world generalization',
    metric: '0.9175',
    problem:
      'Models trained only on synthetic images often fail on real photos; this Kaggle challenge measured that sim-to-real gap directly.',
    contribution:
      'An end-to-end YOLOv8 detection pipeline with training, augmentation and domain-randomization experiments, inference, and Kaggle submission tooling.',
    stack: ['Python', 'PyTorch', 'YOLOv8', 'Albumentations'],
    // 0.9175 is the exact public leaderboard figure. Earlier resume drafts
    // rounded it to 0.92 for convenience; the precise number is used
    // everywhere now so the site and the resumes cannot disagree.
    result:
      'Final mAP 0.9175, with domain adaptation and augmentation improving real-world generalization by 22%.',
    links: {
      github: 'https://github.com/AdityaJadhav17/Synthetic-to-Real-Object-Detection',
      demo: 'https://www.kaggle.com/competitions/synthetic-2-real-object-detection-challenge',
    },
    image: {
      src: '/sim2real-560.webp',
      srcSet: '/sim2real-480.webp 480w, /sim2real-560.webp 560w',
      width: 560,
      height: 280,
      alt: 'Two photos of a Cheerios box side by side, labelled Real and Synthetic, each with a detection box and a 0.99 confidence score',
      tone: 'light',
    },
    featured: false,
    context: 'Kaggle competition',
  },
]
