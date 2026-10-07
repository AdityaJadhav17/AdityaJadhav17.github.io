// Fails when the gzipped JS in dist/assets exceeds the budget.
import { readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const BUDGET = 102400 // 100 KB
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
