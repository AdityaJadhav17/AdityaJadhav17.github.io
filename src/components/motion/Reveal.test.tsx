import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Reveal } from './Reveal'

// jsdom does not implement IntersectionObserver (verified: it is `undefined`
// on a fresh JSDOM window, and src/test-setup.ts stubs only matchMedia). So
// this suite exercises Reveal's fallback path, which is exactly the safety
// property worth protecting: content must never be left stranded invisible
// when no observer exists. If a future edit drops the guard, Motion renders
// `style="opacity:0"` onto these elements and both assertions below fail.
describe('Reveal without an IntersectionObserver', () => {
  test('renders children visibly and applies no inline styles', () => {
    render(
      <Reveal as="section" id="probe" className="border-t">
        <Reveal.Item>
          <p>visible content</p>
        </Reveal.Item>
      </Reveal>,
    )

    expect(screen.getByText('visible content')).toBeVisible()

    const section = document.getElementById('probe')
    expect(section).not.toBeNull()
    expect(section?.tagName).toBe('SECTION')
    expect(section?.getAttribute('style')).toBeNull()
    expect(section?.className).toContain('border-t')
  })
})
