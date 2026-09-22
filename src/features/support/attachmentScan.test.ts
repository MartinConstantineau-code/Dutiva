import { describe, expect, it } from 'vitest'
import {
  SCAN_MAX_ATTEMPTS,
  canReleaseAttachment,
  interpretScanResponse,
  nextScanStatus,
  scanDetail,
} from './attachmentScan'

describe('interpretScanResponse', () => {
  it('reads the documented contract', () => {
    expect(interpretScanResponse({ status: 'clean' })).toBe('clean')
    expect(interpretScanResponse({ status: 'infected' })).toBe('flagged')
    expect(interpretScanResponse({ status: 'unsupported' })).toBe('skipped')
  })

  it('accepts the common boolean shapes an off-the-shelf wrapper returns', () => {
    expect(interpretScanResponse({ infected: false })).toBe('clean')
    expect(interpretScanResponse({ infected: true })).toBe('flagged')
    expect(interpretScanResponse({ malicious: true })).toBe('flagged')
    expect(interpretScanResponse({ clean: true })).toBe('clean')
  })

  it('does not upgrade "not clean" into a positive detection', () => {
    // `clean: false` says the scanner did not clear the file; it does not say
    // malware was found. Treating it as flagged would invent a detection.
    expect(interpretScanResponse({ clean: false })).toBe('unknown')
  })

  it('accepts the result/verdict aliases and bare strings', () => {
    expect(interpretScanResponse({ result: 'OK' })).toBe('clean')
    expect(interpretScanResponse({ verdict: 'FOUND' })).toBe('flagged')
    expect(interpretScanResponse('clean')).toBe('clean')
    expect(interpretScanResponse('  Infected  ')).toBe('flagged')
  })

  it('never reads an unrecognised response as clean', () => {
    // The safety property this whole module exists for.
    expect(interpretScanResponse({})).toBe('unknown')
    expect(interpretScanResponse(null)).toBe('unknown')
    expect(interpretScanResponse(42)).toBe('unknown')
    expect(interpretScanResponse({ status: 'processing' })).toBe('unknown')
    expect(interpretScanResponse({ status: '' })).toBe('unknown')
    expect(interpretScanResponse({ error: 'scanner offline' })).toBe('unknown')
  })

  it('prefers an explicit boolean over a conflicting status word', () => {
    expect(interpretScanResponse({ infected: true, status: 'clean' })).toBe('flagged')
  })
})

describe('scanDetail', () => {
  it('picks the first non-empty detail field and truncates it', () => {
    expect(scanDetail({ detail: 'Eicar-Test-Signature' })).toBe('Eicar-Test-Signature')
    expect(scanDetail({ message: '  spaced  ' })).toBe('spaced')
    expect(scanDetail({ signature: 'x'.repeat(500) })!.length).toBe(200)
  })

  it('returns null when there is nothing useful to store', () => {
    expect(scanDetail({})).toBeNull()
    expect(scanDetail({ detail: '   ' })).toBeNull()
    expect(scanDetail('clean')).toBeNull()
  })
})

describe('nextScanStatus', () => {
  it('settles immediately on a definitive verdict', () => {
    expect(nextScanStatus('clean', 0)).toBe('clean')
    expect(nextScanStatus('flagged', 0)).toBe('flagged')
    expect(nextScanStatus('skipped', 0)).toBe('skipped')
  })

  it('keeps an indeterminate row pending until the attempts are spent', () => {
    expect(nextScanStatus('unknown', 0)).toBe('pending')
    expect(nextScanStatus('unknown', SCAN_MAX_ATTEMPTS - 2)).toBe('pending')
    expect(nextScanStatus('unknown', SCAN_MAX_ATTEMPTS - 1)).toBe('skipped')
  })

  it('gives up as skipped, never as clean', () => {
    // An exhausted scan means "never established as safe" — the one thing it
    // must not become is approved-for-download.
    expect(nextScanStatus('unknown', 99)).toBe('skipped')
  })
})

describe('canReleaseAttachment', () => {
  it('refuses a flagged file unconditionally', () => {
    // Including after the scanner is switched off: a known-bad file does not
    // become releasable because the operator removed the scan URL.
    expect(canReleaseAttachment('flagged', true)).toEqual({ allowed: false, reason: 'infected' })
    expect(canReleaseAttachment('flagged', false)).toEqual({ allowed: false, reason: 'infected' })
  })

  it('releases everything else when no scanner is configured', () => {
    // How the system ships today — gating on scan state without a scanner
    // would break every existing download.
    expect(canReleaseAttachment('pending', false)).toEqual({ allowed: true })
    expect(canReleaseAttachment('skipped', false)).toEqual({ allowed: true })
    expect(canReleaseAttachment('clean', false)).toEqual({ allowed: true })
  })

  it('releases only cleared files once scanning is on', () => {
    expect(canReleaseAttachment('clean', true)).toEqual({ allowed: true })
    expect(canReleaseAttachment('pending', true)).toEqual({ allowed: false, reason: 'unscanned' })
    expect(canReleaseAttachment('skipped', true)).toEqual({ allowed: false, reason: 'unscanned' })
  })
})
