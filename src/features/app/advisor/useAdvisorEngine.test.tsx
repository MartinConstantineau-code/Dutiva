import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { bi } from '@/i18n/core'
import {
  ADVISOR_STREAM_CHARS_PER_TICK,
  ADVISOR_STREAM_TICK_MS,
  ADVISOR_THINK_MS,
  useAdvisorEngine,
} from './useAdvisorEngine'

const REPLY = bi('Here is the assessment.', 'Voici l’évaluation.')
const REPLY_MAX_LEN = Math.max(REPLY.en.length, REPLY.fr.length)
const STREAM_MS = Math.ceil(REPLY_MAX_LEN / ADVISOR_STREAM_CHARS_PER_TICK) * ADVISOR_STREAM_TICK_MS

describe('useAdvisorEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs user message → typing → streaming → done with cards', () => {
    const { result } = renderHook(() => useAdvisorEngine())

    act(() => {
      result.current.sendUser('I need to terminate an employee in Ontario.')
    })
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toMatchObject({
      author: 'user',
      text: 'I need to terminate an employee in Ontario.',
      status: 'done',
    })
    expect(result.current.busy).toBe(false)

    act(() => {
      result.current.pushTurn({
        text: REPLY,
        cards: [
          {
            tone: 'risk',
            title: bi('Notice exposure risk', 'Risque d’exposition au préavis'),
            body: bi('Body', 'Corps'),
          },
        ],
      })
    })
    expect(result.current.messages).toHaveLength(2)
    /* Thinking dots phase (850ms). */
    expect(result.current.messages[1]).toMatchObject({ author: 'assistant', status: 'thinking' })
    expect(result.current.busy).toBe(true)

    act(() => {
      vi.advanceTimersByTime(ADVISOR_THINK_MS - 1)
    })
    expect(result.current.messages[1]?.status).toBe('thinking')

    /* Streaming phase — 3 chars every 16ms. */
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.messages[1]?.status).toBe('streaming')

    act(() => {
      vi.advanceTimersByTime(ADVISOR_STREAM_TICK_MS)
    })
    expect(result.current.messages[1]?.streamedLen).toBe(ADVISOR_STREAM_CHARS_PER_TICK)

    /* Completion — text fully revealed, cards attached, engine idle. */
    act(() => {
      vi.advanceTimersByTime(STREAM_MS)
    })
    expect(result.current.messages[1]).toMatchObject({
      status: 'done',
      streaming: false,
      streamedLen: REPLY_MAX_LEN,
    })
    expect(result.current.messages[1]?.cards).toHaveLength(1)
    expect(result.current.busy).toBe(false)
  })

  it('lands error turns in the error state and streams the retry text', () => {
    const { result } = renderHook(() => useAdvisorEngine())

    act(() => {
      result.current.pushTurn({
        text: '',
        isError: true,
        errorText: bi('The estimator timed out.', 'L’estimateur a expiré.'),
        retryText: bi('Rough range: 9–12 months.', 'Fourchette approximative : 9 à 12 mois.'),
      })
    })
    act(() => {
      vi.advanceTimersByTime(ADVISOR_THINK_MS)
    })
    expect(result.current.messages[0]?.status).toBe('error')
    expect(result.current.busy).toBe(false)

    const id = result.current.messages[0]?.id ?? ''
    act(() => {
      result.current.retryTurn(id)
    })
    expect(result.current.messages[0]?.status).toBe('thinking')
    act(() => {
      vi.advanceTimersByTime(ADVISOR_THINK_MS + 60 * ADVISOR_STREAM_TICK_MS)
    })
    expect(result.current.messages[0]).toMatchObject({
      status: 'done',
      text: bi('Rough range: 9–12 months.', 'Fourchette approximative : 9 à 12 mois.'),
    })
  })

  it('reset replaces the transcript and cancels pending timers', () => {
    const { result } = renderHook(() => useAdvisorEngine())

    act(() => {
      result.current.pushTurn({ text: REPLY })
    })
    expect(result.current.busy).toBe(true)

    act(() => {
      result.current.reset()
    })
    expect(result.current.messages).toHaveLength(0)
    expect(result.current.busy).toBe(false)

    /* No zombie timers reviving the cleared turn. */
    act(() => {
      vi.advanceTimersByTime(ADVISOR_THINK_MS + STREAM_MS)
    })
    expect(result.current.messages).toHaveLength(0)
  })
})
