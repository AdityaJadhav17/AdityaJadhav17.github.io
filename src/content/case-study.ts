export type Block =
  | { p: string }
  | { ul: string[] }
  | { table: { caption: string; head: string[]; rows: string[][] } }

export type CaseStudy = {
  slug: string // equals the file name and one Project.slug
  title: string // goes before " | Aditya Jadhav" in <title>
  description: string // meta description
  facts: { result: string; role: string; team: string }
  dateCreated: string // 'YYYY-MM', when the project was built
  published: string // 'YYYY-MM-DD', when this page went live
  updated?: string // 'YYYY-MM-DD', set when the page's content changes
  keywords: string[]
  ogImage: { src: string; alt: string } // '/og/<slug>.png', 1200 x 630
  sections: { heading: string; body: Block[] }[]
}
