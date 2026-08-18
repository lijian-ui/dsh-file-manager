/**
 * Chat file-reference click tests (issue #314): path recognition accepts a
 * conservative in-workspace subset (relative / absolute / Windows
 * separators; URLs, multi-line fences, escapes, whitespace and outside
 * paths stay inert), the click target must be a transcript code span (not a
 * link, not panel chrome), and locating switches to the Files tab, expands
 * and selects the node, and opens files — but only files — in the preview.
 */
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { DirListing, FsEntry, PanelEnvelope } from '../src/core/types.ts'
import { createPanelStores, layoutSetRoot, type PanelStores } from '../src/client/store.ts'
import type { PanelApi } from '../src/client/api.ts'
import { fileRefElement, handleFileRefClick, locateFileRef, pathFromText } from '../src/client/chat/file-ref.ts'

const ROOT = '/w'

function fakeApi(listing: (path: string) => FsEntry[]): PanelApi {
  return {
    list: async (root: string, path: string): Promise<PanelEnvelope<DirListing>> => ({
      ok: true, value: { root, entries: listing(path) },
    }),
    read: async (): Promise<PanelEnvelope<{ content: string; truncated: boolean; size: number; mtime: number }>> => ({
      ok: true, value: { content: '# hi', truncated: false, size: 4, mtime: 10 },
    }),
  } as unknown as PanelApi
}

/** Default fixture: src/ (dir) + README.md + src/client/index.ts. */
const fixtureApi = fakeApi((path) => {
  if (path === '') {
    return [
      { name: 'src', path: 'src', isDir: true, size: 0, mtime: 0 },
      { name: 'README.md', path: 'README.md', isDir: false, size: 10, mtime: 1 },
    ]
  }
  if (path === 'src') {
    return [
      { name: 'client', path: 'src/client', isDir: true, size: 0, mtime: 0 },
    ]
  }
  if (path === 'src/client') {
    return [
      { name: 'index.ts', path: 'src/client/index.ts', isDir: false, size: 20, mtime: 2 },
    ]
  }
  return []
})

let stores: PanelStores
let api: PanelApi
let clickListener: ((event: Event) => void) | null = null

beforeEach(() => {
  localStorage.clear()
  document.body.innerHTML = ''
  api = fixtureApi
  stores = createPanelStores(api)
  layoutSetRoot(stores.layout, ROOT, false)
  stores.explorer.setRoot(ROOT)
  stores.preview.setRoot(ROOT)
  // The production wiring listens on document; mirror it for the click tests.
  clickListener = (event) => { handleFileRefClick(stores, api, event as MouseEvent) }
  document.addEventListener('click', clickListener)
})

afterEach(() => {
  if (clickListener !== null) document.removeEventListener('click', clickListener)
  clickListener = null
  document.body.innerHTML = ''
})

describe('pathFromText', () => {
  it('accepts a workspace-relative path', () => {
    expect(pathFromText('src/client/index.ts', ROOT)).toBe('src/client/index.ts')
    expect(pathFromText('./README.md', ROOT)).toBe('README.md')
  })

  it('accepts a bare dotted filename', () => {
    expect(pathFromText('README.md', ROOT)).toBe('README.md')
  })

  it('rejects a bare word without a file extension', () => {
    expect(pathFromText('src', ROOT)).toBeNull()
    expect(pathFromText('hello', ROOT)).toBeNull()
  })

  it('accepts an absolute path inside the workspace', () => {
    expect(pathFromText('/w/src/client/index.ts', ROOT)).toBe('src/client/index.ts')
    expect(pathFromText(ROOT, ROOT)).toBe('')
  })

  it('rejects absolute paths outside the workspace', () => {
    expect(pathFromText('/etc/passwd', ROOT)).toBeNull()
    expect(pathFromText('/w2/other.ts', ROOT)).toBeNull()
    expect(pathFromText('/w-sub/a.ts', ROOT)).toBeNull()
  })

  it('accepts Windows separators and drive-letter roots case-insensitively', () => {
    expect(pathFromText('src\\client\\index.ts', 'C:\\work')).toBe('src/client/index.ts')
    expect(pathFromText('C:\\Work\\src\\a.ts', 'C:\\work')).toBe('src/a.ts')
    expect(pathFromText('D:\\other\\a.ts', 'C:\\work')).toBeNull()
  })

  it('rejects URLs', () => {
    expect(pathFromText('https://example.com/a/b', ROOT)).toBeNull()
    expect(pathFromText('file:///etc/passwd', ROOT)).toBeNull()
  })

  it('rejects multi-line and whitespace text', () => {
    expect(pathFromText('src/a.ts\nsrc/b.ts', ROOT)).toBeNull()
    expect(pathFromText('src/my file.ts', ROOT)).toBeNull()
  })

  it('rejects path escapes and empty segments', () => {
    expect(pathFromText('../etc/passwd', ROOT)).toBeNull()
    expect(pathFromText('src/../secret.ts', ROOT)).toBeNull()
    expect(pathFromText('src//a.ts', ROOT)).toBeNull()
    expect(pathFromText('.', ROOT)).toBeNull()
  })

  it('rejects oversized text', () => {
    expect(pathFromText('a/'.repeat(400), ROOT)).toBeNull()
  })
})

