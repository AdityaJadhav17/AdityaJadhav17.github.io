// How far the Experience rail is drawn, 0 to 1, from the list's position in
// the viewport. It starts when the list's top reaches 80% of the viewport
// height and finishes when its bottom reaches 60%.
export function railProgress(top: number, height: number, viewport: number): number {
  const p = (0.8 * viewport - top) / (height + 0.2 * viewport)
  return Math.min(1, Math.max(0, p))
}
