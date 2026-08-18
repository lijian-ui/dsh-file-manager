/**
 * File-picker modal: a pi-desktop-style multi-select tree browser for '@'
 * file/folder references.
 *
 * Trigger: typing `@` (with nothing after it) in the composer opens this
 * modal directly — no inline trigger menu (the shell's trigger menu is a
 * flat candidate list that cannot host a tree). The modal owns a recursive
 * tree with lazy expansion, a workspace filename search, per-row checkboxes
 * for multi-selection, and a chip row of the picked paths.
 *
 * Insertion replaces the `@` token the picker was opened from with the
 * picked references joined by spaces (`@a.ts @src/ @b.md`); cancel drops
 * the stray `@`.
 * @module dsh-filemgr/client/picker/FilePickerModal
 */
import type { JSX } from 'react';
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import type { PanelApi } from '../api.ts';
import { type PickState } from './file-picker.ts';
/** One picked path with its kind (drives the trailing slash on insert). */
export interface PickedPath {
    path: string;
    isDir: boolean;
}
/** The modal surface (portal target; renders only while open). */
export declare function FilePickerModal({ state, api, onInsert, onClose, }: {
    state: PickState;
    api: PanelApi;
    onInsert: (paths: PickedPath[]) => void;
    onClose: () => void;
}): JSX.Element | null;
/** Active `@` mention candidate in the draft (mimics pi-desktop's getActiveMention). */
export declare function findAtMention(value: string, caret: number): {
    start: number;
    query: string;
} | null;
/**
 * The picker host: watches the composer textarea for a bare `@` (opening the
 * modal directly, pi-desktop style — no inline trigger menu), subscribes to
 * the bridge, and renders the modal. Insertion replaces the `@` token span
 * with the picked references joined by spaces; cancel drops the stray `@`.
 */
export declare function FilePickerHost({ ctx, api }: {
    ctx: ClientContext;
    api: PanelApi;
}): JSX.Element;
//# sourceMappingURL=FilePickerModal.d.ts.map