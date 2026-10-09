import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Contact } from './Contact'
import { site } from '@/content/site'

describe('Contact', () => {
  beforeEach(() => vi.restoreAllMocks())

  async function fillAndSubmit() {
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/name/i), 'Test Person')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Hello there')
    await user.click(screen.getByRole('button', { name: /send/i }))
  }

  // The honeypot is a security control, so it gets a test that would fail if
  // the guard were removed. Asserting only that the UI says "thank you" would
  // pass either way, since a filtered submission deliberately reports success.
  // What distinguishes the two is whether the network call happened at all.
  it('drops a submission that filled the honeypot, without calling the network', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    const { container } = render(<Contact />)

    const honeypot = container.querySelector('input[name="_gotcha"]')
    expect(honeypot).not.toBeNull()

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/name/i), 'Spam Bot')
    await user.type(screen.getByLabelText(/email/i), 'bot@example.com')
    await user.type(screen.getByLabelText(/message/i), 'buy things')
    // A real visitor can never reach this field, so type into it directly.
    await user.type(honeypot as HTMLInputElement, 'i am a bot')
    await user.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent("Sent. I'll reply to the email address you entered.")
    })
    // The point of the test: reported success, but nothing left the browser.
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('keeps the honeypot out of the keyboard order and the accessibility tree', async () => {
    const { container } = render(<Contact />)
    const honeypot = container.querySelector('input[name="_gotcha"]') as HTMLInputElement

    expect(honeypot.tabIndex).toBe(-1)
    expect(honeypot.getAttribute('aria-hidden')).toBe('true')
    expect(honeypot.className).toContain('hidden')
  })

  it('posts natively to Formspree when the JS handler has not attached', () => {
    const { container } = render(<Contact />)
    const form = container.querySelector('form') as HTMLFormElement

    expect(form.getAttribute('action')).toBe('https://formspree.io/f/xblawgak')
    expect(form.method).toBe('post')
    for (const name of ['name', 'email', 'message', '_gotcha']) {
      expect(form.querySelector(`[name="${name}"]`)).not.toBeNull()
    }
  })

  it('requires the three fields natively and turns native validation off once hydrated', () => {
    const { container } = render(<Contact />)
    const form = container.querySelector('form') as HTMLFormElement
    for (const name of ['name', 'email', 'message']) {
      expect(form.querySelector(`[name="${name}"]`)).toBeRequired()
    }
    expect(form.querySelector('[name="email"]')).toHaveAttribute('type', 'email')
    expect(form.noValidate).toBe(true)
  })

  it('still prevents the native submit once the handler is attached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    const { container } = render(<Contact />)
    const form = container.querySelector('form') as HTMLFormElement
    const ev = new Event('submit', { bubbles: true, cancelable: true })
    form.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(true)
  })

  it('announces success in a live region', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    render(<Contact />)
    await fillAndSubmit()
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent("Sent. I'll reply to the email address you entered.")
    })
  })

  it('announces failure as an alert and keeps the entered values', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    render(<Contact />)
    await fillAndSubmit()
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/message/i)).toHaveValue('Hello there')
  })

  it('announces failure when the network throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    render(<Contact />)
    await fillAndSubmit()
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('copy email', () => {
    afterEach(() => vi.useRealTimers())

    it('copies the address, announces it once and clears after 2 s', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      // setup() installs its own clipboard stub, so stub ours after it.
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
      const { container } = render(<Contact />)
      const live = container.querySelector('[aria-live="polite"]') as HTMLElement
      expect(live).toHaveTextContent('')

      await user.click(screen.getByRole('button', { name: 'Copy email' }))
      expect(writeText).toHaveBeenCalledWith(site.email)
      // The announcement lands after the clipboard promise resolves and React
      // re-renders, so wait for it rather than asserting synchronously (a slow
      // CI runner lost that race).
      await waitFor(() => expect(live).toHaveTextContent('Copied'))
      // The accessible name stays put; only the live region speaks.
      expect(screen.getByRole('button', { name: 'Copy email' })).toBeInTheDocument()

      // A second click inside the window re-announces: the region is emptied first.
      const texts: string[] = []
      new MutationObserver(() => texts.push(live.textContent ?? '')).observe(live, {
        childList: true,
        characterData: true,
        subtree: true,
      })
      await user.click(screen.getByRole('button', { name: 'Copy email' }))
      await waitFor(() => expect(texts).toContain(''))
      await waitFor(() => expect(live).toHaveTextContent('Copied'))

      await act(async () => {
        vi.advanceTimersByTime(2000)
      })
      expect(live).toHaveTextContent('')
      expect(screen.getByRole('button', { name: 'Copy email' })).toBeInTheDocument()
    })

    it('selects the address when the clipboard is unavailable', async () => {
      const user = userEvent.setup()
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
      const { container } = render(<Contact />)
      await user.click(screen.getByRole('button', { name: 'Copy email' }))
      expect(window.getSelection()?.toString()).toBe(site.email)
      expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('Email selected')
    })

    it('keeps the mailto link', () => {
      render(<Contact />)
      expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute('href', `mailto:${site.email}`)
    })
  })
})
