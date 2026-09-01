// Project card content. Do not add claims beyond what the owner has
// verified. `result` and `image` are optional: bird-classifier has no
// measured result, and watchtower/talk-to-robot have no screenshot yet.

export type Project = {
  id: string
  title: string
  problem: string
  contribution: string
  stack: string[]
  result?: string
  links: { github?: string; demo?: string; live?: string }
  image?: { src: string; width: number; height: number; alt: string }
  featured: boolean
  context?: string
}

export const projects: Project[] = [
  {
    id: 'watchtower',
    title: 'WatchTower',
    problem:
      'Web teams need lightweight production visibility for JS errors, latency, and user activity without a heavyweight vendor agent.',
    contribution:
      'As Team Leader, Scrum Master, and backend tech lead for UCSD CSE 110 Team 09, directed delivery and system design for a browser SDK, Node.js ingest API, Supabase/Postgres persistence, and a Clerk-authenticated real-time dashboard. Shipped CI with Jest and Playwright, plus a deployed Render backend.',
    stack: ['JavaScript', 'Node.js', 'Supabase', 'Clerk', 'Jest', 'Playwright', 'Render'],
    result: 'Deployable observability platform with live backend and SDK test app.',
    image: {
      src: '/watchtower.webp',
      width: 800,
      height: 410,
      alt: "WatchTower's triage queue showing live captured JavaScript errors with severity, version, and assignment",
    },
    links: {
      github: 'https://github.com/cse110-sp26-group09/Watchtower-Course-Project',
      live: 'https://cse110-sp26-group09.github.io/Watchtower-Course-Project/',
    },
    featured: true,
    context: 'UCSD CSE 110, 11-person team',
  },
  {
    id: 'travel-agntcy',
    title: 'TravelAGNTCY',
    problem:
      'Travel planning spans flights, hotels, and activities, but stitching those sources into a coherent plan is slow and fragmented.',
    contribution:
      'A distributed multi-agent travel planner with a LangGraph supervisor, FastAPI services, and a React/TypeScript UI. Containerized the stack with Docker, used NATS for inter-service messaging, and added Grafana/ClickHouse observability.',
    stack: ['Python', 'FastAPI', 'LangGraph', 'React', 'TypeScript', 'Docker', 'NATS', 'Grafana'],
    result: 'Cut inter-service latency by ~40% with containerized microservices and NATS messaging.',
    links: {
      github: 'https://github.com/AdityaJadhav17/Travel-Agntcy',
      demo: 'https://youtu.be/T0EkJ9J_IQU',
    },
    image: {
      src: '/travel-agntcy.webp',
      width: 1136,
      height: 592,
      alt: 'TravelAGNTCY running: an agent chat panel beside ranked flight options with airline, price, and layover detail',
    },
    featured: true,
    context: 'SANDHacks 2026',
  },
  {
    id: 'talk-to-robot',
    title: 'Talk-to-Robot',
    problem:
      'Natural-language robot commands fail when spatial grounding is mixed with control, making it hard to see where LLM understanding breaks.',
    contribution:
      'Team project (CSE 190) with a decoupled LLM grounder and SAC+HER controller in MuJoCo FetchPush. Evaluated instruction tiers from literal coordinates to functional intent, isolating grounding failures from policy errors.',
    stack: ['Python', 'Gemini', 'MuJoCo', 'Gymnasium', 'Stable-Baselines3 (SAC + HER)'],
    result:
      'End-to-end success near-solved on literal/region tiers (T0 ~98%, T1 ~93%), with a clear cliff on relative and intent-heavy instructions (T2 ~77% LLM, T4 ~45–55%).',
    image: {
      src: '/talk-to-robot.webp',
      width: 1280,
      height: 800,
      alt: 'Grouped bar chart of grounder, policy, and end-to-end success rates across instruction tiers T0 to T3',
    },
    links: {
      github: 'https://github.com/YangLin14/Talk-to-Robot',
    },
    featured: false,
    context: 'UCSD CSE 190, team project',
  },
  {
    id: 'sim2real',
    title: 'Synthetic-to-Real Object Detection',
    problem:
      'Models trained only on synthetic images often fail on real photos; this Kaggle challenge measured that sim-to-real gap directly.',
    contribution:
      'An end-to-end YOLOv8 detection pipeline with training, augmentation and domain-randomization experiments, inference, and Kaggle submission tooling.',
    stack: ['Python', 'PyTorch', 'YOLOv8', 'Albumentations'],
    result: 'Final mAP 0.9175.',
    links: {
      github: 'https://github.com/AdityaJadhav17/Synthetic-to-Real-Object-Detection',
      demo: 'https://www.kaggle.com/competitions/synthetic-2-real-object-detection-challenge',
    },
    image: {
      src: '/sim2real.webp',
      width: 560,
      height: 280,
      alt: 'Synthetic-to-Real Object Detection project visualization',
    },
    featured: false,
    context: 'Kaggle competition',
  },
  {
    id: 'bird-classifier',
    title: 'Bird Classifier in a Forest',
    problem:
      'Identifying bird species from cluttered forest imagery is hard for models trained on clean, centred subjects.',
    contribution:
      'A CNN image classifier built in PyTorch, with data preprocessing, augmentation, training, and evaluation.',
    stack: ['Python', 'PyTorch', 'OpenCV'],
    // No numeric result was supplied for this project. Left absent rather
    // than invented. Do not add one without owner confirmation.
    image: {
      src: '/bird-classifier.webp',
      width: 512,
      height: 288,
      alt: 'A common kingfisher perched on a branch against a blurred green background, one of the test images used to evaluate the classifier',
    },
    links: {
      github: 'https://github.com/AdityaJadhav17/bird-classifier-forest',
    },
    featured: false,
  },
]
