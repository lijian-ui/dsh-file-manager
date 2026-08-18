/**
 * Translate a text selection inside the preview into a file reference (path
 * plus start/end line). The selection must live inside a `<pre>` of a file-
 * backed preview (code / text / markdown source / diff); returns null for
 * anything else so the caller can hide the floating action.
 *
 * The reference carries only what the agent needs: the workspace-relative
 * path of the file and the 1-based line range. The selected text itself is
 * not copied into the composer — the agent re-reads the file at the line
 * range when the message is sent.
 * @module dsh-filemgr/client/preview/selection
 */

import type { PreviewTabState } from '../store.ts'

/** The file-backed reference we surface from a preview selection. */
export interface FileReferenceSelection {
  path: string
  startLine: number
  endLine: number
}

/** Content types that map cleanly to line-based references. */
const LINE_BASED_CONTENT_TYPES: ReadonlySet<PreviewTabState['contentType']> = new Set([
  'code',
  'text',
  'markdown', // markdown source-mode selection still maps to text lines
  'diff',
])

/** Number the 1-based line of `offset` within `text` (counting newlines before it). */
function lineOf(text: string, offset: number): number {
  const upto = text.length === 0 ? '' : text.slice(0, Math.max(0, Math.min(offset, text.length)))
  let line = 1
  for (let i = 0; i < upto.length; i += 1) {
    if (upto.charCodeAt(i) === 10) line += 1
  }
  return line
}

/** Return the character offset of (node, offset) measured from the start of `pre`. */
function offsetInPre(pre: HTMLPreElement, node: Node | null, offset: number): number | null {
  if (node === null) return null
  try {
    const range = document.createRange()
    range.setStart(pre, 0)
    range.setEnd(node, offset)
    return range.toString().length
  } catch {
    // Cross-boundary nodes (e.g. detached text) raise; fall through.
    return null
  }
}

/**
 * Build a FileReferenceSelection from a browser selection if it points to a
 * supported preview's `<pre>`. Returns null otherwise (image / pdf / url /
 * non-line content, or a selection that lives outside any code block).
 */
export function findFileReferenceSelection(
  anchorElement: Element | null,
  selection: Selection,
  tab: PreviewTabState | null,
): FileReferenceSelection | null {
  if (anchorElement === null) return null
  if (tab === null || tab.content === null) return null
  if (!LINE_BASED_CONTENT_TYPES.has(tab.contentType)) return null
  const pre = anchorElement.closest('pre') as HTMLPreElement | null
  if (pre === null) return null
  const startInPre = offsetInPre(pre, selection.anchorNode, selection.anchorOffset)
  const endInPre = offsetInPre(pre, selection.focusNode, selection.focusOffset)
  if (startInPre === null || endInPre === null) return null
  const start = Math.min(startInPre, endInPre)
  const end = Math.max(startInPre, endInPre)
  if (start === end) return null
  const text = pre.textContent ?? ''
  return {
    path: tab.path,
    startLine: lineOf(text, start),
    endLine: lineOf(text, end),
  }
}
