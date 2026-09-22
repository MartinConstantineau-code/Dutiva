import { useEffect, useRef } from 'react'

/**
 * Escape-key coordination for stacked overlays (search, Advisor rail, Document
 * Studio, modals, drawers). Each open overlay registers itself; a single
 * window listener dispatches Escape to the MOST RECENTLY OPENED overlay only,
 * so search over the doc-studio gate doesn't silently cancel the gate behind
 * it. Handlers may implement staged behaviour (e.g. cancel gate → then close).
 */
type EscapeHandler = () => void

const stack: EscapeHandler[] = []
let listening = false

function onWindowKeyDown(e: KeyboardEvent): void {
  if (e.key !== 'Escape') return
  const top = stack.at(-1)
  if (top) {
    e.stopPropagation()
    top()
  }
}

/** Register `handler` as the Escape target while `active` is true. */
export function useEscapeToClose(active: boolean, handler: EscapeHandler): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!active) return
    const entry: EscapeHandler = () => handlerRef.current()
    stack.push(entry)
    if (!listening) {
      window.addEventListener('keydown', onWindowKeyDown)
      listening = true
    }
    return () => {
      const index = stack.indexOf(entry)
      if (index >= 0) stack.splice(index, 1)
      if (stack.length === 0 && listening) {
        window.removeEventListener('keydown', onWindowKeyDown)
        listening = false
      }
    }
  }, [active])
}
