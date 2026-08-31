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
