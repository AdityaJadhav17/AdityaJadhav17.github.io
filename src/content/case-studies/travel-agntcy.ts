// Every claim here comes from the Travel-Agntcy README as of 2026-11-11, its
// commits and merged pull requests by author, its code (the hackathon state is
// commit 0b083d8), the TravelAGNTCY card in projects.ts, or the "From Aditya"
// and "Decided by Aditya" notes in the round 2 plan (the message change and the
// hand-timed ~40% figure). The before state of the messages is not in the history.
import type { CaseStudy } from '../case-study'

const study: CaseStudy = {
  slug: 'travel-agntcy',
  title: 'TravelAGNTCY: Multi-Agent AI Travel Planner',
  description:
    "TravelAGNTCY plans trips with a LangGraph supervisor and flight, hotel and activity agents over NATS. Won Cisco's AGNTCY track at SANDHacks 2026.",
  facts: {
    result: 'About 40% faster responses after a message redesign',
    role: 'Agent message design, then CI and conversation memory',
    team: '3 people',
  },
  highlights: [
    "Won Cisco's AGNTCY track at SANDHacks 2026 with a team of three.",
    "Cut response time by about 40%, timed at the event, by redesigning the messages between the supervisor and its agents.",
    "Kept building after the hackathon: a Docker CI pipeline with Chromium and Firefox end-to-end tests, and conversation memory that survives restarts.",
  ],
  dateCreated: '2026-01',
  published: '2026-11-12',
  updated: '2026-11-13',
  keywords: [
    'TravelAGNTCY',
    'SANDHacks 2026',
    'Cisco AGNTCY',
    'multi-agent system',
    'A2A protocol',
    'NATS',
    'LangGraph supervisor',
    'LiteLLM',
    'GPT-4o',
    'SerpAPI',
    'FastAPI',
    'AI travel planner',
  ],
  ogImage: {
    src: '/og/travel-agntcy.png',
    alt: 'Dark card with an AJ monogram, the title "TravelAGNTCY." and the line "Won Cisco\'s AGNTCY track at SANDHacks 2026". Below it: Aditya Jadhav and adityajadhav.dev.',
  },
  sections: [
    {
      heading: 'The problem',
      body: [
        {
          p: 'Planning a trip means three searches, for flights, hotels and things to do, and then fitting the answers together by hand: you check that the flight lands in time to check in, and you add up each flight and hotel pair to find the cheapest. TravelAGNTCY takes one request in plain English, such as a week from LAX to Tokyo, and returns a plan.',
        },
        {
          p: "We built it at SANDHacks 2026 for Cisco's AGNTCY track. We started from CoffeeAGNTCY, the AGNTCY project's sample multi-agent app, and replaced its coffee farm and logistics agents with travel agents.",
        },
      ],
    },
    {
      heading: 'What I built',
      body: [
        {
          p: 'Three of us built it at the event: Jingi, Waleed and me. My part was the format of the messages between the supervisor and the agents. In our first version a request did not arrive in the fields the agents read, so the supervisor model had to guess what the user meant. I restructured the messages and added the fields that were missing.',
        },
        {
          p: 'Now the supervisor first fills a fixed schema using the model\'s structured output: search type, airport codes, city names, dates, a one-way flag and a note of anything missing. Each agent then gets a short message of named fields, such as origin, destination, outbound and return for flights, or location, check_in and check_out for hotels, and reads those. Once the supervisor stopped guessing, answers came back about 40% faster by our timing at the event.',
        },
        {
          p: 'Jingi built the first set of trip planner agents and renamed the interface for travel, and Waleed worked on the shared model configuration.',
        },
        {
          p: 'From September to November 2026 I kept working on it alone:',
        },
        {
          ul: [
            'Added a Docker-based CI pipeline that runs lint, type checks, dependency audits, unit tests, Chromium and Firefox end-to-end journeys and production image builds.',
            'Added conversation memory: each chat keeps its messages and trip details in SQLite across restarts, so a follow-up does not have to restate the trip.',
            'Added budgets in US dollars and traveler counts that carry across follow-ups and filter the results.',
            'Added explicit chat lifecycles that recover interrupted streams, passing 162 Python regression tests and 114 Playwright cases.',
          ],
        },
      ],
    },
    {
      heading: 'How it works',
      body: [
        {
          p: 'The React interface sends each message to a FastAPI travel supervisor. The supervisor is a LangGraph graph that classifies the request, extracts its parameters, runs the searches and checks the result before it answers. Its language model is set by one variable and called through LiteLLM. At the hackathon it ran on OpenAI\'s GPT-4o.',
        },
        {
          p: "The supervisor reaches three agents with AGNTCY's A2A messages over NATS. The flight agent queries Google Flights, the hotel agent Google Hotels and the activity agent Google Local, all through SerpAPI. Each agent is a small LangGraph workflow of its own and returns JSON.",
        },
        {
          p: 'For a full trip the supervisor pairs flights with hotels and keeps the cheapest pair where the traveler lands with a set gap before hotel check-in. It drops hotels rated under 3.7 overall or under 4.0 for location. The answer is markdown, which the interface turns into travel cards. Everything runs in Docker Compose. Grafana and ClickHouse tracing came with the CoffeeAGNTCY base and are off by default.',
        },
      ],
    },
    {
      heading: 'Results',
      body: [
        {
          p: "TravelAGNTCY won Cisco's AGNTCY track at SANDHacks 2026. We timed requests at the event before and after the message change, and responses came back about 40% faster.",
        },
      ],
    },
    {
      heading: 'Limits and next steps',
      body: [
        {
          ul: [
            'The agent messages are plain text fields that each agent splits on spaces, so the supervisor rewrites the spaces in a city name as underscores for the activity agent. A typed data part in the A2A message would be safer.',
            'There are no accounts. The API has no user authentication, so the stack is meant to run privately, and conversation memory is for one local user.',
            'Prices are search quotes, not bookings. To limit API use, only the three cheapest outbound flights get return details.',
            "The repository still carries CoffeeAGNTCY's coffee and logistics tests, which need agents that are no longer there.",
            'The 40% comes from timing at the event, not from a recorded benchmark. A repeatable latency test is the next step.',
          ],
        },
      ],
    },
    {
      heading: 'Stack',
      body: [
        {
          ul: [
            'Python, FastAPI and LangGraph',
            'LangChain with LiteLLM; OpenAI GPT-4o in the hackathon configuration',
            "AGNTCY's A2A protocol over NATS",
            'SerpAPI for Google Flights, Google Hotels and Google Local',
            'React, TypeScript and Vite',
            'SQLite for conversation memory',
            'Docker Compose and GitHub Actions',
          ],
        },
      ],
    },
  ],
}

export default study
