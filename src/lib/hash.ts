// Opens the <details> of the card the hash points at. A target without one (a
// timeline entry) or a hash that matches nothing is left alone.
export const openHashTarget = (hash: string) =>
  document.getElementById(hash.slice(1))?.querySelector('details')?.setAttribute('open', '')
