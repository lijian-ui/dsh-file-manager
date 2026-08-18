/**
 * The Explorer column: Files/Changes tab bar (37px), the persistent filename
 * search at the top of the Files tab (150ms debounced; a hit click REVEALS
 * the file in the tree — expand ancestors + select — never opens preview),
 * the lazy file tree (34px rows, full-row expand/collapse, 16px icons), and
 * the in-column collapse chevron.
 *
 * FileManager Explorer behavior (Apache-2.0, re-implemented): row click toggles
 * folders (no need to hit the arrow), search results are reveal-only, and
 * clicking a file opens it in the preview panel (dedup focuses the tab).
 * @module dsh-filemgr/client/components/ExplorerPanel
 */
import type { JSX } from 'react';
import type { PanelStores } from '../store.ts';
import '../styles/tokens.module.css';
/**
 * The whole explorer column content.
 * @param stores - the panel store bundle.
 * @param onToggleCollapse - collapse the column (host chrome).
 */
export declare function ExplorerPanel({ stores, onToggleCollapse, onReference, }: {
    stores: PanelStores;
    onToggleCollapse: () => void;
    onReference: (path: string, isDir: boolean) => void;
}): JSX.Element;
//# sourceMappingURL=ExplorerPanel.d.ts.map