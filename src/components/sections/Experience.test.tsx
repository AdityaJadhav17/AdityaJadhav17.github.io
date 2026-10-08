import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { LazyMotion, MotionConfig, domMin } from 'motion/react'
import { expect, it, vi } from 'vitest'
import { Experience } from '@/components/sections/Experience'

// React only reports a hydration mismatch in development builds, so the
// Playwright run (production bundle) cannot catch this; jsdom can.
it('hydrates the reduced-motion rail without a mismatch, then draws it fully', async () => {
  ;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

  // A media query that starts false (the server cannot know the preference)
  // and flips to reduce before hydration, as on a reduced-motion client.
  const listeners: ((event: { matches: boolean }) => void)[] = []
  const query = {
    matches: false,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_: string, fn: (event: { matches: boolean }) => void) => listeners.push(fn),
    removeEventListener: () => {},
  }
  window.matchMedia = (() => query) as unknown as typeof window.matchMedia

  const tree = (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMin} strict>
        <Experience />
      </LazyMotion>
    </MotionConfig>
  )
  const container = document.createElement('div')
  container.innerHTML = renderToString(tree)
  document.body.append(container)
  const rail = () => container.querySelector<HTMLElement>('span.origin-top')!
  expect(rail().style.transform).toBe('scaleY(0)')

  query.matches = true
  listeners.forEach((fn) => fn({ matches: true }))

  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  await act(async () => {
    hydrateRoot(container, tree)
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50))
  })

  expect(errors.mock.calls.flat().join(' ')).not.toMatch(/hydrat/i)
  expect(rail().style.transform).toBe('none')
  errors.mockRestore()
})
