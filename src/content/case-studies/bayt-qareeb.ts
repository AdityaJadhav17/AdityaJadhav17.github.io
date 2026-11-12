// Every claim here comes from the waleedA13/Bayt-Qareeb README as of 2026-11-12
// (its Team section was rewritten from the history in #30), its merged pull
// requests and commit authors, its code at 162bdf0, the card in projects.ts, or
// the "From Aditya" note in the round 2 plan. The outage: #29 (fef08fa) added
// Listing.photos and Listing.propertyType; the database fix is Aditya's account
// and is not in git. Never publish the README's judge sign-in.
import type { CaseStudy } from '../case-study'

const study: CaseStudy = {
  slug: 'bayt-qareeb',
  title: 'Bayt Qareeb: Student Housing and Roommate Map',
  description:
    'A map-first housing and roommate finder for Muslim college students, open only to .edu students. Won a $200 prize at the MTC x Replit x Manara West Buildathon.',
  facts: {
    result: 'Live, with 80 demo listings near seven California campuses',
    role: 'Database, .edu sign-in, posting rooms, AI search',
    team: '3 people',
  },
  dateCreated: '2026-11',
  keywords: [
    'Bayt Qareeb',
    'Manara West',
    'MTC x Replit x Manara West Buildathon',
    'student housing',
    'roommate finder',
    'Muslim students',
    '.edu verification',
    'Clerk',
    'Supabase Postgres',
    'Prisma',
    'Mapbox',
    'Next.js',
    'Claude structured output',
  ],
  ogImage: {
    src: '/og/bayt-qareeb.png',
    alt: 'Dark card with an AJ monogram, the title "Bayt Qareeb." and the line "Won a $200 prize at the MTC x Replit x Manara West Buildathon". Below it: Aditya Jadhav and adityajadhav.dev.',
  },
  sections: [
    {
      heading: 'The problem',
      body: [
        {
          p: 'Students moving to a new campus, transfer students most of all, look for housing in a city they do not know, often with strangers, through scattered group chats. Muslim students also need details that generic listing sites leave out: whether a house is brothers-only or sisters-only, whether the kitchen is halal, whether the roommates keep a similar routine.',
        },
        {
          p: 'Bayt Qareeb puts those details on a map around seven California campuses: UCLA, USC, UC Riverside, UC San Diego, UC Irvine, UC Davis and Stanford. Only students who sign in with a verified .edu email can see the listings.',
        },
      ],
    },
    {
      heading: 'What I built',
      body: [
        {
          p: 'Three of us built it: Waleed Alghaithi, Abas Mohamed and me. The repository history runs from 2:55 pm to 7:43 pm on 6 November 2026.',
        },
        {
          p: "Waleed built the first version: the Next.js app with the map, the Prisma schema, the listings API, the first .edu sign-up check and the CI pipeline. He then hardened CI (least-privilege permissions, actions pinned to commits, npm audit, gitleaks, CodeQL and Dependabot) and took the map UI through every version, adding photo tours, home types and the logo. Abas's merged pull request updated the map page UI, and he designed the first landing page, which reached the team as a file outside git, so the history does not show it.",
        },
        {
          p: 'My pull requests:',
        },
        {
          ul: [
            'Moved the app from SQLite to Supabase Postgres, with row-level security on the Listing and User tables so Supabase\'s public Data API cannot read them.',
            'Clerk sign-in with a .edu gate: only a user whose verified primary email ends in .edu gets in. Anyone else sees a "Students only" screen and the APIs return 403.',
            'The AI search, which turns a typed sentence into filters.',
            'The 80 seed listings: 60 around the five Southern California campuses, then 20 around UC Davis and Stanford. The map opens on the signed-in student\'s campus.',
            "The public landing page and the sign-in and sign-up pages, reworking Abas's design.",
            'Posting a room: students add, edit and delete their own listings, up to five each.',
            'Mobile fixes for the public pages, including 44 px tap targets and no sticky hover.',
          ],
        },
      ],
    },
    {
      heading: 'How it works',
      body: [
        {
          p: 'Next.js middleware requires a Clerk sign-in for every page except the landing and sign-in pages, and for every API route. Pages and APIs then run the .edu check on the server. Listings live in Supabase Postgres behind Prisma. When a student posts a room, the server checks every field against the same rules the seed data must pass and geocodes the address with Mapbox itself, so coordinates never come from the browser. The owner and contact email come from the signed-in account, and the database query for an edit or delete matches on the owner, so someone else\'s listing returns 404.',
        },
        {
          p: 'The AI search only fills in filters. The search route sends the sentence, such as "sisters private room near UCI under $1,200", to Claude Haiku with a fixed JSON schema of seven optional fields: maximum rent, household, room type, home type, pets, halal kitchen and a place to be near. A validator then drops any unknown key and any bad value, such as a rent outside 0 to 10,000 dollars or a household that is not brothers, sisters or any. The server builds the database query from what is left, with the same logic the filter chips use. The model never sees a listing, never returns one, and cannot write to the database.',
        },
      ],
    },
    {
      heading: 'Results',
      body: [
        {
          p: 'Bayt Qareeb won a $200 prize at the MTC x Replit x Manara West Buildathon, and the app is live. On every push and pull request, CI checks that all 80 seed listings pass the same rules as posted rooms, sit within 5 miles of a campus and use fake @example.edu contacts.',
        },
      ],
    },
    {
      heading: 'What it gets wrong',
      body: [
        {
          p: 'After launch the app went down when a UI change shipped ahead of the database schema. The evening\'s last feature, photo tours and home types, added two columns to the Listing table: photos and propertyType. The schema file changed with the code, and the pull request said the columns had to be added to Supabase. Nothing in the pipeline does that: the build runs next build, and a schema change reaches the database only when someone runs prisma db push by hand. Once the change deployed, Prisma asked the database for two columns it did not have, and the app stopped working. I added the two columns to the database and the app worked again. That fix was to the database, not the code, so it is not in the history. Running the schema step as part of the deploy would stop it happening again, and the project does not do that yet.',
        },
        {
          ul: [
            'Rooms that students post show the full matched address and a satellite view of the block.',
            'The five-listing cap counts and then inserts, so two posts at the same moment could both get through.',
            'Posting only accepts Southern California addresses, although the map also covers UC Davis and Stanford.',
            '"Near UCI" in the AI search is a text match on the address and title, not a distance.',
            'The listing photos are free-license stock images, not the real buildings.',
          ],
        },
      ],
    },
    {
      heading: 'Stack',
      body: [
        {
          ul: [
            'Next.js 14 (App Router), React, TypeScript and Tailwind CSS',
            'Prisma over Supabase Postgres',
            'Clerk for sign-in',
            'Mapbox GL JS for the map and Mapbox geocoding on the server',
            'Anthropic SDK with Claude Haiku for the AI search',
            'GitHub Actions with gitleaks, CodeQL and Dependabot; Vercel for hosting',
          ],
        },
      ],
    },
  ],
}

export default study
