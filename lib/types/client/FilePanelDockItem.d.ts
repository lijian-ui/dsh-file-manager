/**
 * FilePanelDockItem — the file-panel dock button rendered into the conversation
 * session header (the `conversation.session.header.utilities` slot).
 *
 * This plugin owns its own dock button independently: dsh-term renders its own
 * terminal button, dsh-file-manager renders this file-panel button. The two
 * are fully decoupled — install either alone and you get just its button;
 * install both and both buttons appear side by side with shared magnification.
 *
 * Clicking broadcasts `dsh-dock:toggle-filepanel` (handled in dsh-file-manager
 * index); the open state is mirrored back through `dsh-dock:filepanel-state`.
 * @module dsh-file-manager/client/FilePanelDockItem
 */
import { type ReactElement } from 'react';
export declare function FilePanelDockItem(): ReactElement;
//# sourceMappingURL=FilePanelDockItem.d.ts.map