// Content-Security-Policy for the built index.html. The page has exactly one
// inline script (the pre-paint theme script), allowed by hash so the policy can
// keep script-src free of 'unsafe-inline'. Used by scripts/prerender.mjs only:
// dev (vite) serves index.html without a policy.
import { createHash } from 'node:crypto'

/**
 * CSP source for an inline script: the sha256 (base64) of its text. Browsers
 * hash the parsed text, where the HTML parser has already turned CRLF and CR
 * into LF, so a CRLF checkout (Windows) must be normalised the same way.
 */
export const scriptHash = (text) => {
  const parsed = text.replaceAll('\r\n', '\n').replaceAll('\r', '\n')
  return `'sha256-${createHash('sha256').update(parsed, 'utf8').digest('base64')}'`
}

const CF_SCRIPT = 'https://static.cloudflareinsights.com'
const CF_CONNECT = 'https://cloudflareinsights.com'

/** `analytics` widens script-src and connect-src for the Cloudflare beacon; off by default. */
export const buildCsp = (hash, analytics = false) =>
  [
    `default-src 'self'`,
    `script-src 'self' ${hash}${analytics ? ` ${CF_SCRIPT}` : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    `connect-src 'self' https://formspree.io${analytics ? ` ${CF_CONNECT}` : ''}`,
    `form-action https://formspree.io`,
    `base-uri 'self'`,
    `object-src 'none'`,
  ].join('; ')

/** Text of every inline script that would execute (no src, not a JSON-LD data block). */
export function inlineScripts(html) {
  const found = []
  for (const [, attrs, text] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/i.test(attrs)) continue
    if (/\btype\s*=\s*["']?application\/ld\+json/i.test(attrs)) continue
    found.push(text)
  }
  return found
}

/** Cloudflare Web Analytics beacon, added before </body>. Throws on a malformed token. */
export function addBeacon(html, token) {
  if (!/^[a-f0-9]{32}$/.test(token)) throw new Error('analytics: cloudflareToken must be 32 lowercase hex characters')
  const tag = `<script defer src="${CF_SCRIPT}/beacon.min.js" data-cf-beacon='{"token":"${token}"}'></script>`
  let hits = 0
  const out = html.replace('</body>', () => {
    hits++
    return `${tag}
  </body>`
  })
  if (hits !== 1) throw new Error('analytics: </body> not found in dist/index.html')
  return out
}

/** Inserts the policy as a <meta> right after <meta charset>; throws unless there is exactly one inline script. */
export function addCsp(html, { analytics = false } = {}) {
  const scripts = inlineScripts(html)
  if (scripts.length !== 1) {
    throw new Error(`csp: expected exactly 1 inline script, found ${scripts.length}`)
  }
  const meta = `<meta http-equiv="Content-Security-Policy" content="${buildCsp(scriptHash(scripts[0]), analytics)}" />`
  let hits = 0
  const out = html.replace(/<meta charset=[^>]*>/i, (charset) => {
    hits++
    return `${charset}\n    ${meta}`
  })
  if (hits !== 1) throw new Error('csp: <meta charset> not found in dist/index.html')
  return out
}