describe('fileRefElement', () => {
  it('returns the code element of a transcript click', () => {
    document.body.innerHTML = '<div class="msg"><code>src/client/index.ts</code></div>'
    const code = document.querySelector('code')
    expect(code).not.toBeNull()
    expect(fileRefElement(code)).toBe(code)
  })

  it('returns null for non-code targets', () => {
    document.body.innerHTML = '<div class="msg"><span>plain</span></div>'
    expect(fileRefElement(document.querySelector('span'))).toBeNull()
  })

  it('returns null inside a link', () => {
    document.body.innerHTML = '<div class="msg"><a href="#"><code>src/a.ts</code></a></div>'
    expect(fileRefElement(document.querySelector('code'))).toBeNull()
  })

  it('returns null inside panel chrome', () => {
    document.body.innerHTML = '<div class="filemgr-root"><code>src/a.ts</code></div>'
    expect(fileRefElement(document.querySelector('code'))).toBeNull()
  })
})

describe('locateFileRef', () => {
  it('switches to Files, reveals and opens a file in the preview', async () => {
    await locateFileRef(stores, api, 'src/client/index.ts')
    const explorer = stores.explorer.getSnapshot()
    expect(explorer.activeTab).toBe('files')
    expect(explorer.selected).toBe('src/client/index.ts')
    expect(explorer.expanded).toContain('src')
    expect(explorer.expanded).toContain('src/client')
    const preview = stores.preview.getSnapshot()
    expect(preview.open).toBe(true)
    expect(preview.tabs.some((tab) => tab.path === 'src/client/index.ts')).toBe(true)
  })

  it('reveals a directory without opening the preview', async () => {
    await locateFileRef(stores, api, 'src')
    const explorer = stores.explorer.getSnapshot()
    expect(explorer.activeTab).toBe('files')
    expect(explorer.selected).toBe('src')
    // The dir itself expands (its children are the next level to browse).
    expect(explorer.expanded).toContain('src')
    expect(stores.preview.getSnapshot().open).toBe(false)
  })

  it('reveals an unknown path without issuing a preview request', async () => {
    await locateFileRef(stores, api, 'nope/missing.ts')
    expect(stores.explorer.getSnapshot().selected).toBe('nope/missing.ts')
    expect(stores.preview.getSnapshot().open).toBe(false)
  })

  it('does nothing for the root itself', async () => {
    await locateFileRef(stores, api, '')
    expect(stores.explorer.getSnapshot().activeTab).toBe('files')
    expect(stores.preview.getSnapshot().open).toBe(false)
  })
})

describe('handleFileRefClick', () => {
  it('locates a clicked transcript code path', async () => {
    document.body.innerHTML = '<div class="msg"><code>src/client/index.ts</code></div>'
    const code = document.querySelector('code') as HTMLElement
    code.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(stores.explorer.getSnapshot().selected).toBe('src/client/index.ts')
    expect(stores.preview.getSnapshot().open).toBe(true)
  })

  it('ignores non-path code clicks', async () => {
    document.body.innerHTML = '<div class="msg"><code>npm run build</code></div>'
    const code = document.querySelector('code') as HTMLElement
    code.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(stores.explorer.getSnapshot().selected).toBeNull()
  })

  it('un-collapses the explorer so the reveal is visible', async () => {
    stores.layout.update((prev) => ({ ...prev, explorerCollapsed: true }))
    document.body.innerHTML = '<div class="msg"><code>README.md</code></div>'
    const code = document.querySelector('code') as HTMLElement
    code.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(stores.layout.getSnapshot().explorerCollapsed).toBe(false)
    expect(localStorage.getItem('project-panel-collapse:' + ROOT)).toBe('expanded')
  })

  it('stays inert without a bound project root', async () => {
    layoutSetRoot(stores.layout, '', false)
    document.body.innerHTML = '<div class="msg"><code>README.md</code></div>'
    const code = document.querySelector('code') as HTMLElement
    code.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(stores.explorer.getSnapshot().selected).toBeNull()
  })
})
