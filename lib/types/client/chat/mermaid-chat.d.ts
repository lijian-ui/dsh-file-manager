/**
 * Chat-transcript mermaid enhancement: the core conversation renderer emits
 * fenced code as `pre > code.language-mermaid`, and the shell has no slot
 * for message-body post-processing — so this component rides the
 * conversation input dock as a zero-render sentinel and observes the
 * document for mermaid blocks the transcript mounts. Blocks inside the
 * preview panel's own subtree are excluded (each surface owns its blocks).
 *
 * Streaming awareness: an assistant message re-renders continuously, so a
 * diagram fence is often incomplete mid-stream. Renders that fail restore
 * the block and the next mutation retries it — once the fence closes the
 * diagram lands. Mutations are debounced to one rAF so long transcripts do
 * not re-scan the whole document: each batch is mapped to the minimal
 * mutated subtrees and scoped per-frame while the first scheduled pass scans
 * the body once. The observer is disconnected on unmount.
 * @module dsh-filemgr/client/chat/mermaid-chat
 */
import type { JSX } from 'react';
/**
 * Map a mutation batch to the minimal scan scopes that may contain new
 * mermaid fences. Each record contributes its target and its added nodes
 * (an added element directly; otherwise that node's parentElement), deduped
 * by identity. Disconnected nodes and removed-only records yield nothing —
 * removal never introduces a fence. Pure (DOM-read only) so tests can drive
 * it in jsdom.
 */
export declare function enhanceScopesFor(records: MutationRecord[]): Element[];
/** Hidden sentinel: renders nothing, owns the transcript observer. */
export declare function MermaidChatEnhancer(): JSX.Element | null;
//# sourceMappingURL=mermaid-chat.d.ts.map