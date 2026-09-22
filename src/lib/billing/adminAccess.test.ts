import { describe, expect, it } from 'vitest'
import { bypassesPaywall, isAdminEmail, isInternalDutivaAccount } from './adminAccess'

describe('adminAccess', () => {
  it('recognizes the explicitly listed admin account, case- and whitespace-insensitively', () => {
    expect(isAdminEmail('martin.constantineau@dutiva.ca')).toBe(true)
    expect(isAdminEmail('Martin.Constantineau@dutiva.ca')).toBe(true)
    expect(isAdminEmail('  MARTIN.CONSTANTINEAU@DUTIVA.CA  ')).toBe(true)
  })

  it('recognizes any @dutiva.ca account as internal', () => {
    expect(isInternalDutivaAccount('someone.else@dutiva.ca')).toBe(true)
    expect(isInternalDutivaAccount('someone@notdutiva.ca')).toBe(false)
  })

  it('rejects unrelated accounts', () => {
    expect(isAdminEmail('customer@example.com')).toBe(false)
    expect(isInternalDutivaAccount('customer@example.com')).toBe(false)
    expect(bypassesPaywall('customer@example.com')).toBe(false)
  })

  it('rejects a lookalike domain that merely ends with dutiva.ca as a substring', () => {
    expect(isInternalDutivaAccount('attacker@notdutiva.ca.evil.com')).toBe(false)
  })

  it('handles missing/undefined email without throwing', () => {
    expect(isAdminEmail(undefined)).toBe(false)
    expect(isAdminEmail(null)).toBe(false)
    expect(bypassesPaywall(undefined)).toBe(false)
  })

  it('bypassesPaywall is true for either the admin list or the domain check', () => {
    expect(bypassesPaywall('martin.constantineau@dutiva.ca')).toBe(true)
    expect(bypassesPaywall('anyone@dutiva.ca')).toBe(true)
  })
})
