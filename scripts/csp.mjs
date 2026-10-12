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

export const buildCsp = (hash) =>
  [
    `default-src 'self'`,
    `script-src 'self' ${hash}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    `connect-src 'self' https://formspree.io`,
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

/** Inserts the policy as a <meta> right after <meta charset>; throws unless there is exactly one inline script. */
export function addCsp(html) {
  const scripts = inlineScripts(html)
  if (scripts.length !== 1) {
    throw new Error(`csp: expected exactly 1 inline script, found ${scripts.length}`)
  }
  const meta = `<meta http-equiv="Content-Security-Policy" content="${buildCsp(scriptHash(scripts[0]))}" />`
  let hits = 0
  const out = html.replace(/<meta charset=[^>]*>/i, (charset) => {
    hits++
    return `${charset}\n    ${meta}`
  })
  if (hits !== 1) throw new Error('csp: <meta charset> not found in dist/index.html')
  return out
}
