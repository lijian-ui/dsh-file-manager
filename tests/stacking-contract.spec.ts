/**
 * Stacking contract regression guard (issue #234 follow-up): the panel
 * columns stack above the shell overlay layer (issue #195), and the frame
 * chrome (floating expand button, collapse chevron, and the inline
 * drag-handle z-index in layout.ts) must stay at or above the column
 * layer — the chrome overlaps the column tracks, so lowering it below the
 * columns buries it under the opaque panels and kills hit-testing.
 * Full-screen overlay drawers cover the panels by rendering at the ROOT
 * stacking context (z 100~1000), not by the panel side lowering its z-index.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(process.cwd(), 'src/client/styles/tokens.module.css'), 'utf8')
const layout = readFileSync(join(process.cwd(), 'src/client/layout.ts'), 'utf8')

const block = (selector: string): string => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(escaped + '\\s*\\{([^}]*)\\}'))
  if (match === null) throw new Error('selector not found in tokens.module.css: ' + selector)
  return match[1] ?? ''
}

describe('panel stacking contract', () => {
  it('keeps the columns above the shell overlay layer', () => {
    const cols = css.match(/:global\(\.filemgr-preview-col\),\s*\n:global\(\.filemgr-explorer-col\)\s*\{([^}]*)\}/)
    expect(cols).not.toBeNull()
    expect(cols?.[1]).toContain('z-index: 30')
  })

  it('keeps the floating expand button above the columns', () => {
    expect(block(':global(.filemgr-floating-expand)')).toContain('z-index: 100')
  })

  it('keeps the collapse chevron at the column layer', () => {
    expect(block(':global(.filemgr-collapse-chevron)')).toContain('z-index: 30')
  })

  it('keeps the floating button in the top-right chevron row (right edge, no drag chrome)', () => {
    const rules = block(':global(.filemgr-floating-expand)')
    expect(rules).toContain('right: 8px')
    expect(rules).toContain('width: 24px')
    expect(rules).not.toContain('touch-action')
  })

  it('keeps the drag handles inline z-index at the column layer', () => {
    // The handles are set inline in layout.ts; a regression (issue #234
    // follow-up) would lower them below the opaque columns and kill the
    // drag hit-testing exactly like the reverted 40e15c77/233140ee cycle.
    expect(layout).toMatch(/el\.style\.zIndex = '30'/)
    expect(layout).toContain('Same layer as the columns (z 30)')
  })

  it('keeps the maximized narrow-screen overlay fixed and above the columns', () => {
    // The grouped selector needs no regex: find the documented rule block and
    // assert its decisive declarations.
    const marker = css.indexOf('Maximized narrow-screen overlay')
    expect(marker).toBeGreaterThan(-1)
    const rule = css.slice(marker, css.indexOf('}', marker) + 1)
    expect(rule).toContain('position: fixed')
    expect(rule).toContain('z-index: 60')
  })
})
