import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { addBeacon, addCsp, buildCsp, inlineScripts, scriptHash } from '../../scripts/csp.mjs'

const SCRIPT = "\n  (function(){ document.documentElement.dataset.themePref = 'system' })()\n"
const page = (...scripts: string[]) =>
  `<head><meta charset="UTF-8" /><title>x</title>${scripts.join('')}</head>`

describe('csp', () => {
  it('hashes the exact script text as base64 sha256', () => {
    const expected = createHash('sha256').update(SCRIPT).digest('base64')
    expect(scriptHash(SCRIPT)).toBe(`'sha256-${expected}'`)
  })

  it('hashes CRLF text as the browser sees it (LF)', () => {
    expect(scriptHash('a\r\nb\rc')).toBe(scriptHash('a\nb\nc'))
  })

  it('builds the policy string', () => {
    expect(buildCsp("'sha256-abc='")).toBe(
      "default-src 'self'; script-src 'self' 'sha256-abc='; style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; font-src 'self'; connect-src 'self' https://formspree.io; " +
        "form-action https://formspree.io; base-uri 'self'; object-src 'none'",
    )
  })

  it('widens script-src and connect-src only when analytics are on', () => {
    const on = buildCsp("'sha256-abc='", true)
    expect(on).toContain("script-src 'self' 'sha256-abc=' https://static.cloudflareinsights.com;")
    expect(on).toContain("connect-src 'self' https://formspree.io https://cloudflareinsights.com;")
    expect(buildCsp("'sha256-abc='", false)).not.toMatch(/cloudflare/)
    expect(addCsp(page(`<script>${SCRIPT}</script>`))).not.toMatch(/cloudflare/)
    expect(addCsp(page(`<script>${SCRIPT}</script>`), { analytics: true })).toMatch(/static\.cloudflareinsights\.com/)
  })

  it('injects the beacon before </body> and rejects a malformed token', () => {
    const token = 'a'.repeat(32)
    const out = addBeacon('<body>x</body>', token)
    expect(out).toContain(
      `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${token}"}'></script>
  </body>`,
    )
    expect(inlineScripts(out)).toEqual([])
    for (const bad of ['', 'A'.repeat(32), 'a'.repeat(31), `${token}"`]) {
      expect(() => addBeacon('<body></body>', bad)).toThrow(/cloudflareToken/)
    }
  })

  it('ignores external and JSON-LD scripts and puts the meta right after charset', () => {
    const html = page(
      '<script type="application/ld+json">{"a":1}</script>',
      `<script>${SCRIPT}</script>`,
      '<script type="module" crossorigin src="/assets/a.js"></script>',
    )
    expect(inlineScripts(html)).toEqual([SCRIPT])
    const out = addCsp(html)
    expect(out).toContain(`script-src 'self' ${scriptHash(SCRIPT)};`)
    expect(out).toMatch(/<meta charset="UTF-8" \/>\s*<meta http-equiv="Content-Security-Policy"/)
  })

  it('fails unless there is exactly one inline script', () => {
    expect(() => addCsp(page())).toThrow(/exactly 1 inline script, found 0/)
    expect(() => addCsp(page('<script>a()</script>', '<script>b()</script>'))).toThrow(/found 2/)
  })
})
