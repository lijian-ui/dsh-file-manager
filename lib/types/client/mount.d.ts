/**
 * DOM mounting: two React roots rendered into the panel columns the layout
 * controller appends to the frame grid. The roots wait for their columns
 * (the shell mounts asynchronously), and everything is wrapped so a DOM
 * failure degrades the panels, never the GUI boot.
 * @module dsh-filemgr/client/mount
 */
import type { PanelStores } from './store.ts';
import type { FileReferenceSelection } from './preview/selection.ts';
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
export declare function mountPanels(stores: PanelStores, onToggleExplorer: () => void, onReference: (path: string, isDir: boolean) => void, onAddFileReference: (selection: FileReferenceSelection) => boolean): () => void;
//# sourceMappingURL=mount.d.ts.map