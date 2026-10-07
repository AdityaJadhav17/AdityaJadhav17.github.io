// Local only (network flake would make CI noisy): run at each phase gate.
// GETs every https URL in src/content/*.ts. LinkedIn answers bots with 999,
// which is reported as skipped, not failed.
import { readdirSync, readFileSync } from 'node:fs'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const dir = 'src/content'
const urls = new Set()
for (const f of readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))) {
  for (const u of readFileSync(`${dir}/${f}`, 'utf8').match(/https:\/\/[^\s'"`)<>]+/g) ?? []) urls.add(u)
}

let failed = 0
for (const url of urls) {
  let result
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(10_000) })
    result = res.status === 999 ? 'skipped (bot-blocked)' : res.status < 400 ? 'ok' : 'FAIL'
    result += ` ${res.status}`
  } catch (e) {
    result = `FAIL ${e.name === 'TimeoutError' ? 'timeout' : e.message}`
  }
  if (result.startsWith('FAIL')) failed++
  console.log(`${result}  ${url}`)
}
console.log(`${urls.size} urls, ${failed} failed`)
if (failed) process.exit(1)
