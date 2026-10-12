export function scriptHash(text: string): string
export function buildCsp(hash: string, analytics?: boolean): string
export function addBeacon(html: string, token: string): string
export function inlineScripts(html: string): string[]
export function addCsp(html: string, options?: { analytics?: boolean }): string
