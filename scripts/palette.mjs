// Writes public/favicon.svg and public/404.html from scripts/templates/ using
// the colours in src/styles/theme.css. Run by predev and prebuild; the outputs
// are gitignored.
import { readFileSync, writeFileSync } from 'node:fs'
import { fill, readTokens } from './tokens.mjs'

const tokens = readTokens()
for (const f of ['favicon.svg', '404.html']) {
  writeFileSync(`public/${f}`, fill(readFileSync(`scripts/templates/${f}`, 'utf8'), tokens))
}
console.log('palette: public/favicon.svg, public/404.html written')
