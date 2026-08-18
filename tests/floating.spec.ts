/**
 * Floating expand button geometry tests (issues #374 / #292): the vertical
 * clamp keeps the button inside the usable range (below the WCO titlebar
 * strip when one is reported), the default docks at the top-right corner
 * aligned with the explorer's collapse chevron, and the titlebar height
 * comes from navigator.windowControlsOverlay.
 */
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import {
  COLLAPSE_CHEVRON_TOP_PX, FLOATING_BUTTON_HEIGHT_PX, FLOATING_MARGIN_PX,
  topAlignedFloatingTop, clampFloatingTop, titlebarAreaHeight,
} from '../src/client/floating.ts'

const H = FLOATING_BUTTON_HEIGHT_PX
const M = FLOATING_MARGIN_PX

afterEach(() => {
  Object.defineProperty(navigator, 'windowControlsOverlay', { value: undefined, configurable: true })
})

describe('clampFloatingTop', () => {
  it('keeps an in-range top unchanged', () => {
    expect(clampFloatingTop(200, 900, H, 0)).toBe(200)
  })

  it('floors at the margin below the titlebar', () => {
    expect(clampFloatingTop(-40, 900, H, 36)).toBe(36 + M)
    expect(clampFloatingTop(0, 900, H, 0)).toBe(M)
  })

  it('caps at viewport minus button minus margin', () => {
    expect(clampFloatingTop(9999, 900, H, 0)).toBe(900 - H - M)
  })

  it('clamps non-finite values to the floor', () => {
    expect(clampFloatingTop(Number.NaN, 900, H, 0)).toBe(M)
  })

  it('never lets the max sink below the min on tiny viewports', () => {
    const top = clampFloatingTop(50, 40, H, 0)
    expect(top).toBeGreaterThanOrEqual(0)
    expect(Number.isFinite(top)).toBe(true)
  })
})

describe('topAlignedFloatingTop', () => {
  it('docks at the chevron row without a titlebar', () => {
    expect(topAlignedFloatingTop(900, H, 0)).toBe(COLLAPSE_CHEVRON_TOP_PX)
  })

  it('stays in the chevron row below the WCO titlebar (issue #292)', () => {
    const titlebar = 36
    expect(topAlignedFloatingTop(900, H, titlebar)).toBe(titlebar + COLLAPSE_CHEVRON_TOP_PX)
  })

  it('clamps when the titlebar eats most of the viewport', () => {
    expect(topAlignedFloatingTop(60, H, 50)).toBe(50 + COLLAPSE_CHEVRON_TOP_PX)
  })
})

describe('titlebarAreaHeight', () => {
  it('is 0 in a plain browser tab', () => {
    expect(titlebarAreaHeight()).toBe(0)
  })

  it('reads the overlay rect when visible', () => {
    Object.defineProperty(navigator, 'windowControlsOverlay', {
      value: { visible: true, getTitlebarAreaRect: () => ({ height: 36 }) },
      configurable: true,
    })
    expect(titlebarAreaHeight()).toBe(36)
  })

  it('stays 0 when the overlay is invisible', () => {
    Object.defineProperty(navigator, 'windowControlsOverlay', {
      value: { visible: false, getTitlebarAreaRect: () => ({ height: 36 }) },
      configurable: true,
    })
    expect(titlebarAreaHeight()).toBe(0)
  })

  it('survives a throwing getTitlebarAreaRect', () => {
    Object.defineProperty(navigator, 'windowControlsOverlay', {
      value: { visible: true, getTitlebarAreaRect: () => { throw new Error('boom') } },
      configurable: true,
    })
    expect(titlebarAreaHeight()).toBe(0)
  })
})
