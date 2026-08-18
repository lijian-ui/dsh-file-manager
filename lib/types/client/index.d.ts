/**
 * FileManager right-panel system — browser half: mounts the explorer and preview
 * columns into the web shell's frame grid (through the layout controller),
 * binds the four stores to the live client runtime (the active session's cwd
 * is the project root), subscribes to the host change stream (fs + git), and
 * follows the shell's dark marker (body[data-ds-dark-theme]) via CSS only.
 *
 * Failure policy: every DOM/runtime wiring failure is logged, never thrown —
 * the web shell fails the whole boot when a plugin apply throws.
 *
 * FileManager right-panel design (Apache-2.0, iOfficeAI/FileManager) — re-implemented
 * from measured behavior and architecture, not copied code.
 * @module dsh-filemgr/client
 */
import type { ClientContext, SettingsScope, SettingsScopeSpec } from '@deepseek-ai/dsh-client-runtime/client';
import { type FileManagerPanelKey } from './locales.ts';
import './styles/chip.module.css';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Panel surface copy. */
        'filemgr': FileManagerPanelKey;
    }
    interface SlotMap {
        /**
         * One family plugin card inside the Web UI Plugins group. Spelled here
         * with the same shape so this package can register without depending on
         * the sibling web-ui-settings package.
         */
        'web-ui.plugin.item': {
            kind: 'list';
            scope: 'root';
            owner: SettingsPluginItemOwnerProps;
        };
    }
}
/** Owner share of a plugin card (the section supplies nothing). */
export interface SettingsPluginItemOwnerProps {
    /** Marker field: card owner props are intentionally empty. */
    children?: never;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        /**
         * Optional rc.6 compatibility binder provided by dsh-web-ui-settings;
         * absent when that group plugin is not installed, so callers fall back to
         * the official settings scope.
         */
        webUiSettings?: {
            bind<S>(spec: SettingsScopeSpec<S>): SettingsScope<S>;
        };
    }
}
/** Required services: sessions for the project root, locale for the copy, the settings scope for the master switch, and conversation for the composer draft edits (picker insert / @ button). */
export declare const inject: string[];
/** Apply the browser half. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map