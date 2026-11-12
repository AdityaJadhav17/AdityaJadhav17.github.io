// Every claim here comes from the AdityaJadhav17/Stockroom README and code at
// 80dad45 (2026-11-10), its commit authors and merged pull requests, or the
// card in projects.ts. Test counts are counted from tests/ (integration: 90
// [Fact] + 71 [InlineData] + 17 TheoryData rows = 178; browser: 11 [Fact],
// not counting the two Explicit ones). CI jobs are .github/workflows/ci.yml
// (six jobs, integration on two OSes). The audit trail and role checks are in
// Models/Records.cs, Data/AppDbContext.cs, Services/*.cs and Program.cs. Never
// publish the demo account emails or passwords.
import type { CaseStudy } from '../case-study'

const study: CaseStudy = {
  slug: 'stockroom',
  title: 'Stockroom: Purchase Approvals with an Audit Trail',
  description:
    'Stockroom is a C# and ASP.NET Core app for shared makerspace supplies: a manager approves each purchase, and every change records who made it, when and why.',
  facts: {
    result: '178 integration and 11 browser tests gate seven CI jobs',
    role: 'Everything: design, code, tests, CI',
    team: 'Solo',
  },
  dateCreated: '2026-10',
  keywords: [
    'Stockroom',
    'audit trail',
    'inventory management',
    'purchase approval workflow',
    'role-based access control',
    'C#',
    'ASP.NET Core Razor Pages',
    'ASP.NET Core Identity',
    'Entity Framework Core',
    'SQLite',
    'xUnit',
    'Playwright',
    'GitHub Actions',
  ],
  ogImage: {
    src: '/og/stockroom.png',
    alt: 'Dark card with an AJ monogram, the title "Stockroom." and the line "178 integration and 11 browser tests gate seven CI jobs". Below it: Aditya Jadhav and adityajadhav.dev.',
  },
  sections: [
    {
      heading: 'The problem',
      body: [
        {
          p: 'A makerspace runs on shared supplies: filament, resin, plywood, solder. When the stock count and the purchase approvals live in a spreadsheet, anyone with edit access can change a number, and nobody can work out later who approved an order, when it arrived, or why the count went down.',
        },
        {
          p: 'Stockroom handles that for a fictional campus makerspace. Members browse inventory and request purchases. A manager approves or rejects each request, records the delivery, hands out stock, and reads a history of every change. It runs locally with synthetic data and is not deployed anywhere.',
        },
      ],
    },
    {
      heading: 'What I built',
      body: [
        {
          p: 'I built Stockroom on my own between 3 October and 10 November 2026. All 50 human commits and every merged pull request are mine; the rest are Dependabot version bumps.',
        },
        {
          p: 'It is one ASP.NET Core Razor Pages application in C#, with Entity Framework Core over SQLite and ASP.NET Core Identity for member and manager accounts. I worked in milestones, each with a written decision record: sign-in and the schema, the purchase workflow, stock issues and history, a demo dataset with a reset command, a security audit and its fixes, interface work for phones and dark mode, and release documentation.',
        },
      ],
    },
    {
      heading: 'How it works',
      body: [
        {
          p: 'The history is two tables. A request event records each step of a purchase request (created, approved, rejected or received) with the user who did it, the UTC time, and a note; a rejection must give a reason. A stock movement records each change to an item\'s count (opening stock, a receipt or an issue) with the signed quantity, the user, the UTC time and a reason, which every issue must have. Opening stock is a movement too, so an item\'s count can be checked against its movements.',
        },
        {
          p: 'Every change commits in one transaction with its history row. Approving is a single conditional UPDATE that matches only a request still marked Pending and sets the reviewer and time in the same statement. If two managers act at once, one update matches; the other changes nothing and reports the request\'s current state. Receiving works the same way from Approved, adds the quantity to stock, and writes a receipt movement and a received event. Issuing stock is an UPDATE whose WHERE clause requires enough stock, so two issues at once cannot oversell. If any step fails, the transaction rolls back, and neither the change nor its record is saved.',
        },
        {
          p: 'The database adds its own checks. A unique index allows one receipt movement per request, and a check constraint rejects a receipt with no request, which would slip past that index. Other constraints keep stock at zero or above and reject a zero quantity change. Foreign keys restrict deletes, so a user, item or request that has history cannot be removed from under it.',
        },
        {
          p: 'Nothing in the application can edit the history. No page or service updates or deletes a request event or a stock movement, and the history pages only read. Managers see everything; a member sees only the events on their own requests.',
        },
        {
          p: 'Stockroom checks authorization twice. Every page needs a sign-in except login and the error page, manager actions sit on pages restricted to the Manager role, and the request form admits a Member who is not also a Manager, so a manager cannot raise a purchase request. Then each service looks up the user\'s roles in the database before it writes, and the queries that decide what a member may see read the Manager role inside the same SQL statement. The user comes from the signed-in session, never from a form field. A refused action changes nothing, shows a generic message, and the server logs it as a security event. The session is checked against the account on every request, so a role change applies on the next one, and logging out ends every session for the account, including a copied cookie.',
        },
      ],
    },
    {
      heading: 'Results',
      body: [
        {
          p: 'The repository holds 178 xUnit integration cases against SQLite, covering business rules, authorization, request ownership, transactions, races, rollback, sessions, security-event logging, seeding and reset. Eleven Playwright cases drive Chromium through purchase, rejection, withdrawal, access, a restart, phone layout and keyboard focus.',
        },
        {
          p: 'GitHub Actions runs seven jobs: repository checks, a dependency audit, a Release build with warnings treated as errors, the integration tests on Ubuntu and on Windows, the browser tests, and a final CI Status job that fails unless every other job passed. CodeQL also scans the repository through GitHub\'s default setup.',
        },
      ],
    },
    {
      heading: 'What it gets wrong',
      body: [
        {
          p: "Only the code keeps the history append-only. The database has no triggers or permissions to enforce it, so anyone who can open the SQLite file can edit or delete rows, and protecting that file is the host account's job. The demo reset command deletes the whole database, history included.",
        },
        {
          ul: [
            'It is built for a local demonstration, with no hosting configuration or HTTPS redirection.',
            'History and request lists have no paging.',
            'One client can lock an account after about 100 seconds of failed logins, and clients behind one address share the login limit.',
            'There are no stock corrections, cancellations, partial receipts or multi-item orders, and no way to sign up or recover an account from the app.',
          ],
        },
      ],
    },
    {
      heading: 'Stack',
      body: [
        {
          ul: [
            'C# on .NET 10, ASP.NET Core Razor Pages',
            'ASP.NET Core Identity for accounts and roles',
            'Entity Framework Core over SQLite',
            'xUnit integration tests and Playwright for .NET in Chromium',
            'GitHub Actions, CodeQL and Dependabot',
          ],
        },
      ],
    },
  ],
}

export default study
