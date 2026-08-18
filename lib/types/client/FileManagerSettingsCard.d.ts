/**
 * The filemgr settings card: the total on/off switch (issue #307).
 * Registers into the `web-ui.plugin.item` slot the Web UI Plugins group
 * renders, bound to the `filemgr` settings namespace through the family
 * settings bridge (or the official settings scope when the deployment exposes
 * the namespace directly). Turning the panel off unmounts the right-panel
 * columns, the floating expand button, the /filemgr/* routes and the
 * workspace fs watch + git polling behind them.
 * @module @lijian-ui/dsh-file-manager/client/FileManagerSettingsCard
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import { type CardActions, type CardShell, type FieldState as CardFieldState } from './settings-form.ts';
/** The filemgr fields this card edits (the namespace's full schema). */
export interface FileManagerPanelSettings {
    /** Whether the right-panel system (columns, floating button, routes, watch/polling) is mounted at all; default on. */
    enabled?: boolean;
}
/** What the filemgr card renders. */
export interface FileManagerSettingsCardState extends CardShell {
    enabled: CardFieldState;
}
/** The registration-side face the card's slot entry injects. */
export interface FileManagerSettingsCardFace extends CardActions {
    hooks: {
        /** Card snapshot bound by the renderer as useFilemgrSettingsCard. */
        filemgrSettingsCard: SnapshotStore<FileManagerSettingsCardState>;
    };
}
/** Bridges the `filemgr` scope onto the card's staged form. */
export declare class FileManagerSettingsCardController {
    private readonly form;
    private readonly store;
    /** @param scope - the bound settings scope for the `filemgr` namespace. */
    constructor(scope: SettingsScope<FileManagerPanelSettings>);
    private projection;
    /**
     * Build the face the card's slot registration injects.
     * @returns the card's snapshot and its form actions.
     */
    inject(): FileManagerSettingsCardFace;
    /**
     * Release the card's scope subscription and bound stores; the slot
     * disposer calls this on teardown.
     */
    dispose(): void;
}
/** Props the renderer binds for the filemgr card. */
export type FileManagerSettingsCardProps = PropsRuntime<'web-ui.plugin.item'> & PropsLocale<'filemgr'> & InjectFace<FileManagerSettingsCardFace>;
/**
 * Render the filemgr card.
 * @param props - locale copy, the card snapshot, and its form actions.
 * @returns the card.
 */
export declare function FileManagerSettingsCard(props: FileManagerSettingsCardProps): import("react").JSX.Element;
//# sourceMappingURL=FileManagerSettingsCard.d.ts.map