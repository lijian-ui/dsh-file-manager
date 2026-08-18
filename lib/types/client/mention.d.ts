/**
 * The '@' input-trigger source: a lazy directory-tree browser rooted at the
 * active session's cwd, mirroring the Explorer panel's tree. Each keystroke
 * lists the addressed directory on demand (no precomputed index); picking a
 * file lands a plain-text `@<rel-path>` token in the draft — the same readable
 * reference the Explorer's @-reference button inserts, and the Host validates
 * it as an existence-only workspace reference.
 *
 * Directory navigation: the inline trigger menu cannot expand a directory
 * (it closes on pick, and the shell only re-runs trigger detection on
 * keyboard input), so picking a directory opens the tree-browser modal
 * (FilePickerModal) anchored at that directory — a real recursive tree with
 * lazy expansion, mirroring the pi-desktop picker.
 *
 * Type-only imports from @deepseek-ai/dsh-client-ui-input-trigger/client keep
 * the client bundle purity gate satisfied (the service itself is injected by
 * the shell, never bundled here).
 * @module dsh-filemgr/client/mention
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import type { InputTriggerServiceContract, InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client';
import type { PanelApi } from './api.ts';
declare module '@deepseek-ai/dsh-client-ui-input-trigger/client' {
    interface InputTriggerCandidate {
        /** Workspace-relative path (the token we insert). */
        readonly value?: string;
        /** Whether the entry is a directory (drives the trailing-slash suffix). */
        readonly fmIsDir?: boolean;
    }
}
/** Owner source name (lexicon + decoration routing key). Unique per trigger. */
export declare const SOURCE_NAME = "file-manager";
/**
 * Build the '@' trigger source over the injected root context + the PanelApi.
 * One source per plugin fiber; it reads the live session root on every key so
 * switching sessions re-roots the browser automatically.
 * @param ctx - root client context (captured for session projection).
 * @param api - the panel fs client (lists directories on demand).
 * @returns the source to register with `inputTriggers.registerSource`.
 */
export declare function createFileMentionSource(ctx: ClientContext, api: PanelApi): InputTriggerSource;
/** The typed service contract the shell injects as `inputTriggers`. */
export type { InputTriggerServiceContract };
//# sourceMappingURL=mention.d.ts.map