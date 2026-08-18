/**
 * Maximize-mode tests (issue #315): the takeover grid strings collapse the
 * four non-target tracks, the narrow-screen decision drives the full-screen
 * overlay mode, and the layout store transitions are transient — restore
 * re-applies the stored widths/collapse exactly, and a root switch never
 * leaks a maximized state into another project.
 */
// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import {
  MAXIMIZE_OVERLAY_BREAKPOINT_PX, maximizedGridTracks, maximizedOverlay,
} from '../src/client/maximize.ts'
import { createLayoutStore, layoutSetRoot } from '../src/client/store.ts'

describe('maximizedGridTracks', () => {
  it('gives the explorer the whole row', () => {
    expect(maximizedGridTracks('explorer', 1280)).toBe('0px 0px 0px 0px 1280px')
  })

  it('gives the preview the whole row', () => {
    expect(maximizedGridTracks('preview', 1280)).toBe('0px 0px 0px 1280px 0px')
  })

  it('rounds the frame width', () => {
    expect(maximizedGridTracks('explorer', 1279.6)).toBe('0px 0px 0px 0px 1280px')
  })
})

describe('maximizedOverlay', () => {
  it('uses the grid takeover on wide rows', () => {
    expect(maximizedOverlay(MAXIMIZE_OVERLAY_BREAKPOINT_PX)).toBe(false)
    expect(maximizedOverlay(1200)).toBe(false)
  })

  it('uses the full-screen overlay on narrow rows', () => {
    expect(maximizedOverlay(MAXIMIZE_OVERLAY_BREAKPOINT_PX - 1)).toBe(true)
    expect(maximizedOverlay(480)).toBe(true)
  })

  it('never overlays an unmeasured row', () => {
    expect(maximizedOverlay(0)).toBe(false)
  })
})

describe('layout store maximize transitions', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('maximize and restore keep widths and collapse untouched', () => {
    const layout = createLayoutStore()
    layout.update((prev) => ({ ...prev, explorerWidth: 320, previewWidth: 520, explorerCollapsed: false, maximized: 'explorer' }))
    expect(layout.getSnapshot().maximized).toBe('explorer')
    layout.update((prev) => ({ ...prev, maximized: null }))
    const state = layout.getSnapshot()
    expect(state.maximized).toBeNull()
    expect(state.explorerWidth).toBe(320)
    expect(state.previewWidth).toBe(520)
    expect(state.explorerCollapsed).toBe(false)
  })

  it('resets maximized when switching roots (issue #315 acceptance)', () => {
    const layout = createLayoutStore()
    layout.update((prev) => ({ ...prev, maximized: 'preview' }))
    layoutSetRoot(layout, '/other-project', false)
    expect(layout.getSnapshot().maximized).toBeNull()
  })

  it('keeps maximized when only the preview open state changes on the same root', () => {
    const layout = createLayoutStore()
    layoutSetRoot(layout, '/w', false)
    layout.update((prev) => ({ ...prev, maximized: 'explorer' }))
    layoutSetRoot(layout, '/w', true)
    expect(layout.getSnapshot().maximized).toBe('explorer')
    expect(layout.getSnapshot().previewOpen).toBe(true)
  })
})
