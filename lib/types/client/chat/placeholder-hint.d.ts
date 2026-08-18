/**
 * Composer placeholder hint: the shell owns the input-bar placeholder
 * ("给智能体发消息") and exposes no override seam (the composer bar is a
 * single slot owned by ui-conversation, and its locale namespace rejects
 * duplicate registration), so this zero-render sentinel — riding the same
 * `conversation.input.dock` band as the mermaid enhancer — rewrites the
 * placeholder attribute in the DOM. It re-applies on any placeholder
 * attribute change or node insert, which covers React re-renders that
 * reset the attribute to the shell default. English UI is left untouched
 * (exact-match on the Chinese string only).
 * @module dsh-filemgr/client/chat/placeholder-hint
 */
import type { JSX } from 'react';
/** Hidden sentinel: renders nothing, owns the placeholder rewriting observer. */
export declare function PlaceholderHint(): JSX.Element | null;
//# sourceMappingURL=placeholder-hint.d.ts.map