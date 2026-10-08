// Opens the <details> of the project card the hash points at. Only an
// <article> qualifies: section ids (#work) and the skip-link target (#main)
// contain cards but are not one. A hash that matches nothing is left alone.
export const openHashTarget = (hash: string) => {
  const el = document.getElementById(hash.slice(1))
  if (el?.localName === 'article') el.querySelector('details')?.setAttribute('open', '')
}
