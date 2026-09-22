import { describe, expect, it } from 'vitest'
import { isAdminRole, isOrgMemberRole, roleAtLeast } from './roles'

describe('roleAtLeast', () => {
  it('orders viewer < member < manager < admin < owner', () => {
    expect(roleAtLeast('viewer', 'member')).toBe(false)
    expect(roleAtLeast('member', 'member')).toBe(true)
    expect(roleAtLeast('manager', 'admin')).toBe(false)
    expect(roleAtLeast('admin', 'member')).toBe(true)
    expect(roleAtLeast('owner', 'admin')).toBe(true)
  })

  it('treats a missing role as below everything', () => {
    expect(roleAtLeast(null, 'viewer')).toBe(false)
  })
})

describe('isAdminRole', () => {
  it('matches the RLS is_org_admin writer set exactly', () => {
    expect(isAdminRole('owner')).toBe(true)
    expect(isAdminRole('admin')).toBe(true)
    expect(isAdminRole('manager')).toBe(false)
    expect(isAdminRole('member')).toBe(false)
    expect(isAdminRole('viewer')).toBe(false)
    expect(isAdminRole(null)).toBe(false)
  })
})

describe('isOrgMemberRole', () => {
  it('accepts the vocabulary and rejects everything else', () => {
    expect(isOrgMemberRole('owner')).toBe(true)
    expect(isOrgMemberRole('viewer')).toBe(true)
    expect(isOrgMemberRole('superuser')).toBe(false)
    expect(isOrgMemberRole(null)).toBe(false)
  })
})
