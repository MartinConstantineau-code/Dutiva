import { describe, expect, it } from 'vitest'
import { detectCrisisSignal } from './crisisSignals'

describe('detectCrisisSignal', () => {
  it('detects first-person English self-harm signals', () => {
    expect(detectCrisisSignal('I want to kill myself')).toBe(true)
    expect(detectCrisisSignal('I feel suicidal and I can’t go on')).toBe(true)
    expect(detectCrisisSignal('honestly I would be better off dead')).toBe(true)
  })

  it('detects French signals regardless of accents and apostrophes', () => {
    expect(detectCrisisSignal('je veux me suicider')).toBe(true)
    expect(detectCrisisSignal('je me sens suicidaire')).toBe(true)
    expect(detectCrisisSignal('je n’ai plus envie de vivre')).toBe(true)
  })

  it('is case- and accent-insensitive', () => {
    expect(detectCrisisSignal('SUICIDAL')).toBe(true)
    expect(detectCrisisSignal('Suicidaire')).toBe(true)
  })

  it('does not fire on ordinary HR questions', () => {
    expect(detectCrisisSignal('I want to terminate an employee for cause')).toBe(false)
    expect(detectCrisisSignal('How much notice is required in Ontario?')).toBe(false)
    expect(detectCrisisSignal('We need to lay off three people next month')).toBe(false)
  })

  it('returns false for empty or whitespace input', () => {
    expect(detectCrisisSignal('')).toBe(false)
    expect(detectCrisisSignal('   ')).toBe(false)
  })
})
