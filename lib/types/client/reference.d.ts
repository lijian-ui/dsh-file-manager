import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client';
/**
 * Composer draft helpers for file references.
 *
 * References ride the shell's native U+FFFC chip pipeline
 * (`slash/input-insert-reference` bail): the composer shows one chip pill in
 * place of the hidden `@path:lines` token, and the model text is serialized
 * on submit through the `file` reference source's codec (registered in
 * file-source.ts). Without that codec the submit attempt fails with
 * `slash: no serializer for reference source "file"` — the codec MUST stay
 * registered while any chip is in a draft.
 */
/**
 * Minimal structural view of the conversation input service. Declared locally
 * so this helper has no value import from the conversation package (keeps the
 * client bundle purity gate happy).
 */
interface DraftInput {
    state: {
        getSnapshot(): {
            draft: string;
            draftRev: number;
        };
    };
    setDraft(draft: string): void;
}
export interface ConversationService {
    input: {
        for(actx: ClientContext): DraftInput;
    };
}
/** The file-backed reference a composer chip stands for. */
export interface FileReference {
    /** Workspace-relative path (what the agent will read). */
    path: string;
    /** First line of the referenced range (1-based, inclusive). */
    startLine: number;
    /** Last line of the referenced range (1-based, inclusive). */
    endLine: number;
}
/** The `@path:lines` model form (what the codec serializes to on submit). */
export declare function formatFileRefToken(ref: {
    path: string;
    startLine: number;
    endLine: number;
}): string;
/** The DRAFT-REV+CAS span the conversation machine expects for chip inserts. */
export interface RefSpan {
    start: number;
    end: number;
    draftRev: number;
}
/** Append `text` to the session's composer draft (plain text — no chip). */
export declare function appendToDraft(ctx: ClientContext, sessionId: SessionId | undefined, text: string): boolean;
/**
 * Insert a file-reference chip into the composer draft at `span`, replacing
 * its range with an occurrence the machine renders as a `</> name N-M`
 * pill. The model text (`@path:lines`) is serialized on submit by the `file`
 * source's codec (file-source.ts) — never the clipboard text.
 *
 * @returns true when the bail was accepted (CAS will still reject on
 *   stale draftRev — caller can re-read draft after).
 */
export declare function insertFileReference(ctx: ClientContext, sessionId: SessionId | undefined, ref: FileReference, span: RefSpan): boolean;
/**
 * Append a file-reference chip at the end of the current draft (the explorer
 * `@` button and the preview "添加到对话" action path). Reads the latest
 * draft + draftRev from the conversation shell and inserts a zero-length chip
 * there, so the chip lands after whatever the user has already typed.
 *
 * @returns true on success.
 */
export declare function appendFileReferenceChip(ctx: ClientContext, sessionId: SessionId | undefined, ref: FileReference): boolean;
export {};
//# sourceMappingURL=reference.d.ts.map