// Fails when the gzipped JS in dist/assets exceeds the budget.
import { readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

// The audit's 100 KB target assumed Motion was the bulk. Measured on 2026-10-06,
// react-dom alone is ~55 KB gzip and the total with LazyMotion is ~126 KB
// (129,107 B), so this budget guards against regressions at the current size.
// Reaching 100 KB means replacing Motion with CSS/IntersectionObserver, which
// is an owner decision.
// 2026-10-08 (pass 5): measured 132,487 B = index 118,718 + MobileSheet 12,675 +
// ThemeMenuContent 1,094. origin/main before pass 5 was 132,233 B (118,426 +
// 12,674 + 1,133), so the pass added 254 B. The total is still under the budget,
// so it stays: measured + 2 KB would be 134,535 B, which would raise it with no
// measured reason. tailwind-merge (about 8.8 KB gzip) cannot be dropped: the
// Button variants rely on it to resolve their own conflicts.
// 2026-11-12: one visit loads at most one case study chunk, so the total counts
// only the largest of them, plus every other chunk. The budget is unchanged.
const BUDGET = 133120 // 130 KB
const dir = 'dist/assets'
const slugs = readdirSync('src/content/case-studies').map((f) => f.replace(/\.[^.]+$/, ''))
// Vite names a chunk <name>-<8-character hash>.js.
const isStudy = (f) => slugs.some((s) => f.startsWith(`${s}-`) && /^[\w-]{8}\.js$/.test(f.slice(s.length + 1)))
let total = 0
const studies = []
for (const f of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
  const size = gzipSync(readFileSync(`${dir}/${f}`)).length
  console.log(`${f}: ${size} B gzip`)
  if (isStudy(f)) studies.push({ f, size })
  else total += size
}
const largest = studies.reduce((a, b) => (b.size > a.size ? b : a), { f: 'none', size: 0 })
total += largest.size
console.log(`case study chunks: ${studies.map((s) => s.f).join(', ') || 'none'}`)
console.log(`counted case study chunk: ${largest.f} (${largest.size} B gzip)`)
console.log(`total: ${total} B gzip (budget ${BUDGET})`)
if (total > BUDGET) {
  console.error('JS budget exceeded')
  process.exit(1)
}
