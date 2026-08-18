/**
 * DOM mounting: two React roots rendered into the panel columns the layout
 * controller appends to the frame grid. The roots wait for their columns
 * (the shell mounts asynchronously), and everything is wrapped so a DOM
 * failure degrades the panels, never the GUI boot.
 * @module dsh-filemgr/client/mount
 */

import { createRoot, type Root } from 'react-dom/client'
import type { PanelStores } from './store.ts'
import { ExplorerPanel } from './components/ExplorerPanel.tsx'
import { PreviewPanel } from './preview/PreviewPanel.tsx'
import type { FileReferenceSelection } from './preview/selection.ts'

const EXPLORER_COL_SELECTOR = '[data-filemgr-explorer-col]'
const PREVIEW_COL_SELECTOR = '[data-filemgr-preview-col]'

/** Wait for one selector (the shell/frame mounts after boot settlement). */
function waitForElement(selector: string, onFound: (el: HTMLElement) => void): () => void {
  let disposed = false
  let observer: MutationObserver | undefined
  const tryFind = (): void => {
    if (disposed) return
    const el = document.querySelector<HTMLElement>(selector)
    if (el !== null) {
      observer?.disconnect()
      onFound(el)
    }
  }
  observer = new MutationObserver(() => { tryFind() })
  observer.observe(document.body, { childList: true, subtree: true })
  tryFind()
  return () => {
    disposed = true
    observer?.disconnect()
  }
}

/**
 * Mount both panel roots.
 * @param stores - the panel store bundle.
 * @param onToggleExplorer - collapse toggle (owned by the layout controller).
 * @param onReference - insert a file-reference chip into the draft for a file
 *   (the Explorer row @-reference button); folders should call a different
 *   helper because the chip has no line concept for them.
 * @param onAddFileReference - insert a file-reference chip into the draft for
 *   a preview selection (path + start/end line).
 * @returns a disposer unmounting both trees.
 */
export function mountPanels(
  stores: PanelStores,
  onToggleExplorer: () => void,
  onReference: (path: string, isDir: boolean) => void,
  onAddFileReference: (selection: FileReferenceSelection) => boolean,
): () => void {
  let explorerRoot: Root | undefined
  let previewRoot: Root | undefined
  const disposers: Array<() => void> = []

  disposers.push(waitForElement(EXPLORER_COL_SELECTOR, (el) => {
    explorerRoot = createRoot(el)
    explorerRoot.render(<ExplorerPanel stores={stores} onToggleCollapse={onToggleExplorer} onReference={onReference} />)
  }))
  disposers.push(waitForElement(PREVIEW_COL_SELECTOR, (el) => {
    previewRoot = createRoot(el)
    previewRoot.render(<PreviewPanel stores={stores} onAddFileReference={onAddFileReference} />)
  }))

  return () => {
    for (const dispose of disposers) dispose()
    explorerRoot?.unmount()
    previewRoot?.unmount()
  }
}
