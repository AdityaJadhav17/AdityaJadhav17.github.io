export type ThemeTokens = Record<string, string>
export interface Tokens {
  light: ThemeTokens
  dark: ThemeTokens
}
export function parseTokens(css: string): Tokens
export function readTokens(root?: string): Tokens
export function fill(text: string, tokens: Tokens): string
