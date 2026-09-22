import { describe, expect, it } from 'vitest'
import { acknowledgementKind, notificationsForNewTicket, operatorChannel } from './notifications'

describe('notification rules', () => {
  it('maps categories to acknowledgement kinds', () => {
    expect(acknowledgementKind('privacy')).toBe('privacy_ack')
    expect(acknowledgementKind('security')).toBe('security_ack')
    expect(acknowledgementKind('accessibility')).toBe('accessibility_ack')
    expect(acknowledgementKind('complaint')).toBe('complaint_ack')
    expect(acknowledgementKind('technical')).toBe('ticket_received')
    expect(acknowledgementKind('billing')).toBe('ticket_received')
  })

  it('alerts the operator immediately for security or high/critical, else digest', () => {
    expect(operatorChannel('security', 'low')).toBe('immediate')
    expect(operatorChannel('technical', 'critical')).toBe('immediate')
    expect(operatorChannel('technical', 'high')).toBe('immediate')
    expect(operatorChannel('technical', 'standard')).toBe('digest')
    expect(operatorChannel('product_question', 'low')).toBe('digest')
  })

  it('enqueues a customer acknowledgement and an operator alert for a new ticket', () => {
    expect(notificationsForNewTicket('security', 'high')).toEqual([
      { kind: 'security_ack', audience: 'customer', channel: 'immediate' },
      { kind: 'operator_alert', audience: 'operator', channel: 'immediate' },
    ])
    expect(notificationsForNewTicket('product_question', 'low')).toEqual([
      { kind: 'ticket_received', audience: 'customer', channel: 'immediate' },
      { kind: 'operator_alert', audience: 'operator', channel: 'digest' },
    ])
  })
})
