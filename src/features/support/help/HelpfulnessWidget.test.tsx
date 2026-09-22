import { describe, expect, it, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { HelpfulnessWidget } from './HelpfulnessWidget'
import { feedbackStorageKey } from './helpFeedback'

describe('HelpfulnessWidget', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('asks the question and offers yes/no', () => {
    renderApp(<HelpfulnessWidget slug="widget-a" />)
    expect(screen.getByText('Was this article helpful?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument()
  })

  it('records a positive vote, thanks the reader, and hides the buttons', async () => {
    const user = userEvent.setup()
    renderApp(<HelpfulnessWidget slug="widget-b" />)
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    expect(screen.getByText('Thanks for letting us know.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Yes' })).not.toBeInTheDocument()
    expect(window.localStorage.getItem(feedbackStorageKey('widget-b'))).toBe('yes')
  })

  it('points an unhelpful vote toward contact support', async () => {
    const user = userEvent.setup()
    renderApp(<HelpfulnessWidget slug="widget-c" />)
    await user.click(screen.getByRole('button', { name: 'No' }))
    expect(
      screen.getByText('Thanks — if you still need help, contact support below.'),
    ).toBeInTheDocument()
  })

  it('remembers a prior vote and does not ask again', () => {
    window.localStorage.setItem(feedbackStorageKey('widget-d'), 'yes')
    renderApp(<HelpfulnessWidget slug="widget-d" />)
    expect(screen.getByText('Thanks for letting us know.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Yes' })).not.toBeInTheDocument()
  })
})
