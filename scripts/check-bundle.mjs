// Fails when the gzipped JS in dist/assets exceeds the budget.
import { readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

// The audit's 100 KB target assumed Motion was the bulk. Measured on 2026-10-06,
// react-dom alone is ~55 KB gzip and the total with LazyMotion is ~126 KB
// (129,107 B), so this budget guards against regressions at the current size.
// Reaching 100 KB means replacing Motion with CSS/IntersectionObserver, which
// is an owner decision.
const BUDGET = 133120 // 130 KB
const dir = 'dist/assets'
let total = 0
for (const f of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
  const size = gzipSync(readFileSync(`${dir}/${f}`)).length
  total += size
  console.log(`${f}: ${size} B gzip`)
}
console.log(`total: ${total} B gzip (budget ${BUDGET})`)
if (total > BUDGET) {
  console.error('JS budget exceeded')
  process.exit(1)
}
