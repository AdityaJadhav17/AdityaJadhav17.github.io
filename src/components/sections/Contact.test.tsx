import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Contact } from './Contact'

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
      expect(screen.getByRole('status')).toHaveTextContent(/thank you/i)
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

  it('announces success in a live region', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    render(<Contact />)
    await fillAndSubmit()
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/thank you/i)
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
})
