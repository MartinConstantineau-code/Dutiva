import { describe, expect, it, vi } from 'vitest'
import { deliverSupportEmail } from './emailService'

describe('deliverSupportEmail', () => {
  it('no-ops (does not throw) when no provider is configured', async () => {
    const result = await deliverSupportEmail(null, { to: 'a@b.ca', subject: 'S', text: 'T' })
    expect(result.delivered).toBe(false)
  })

  it('sends via the provider when one is present', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    const message = { to: 'a@b.ca', subject: 'S', text: 'T' }
    const result = await deliverSupportEmail({ send }, message)
    expect(result.delivered).toBe(true)
    expect(send).toHaveBeenCalledWith(message)
  })
})
