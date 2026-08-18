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
import type { PreviewTabState } from '../store.ts';
/** The file-backed reference we surface from a preview selection. */
export interface FileReferenceSelection {
    path: string;
    startLine: number;
    endLine: number;
}
/**
 * Build a FileReferenceSelection from a browser selection if it points to a
 * supported preview's `<pre>`. Returns null otherwise (image / pdf / url /
 * non-line content, or a selection that lives outside any code block).
 */
export declare function findFileReferenceSelection(anchorElement: Element | null, selection: Selection, tab: PreviewTabState | null): FileReferenceSelection | null;
//# sourceMappingURL=selection.d.ts.map