import type { CardTone } from './types'

/**
 * Tone-card colour ramp — the port of the prototype's `prepCard()` toneMap:
 * risk (red), warning (amber, gold dot), info (accent), success (green),
 * suggestion (gold). Token utilities per surfaces.css; `--accent-soft-border`
 * has no Tailwind alias, hence the `(--var)` arbitrary classes.
 */
export interface ToneStyle {
  /** Card container: tone background + border. */
  card: string
  /** 7px status dot fill. */
  dot: string
  /** Card title colour. */
  title: string
  /** Primary action: white text on the tone's dot colour. */
  primaryBtn: string
  /** Secondary action / citation chip: tone border + tone foreground. */
  outline: string
}

export const cardToneStyles: Record<CardTone, ToneStyle> = {
  risk: {
    card: 'bg-risk-bg border-risk-border',
    dot: 'bg-risk-dot',
    title: 'text-risk-fg',
    primaryBtn: 'bg-risk-dot',
    outline: 'border-risk-border text-risk-fg',
  },
  warning: {
    card: 'bg-warn-bg border-warn-border',
    dot: 'bg-gold-dot',
    title: 'text-warn-fg',
    primaryBtn: 'bg-gold-dot',
    outline: 'border-warn-border text-warn-fg',
  },
  info: {
    card: 'bg-accent-soft border-(--accent-soft-border)',
    dot: 'bg-accent',
    title: 'text-accent',
    primaryBtn: 'bg-accent',
    outline: 'border-(--accent-soft-border) text-accent',
  },
  success: {
    card: 'bg-ok-bg border-ok-border',
    dot: 'bg-ok-fg',
    title: 'text-ok-fg',
    primaryBtn: 'bg-ok-fg',
    outline: 'border-ok-border text-ok-fg',
  },
  suggestion: {
    card: 'bg-gold-bg border-gold-border',
    dot: 'bg-gold-dot',
    title: 'text-gold-fg',
    primaryBtn: 'bg-gold-dot',
    outline: 'border-gold-border text-gold-fg',
  },
}
