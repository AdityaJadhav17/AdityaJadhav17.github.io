import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { readTokens } from '../../scripts/tokens.mjs'

const tokens = readTokens()
const themes = ['light', 'dark'] as const

// WCAG 2.x relative luminance / contrast.
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex).map(lin)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// OKLCH hue in degrees (Ottosson's linear-sRGB -> OKLab matrices).
const hue = (hex: string) => {
  const [r, g, b] = rgb(hex).map(lin)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360
}
const hueDistance = (x: string, y: string) => {
  const d = Math.abs(hue(x) - hue(y))
  return Math.min(d, 360 - d)
}

const SURFACES = ['background', 'card', 'muted']
// [foreground token, background tokens, minimum ratio]
const USAGE: [string, string[], number][] = [
  ['foreground', SURFACES, 4.5],
  ['muted-foreground', SURFACES, 4.5],
  ['accent-ink', SURFACES, 4.5],
  // Error text only ever sits on background or card; #DC2626 on muted is 4.43.
  ['destructive', ['background', 'card'], 4.5],
  ['card-foreground', ['card'], 4.5],
  ['popover-foreground', ['popover'], 4.5],
  ['primary-foreground', ['primary'], 4.5],
  ['secondary-foreground', ['secondary'], 4.5],
  ['accent-foreground', ['accent-ink'], 4.5],
  ['destructive-foreground', ['destructive'], 4.5],
  ['accent-signal', SURFACES, 3],
  // TierChart marks sit on card: bars are muted-foreground, the T4 highlight is accent-signal.
  ['muted-foreground', ['card'], 3],
  ['accent-signal', ['card'], 3],
  ['ring', SURFACES, 3],
  ['input', SURFACES, 3],
]

describe('palette contrast', () => {
  for (const theme of themes) {
    it(`${theme}: every declared pair clears its WCAG minimum`, () => {
      const t = tokens[theme]
      const rows: string[] = []
      for (const [fg, bgs, min] of USAGE) {
        for (const bg of bgs) {
          expect(t[fg], `${theme} ${fg}`).toBeDefined()
          expect(t[bg], `${theme} ${bg}`).toBeDefined()
          const ratio = contrast(t[fg], t[bg])
          rows.push(`${fg} on ${bg} ${ratio.toFixed(2)} (need ${min})`)
          expect(ratio, `${theme}: ${fg} ${t[fg]} on ${bg} ${t[bg]}`).toBeGreaterThanOrEqual(min)
        }
      }
      if (process.env.PALETTE_TABLE) console.log(`${theme}\n${rows.join('\n')}`)
    })

    it(`${theme}: ring equals accent-signal`, () => {
      expect(tokens[theme].ring).toBe(tokens[theme]['accent-signal'])
    })

    it(`${theme}: accent hue stays 20 degrees or more from destructive`, () => {
      const t = tokens[theme]
      expect(hueDistance(t['accent-ink'], t.destructive)).toBeGreaterThanOrEqual(20)
      expect(hueDistance(t['accent-signal'], t.destructive)).toBeGreaterThanOrEqual(20)
    })
  }
})

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  )
const rel = (f: string) => relative(process.cwd(), f).replaceAll('\\', '/')
const isTest = (f: string) => /\.test\.tsx?$/.test(f)
const src = walk(join(process.cwd(), 'src')).filter((f) => !isTest(f))

describe('accent discipline', () => {
  const METRIC_FILES = ['src/components/sections/Hero.tsx', 'src/components/ProjectCard.tsx']

  it('accent-ink classes appear only in the metric components', () => {
    const users = src
      .filter((f) => f.endsWith('.tsx') && /accent-ink/.test(readFileSync(f, 'utf8')))
      .map(rel)
    expect(users.sort()).toEqual(METRIC_FILES.slice().sort())
  })

  it('accent-signal is never a text colour', () => {
    // Signal is for non-text marks (bars, rings, borders); it only clears 3:1.
    const users = src
      .filter((f) => f.endsWith('.tsx') && /text-accent-signal/.test(readFileSync(f, 'utf8')))
      .map(rel)
    expect(users).toEqual([])
  })

  it('no palette hex outside theme.css', () => {
    const hex = /#[0-9a-fA-F]{3,8}\b/
    // favicon.svg and 404.html are generated into public/ from the tokens (gitignored).
    const files = [
      ...src.filter((f) => /\.tsx?$/.test(f)),
      join(process.cwd(), 'index.html'),
      ...walk(join(process.cwd(), 'public')).filter(
        (f) => /\.(svg|html)$/.test(f) && !/[\\/](favicon\.svg|404\.html)$/.test(f),
      ),
    ]
    const offenders = files.filter((f) => hex.test(readFileSync(f, 'utf8'))).map(rel)
    expect(offenders).toEqual([])
  })
})
