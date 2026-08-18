/**
 * Attached file reference pills, rendered in the `conversation.input.dock`
 * band directly above the composer card.
 *
 * Design: the composer draft is the single source of truth. The pill row is
 * a pure visual scan of `@<path>:<line>` tokens in the live draft — no
 * occurrence table, no `slash/input-insert-reference` bail (that path
 * requires a registered codec and fails with
 * `no serializer for reference source "file"`), so sending is always a
 * plain-text sink. Because the row derives from the draft, every mutation
 * (typing, backspace, send, session switch) updates the pills for free.
 *
 * Each pill shows the basename (directory suffix only when the basename is
 * ambiguous), the line range, and a dismiss × that removes the token from
 * the draft. The full relative path rides the title tooltip.
 * @module dsh-filemgr/client/chat/AttachedFilesDock
 */
import type { JSX } from 'react';
import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client';
/** Minimal structural view of the conversation input service (see reference.ts). */
interface DraftInput {
    state: {
        getSnapshot(): {
            draft: string;
            draftRev: number;
        };
        subscribe(listener: () => void): () => void;
    };
    setDraft(draft: string): void;
}
interface ConversationService {
    input: {
        for(actx: ClientContext): DraftInput;
    };
}
/**
 * The dock entry: subscribes to the session's draft and renders one pill per
 * `@path:line` token. Renders nothing while the draft carries no references.
 * @param sessionId - the addressed session (the dock is session-scoped).
 * @param sessions - session scope resolver (actx for the input shell).
 * @param conversation - conversation service face.
 */
export declare function AttachedFilesDock({ sessionId, sessions, conversation, }: {
    sessionId: SessionId;
    sessions: {
        scope(id: SessionId): ClientContext | undefined;
    };
    conversation: ConversationService;
}): JSX.Element | null;
export {};
//# sourceMappingURL=AttachedFilesDock.d.ts.map