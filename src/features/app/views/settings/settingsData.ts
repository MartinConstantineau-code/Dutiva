import type { Bi, LText } from '@/i18n/core'
import { settingsMessages as M } from '@/i18n/messages/settings'

/**
 * Settings view content — the static tables of the prototype's largest view
 * (buildSettingsView 3539-3622): toggle specs, workspace facts, the roles &
 * permissions matrix, retention/security rows, and the audit log.
 */

export type PrefKey =
  'emailDigest' | 'riskAlerts' | 'autoEscalate' | 'weeklyDigest' | 'aiContext' | 'aiCitations'

/* Prototype initial state (line 2406). */
export const initialPrefs: Record<PrefKey, boolean> = {
  emailDigest: true,
  riskAlerts: true,
  autoEscalate: false,
  weeklyDigest: true,
  aiContext: true,
  aiCitations: true,
}

export interface ToggleSpec {
  key: PrefKey
  label: Bi
  sub: Bi
}

/* Prototype seg() — segmented control button (line 4908). */
export function segClass(on: boolean): string {
  return `cursor-pointer rounded-[6px] border-none px-[11px] py-[5px] font-sans text-[12px] font-semibold transition-colors duration-150 ${
    on ? 'bg-surface text-text' : 'bg-transparent text-text-muted'
  }`
}

export const notificationToggles: ToggleSpec[] = [
  {
    key: 'emailDigest',
    label: M.settings_toggle_email_digest,
    sub: M.settings_toggle_email_digest_sub,
  },
  {
    key: 'riskAlerts',
    label: M.settings_toggle_risk_alerts,
    sub: M.settings_toggle_risk_alerts_sub,
  },
  {
    key: 'autoEscalate',
    label: M.settings_toggle_auto_escalate,
    sub: M.settings_toggle_auto_escalate_sub,
  },
  {
    key: 'weeklyDigest',
    label: M.settings_toggle_weekly_digest,
    sub: M.settings_toggle_weekly_digest_sub,
  },
]

export const aiToggles: ToggleSpec[] = [
  { key: 'aiContext', label: M.settings_toggle_ai_context, sub: M.settings_toggle_ai_context_sub },
  {
    key: 'aiCitations',
    label: M.settings_toggle_ai_citations,
    sub: M.settings_toggle_ai_citations_sub,
  },
]

export const provinces: Bi[] = [
  M.settings_prov_ontario,
  M.settings_prov_bc,
  M.settings_prov_quebec,
  M.settings_prov_alberta,
  M.settings_prov_federal,
]

export const team: { name: LText; role: Bi; initials: string }[] = [
  { name: 'Riley Summers', role: M.settings_role_owner, initials: 'RS' },
  { name: 'Fatima Haddad', role: M.settings_role_hr, initials: 'FH' },
  { name: 'Dana Okonkwo', role: M.settings_role_manager, initials: 'DO' },
  { name: 'Marcus Bell', role: M.settings_role_finance, initials: 'MB' },
  { name: M.settings_team_counsel_name, role: M.settings_team_counsel_role, initials: 'PC' },
  { name: M.settings_team_pending_name, role: M.settings_team_pending_role, initials: '…' },
]

/* Roles & permissions matrix (buildSettingsView `roles`). */
const F = M.settings_perm_full
const V = M.settings_perm_view
const N = M.settings_perm_none
const T = M.settings_perm_team
const AS = M.settings_perm_assigned
export const roleRows: { role: Bi; a: Bi; b: Bi; c: Bi; d: Bi }[] = [
  { role: M.settings_role_owner, a: F, b: F, c: F, d: F },
  { role: M.settings_role_hr, a: F, b: F, c: F, d: F },
  { role: M.settings_role_manager, a: T, b: N, c: N, d: T },
  { role: M.settings_role_finance, a: V, b: F, c: N, d: N },
  { role: M.settings_role_legal, a: V, b: N, c: AS, d: N },
  { role: M.settings_role_viewer, a: V, b: N, c: N, d: N },
]

export const retentionRows: { t: Bi; v: Bi }[] = [
  { t: M.settings_retention_employment, v: M.settings_retention_employment_v },
  { t: M.settings_retention_cases, v: M.settings_retention_cases_v },
  { t: M.settings_retention_accommodation, v: M.settings_retention_accommodation_v },
  { t: M.settings_retention_advisor, v: M.settings_retention_advisor_v },
]

export const securityRows: { t: Bi; v: Bi }[] = [
  { t: M.settings_security_2fa, v: M.settings_security_2fa_v },
  { t: M.settings_security_sso, v: M.settings_security_sso_v },
  { t: M.settings_security_timeout, v: M.settings_security_timeout_v },
  { t: M.settings_security_residency, v: M.settings_security_residency_v },
]

export type ChipTone = 'risk' | 'warning' | 'success' | 'info'

export const auditEvents: { kind: Bi; tone: ChipTone; text: Bi; when: Bi }[] = [
  {
    kind: M.settings_audit_kind_restricted,
    tone: 'warning',
    text: M.settings_audit_ev1_text,
    when: M.settings_audit_ev1_when,
  },
  {
    kind: M.settings_audit_kind_document,
    tone: 'info',
    text: M.settings_audit_ev2_text,
    when: M.settings_audit_ev2_when,
  },
  {
    kind: M.settings_audit_kind_export,
    tone: 'info',
    text: M.settings_audit_ev3_text,
    when: M.settings_audit_ev3_when,
  },
  {
    kind: M.settings_audit_kind_legal,
    tone: 'warning',
    text: M.settings_audit_ev4_text,
    when: M.settings_audit_ev4_when,
  },
  {
    kind: M.settings_audit_kind_case,
    tone: 'info',
    text: M.settings_audit_ev5_text,
    when: M.settings_audit_ev5_when,
  },
  {
    kind: M.settings_audit_kind_comp,
    tone: 'warning',
    text: M.settings_audit_ev6_text,
    when: M.settings_audit_ev6_when,
  },
  {
    kind: M.settings_audit_kind_permissions,
    tone: 'risk',
    text: M.settings_audit_ev7_text,
    when: M.settings_audit_ev7_when,
  },
  {
    kind: M.settings_audit_kind_retention,
    tone: 'risk',
    text: M.settings_audit_ev8_text,
    when: M.settings_audit_ev8_when,
  },
]
