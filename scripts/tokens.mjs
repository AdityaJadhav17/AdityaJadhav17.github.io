// Reads the colour tokens out of src/styles/theme.css, the only place palette
// hex is allowed to live. Shared by scripts/palette.mjs, scripts/prerender.mjs
// and src/styles/palette.test.ts so they cannot drift apart.
// ponytail: regex over the two flat blocks (no nested braces); swap for a CSS
// parser if theme.css ever nests rules inside them.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const block = (css, opener) => {
  const m = css.match(opener)
  if (!m) throw new Error(`tokens: block not found: ${opener}`)
  const vars = {}
  for (const [, name, value] of m[1].matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    vars[name] = value.toUpperCase()
  }
  return vars
}

/** Light = the `@theme { ... }` block, dark = the `.dark { ... }` block. */
export function parseTokens(css) {
  return {
    light: block(css, /@theme\s*\{([^}]*)\}/),
    dark: block(css, /(?:^|\n)\s*\.dark\s*\{([^}]*)\}/),
  }
}

export const readTokens = (root = process.cwd()) =>
  parseTokens(readFileSync(resolve(root, 'src/styles/theme.css'), 'utf8'))

/** Replaces `{{light.name}}` / `{{dark.name}}` placeholders; throws on unknown ones. */
export function fill(text, tokens) {
  return text.replace(/\{\{(light|dark)\.([\w-]+)\}\}/g, (_, theme, name) => {
    const v = tokens[theme][name]
    if (!v) throw new Error(`tokens: no ${theme}.${name} in theme.css`)
    return v
  })
}
