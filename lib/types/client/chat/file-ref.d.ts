/**
 * Chat file-reference click handling (issue #314): the transcript renders
 * workspace file paths as inline code, and clicking one should locate the
 * file in the Explorer (switch to the Files tab, expand the ancestor chain,
 * select the node) and open it in the Preview panel — directories are
 * reveal-only. A document-level click listener (wired in the client apply)
 * recognizes a conservative subset: a single-line `code` element whose text
 * is a workspace-relative path or an absolute path under the project root.
 * Links (`a`), multi-line fences, URLs, escaped (`..`) paths and anything
 * inside the panels' own subtrees keep their existing behavior.
 * @module dsh-filemgr/client/chat/file-ref
 */
import type { PanelApi } from '../api.ts';
import type { PanelStores } from '../store.ts';
/**
 * Interpret a code span's text as a workspace path. Returns the workspace
 * RELATIVE path ('' = the root itself), or null when the text is not a
 * recognizable in-workspace path. Never resolves above the root: `..`
 * segments, absolute outside paths, URLs and whitespace/multi-line text all
 * fall back to null so the transcript keeps its normal behavior.
 */
export declare function pathFromText(text: string, root: string): string | null;
/** The `code` element a click targets, when it is a candidate file ref. */
export declare function fileRefElement(target: EventTarget | null): HTMLElement | null;
/**
 * Locate a workspace-relative path from the transcript: Files tab + expand
 * ancestors + select; directories stay reveal-only, files also open in the
 * Preview panel (dedup focuses the existing tab). The parent listing is
 * consulted to classify the node; unknown paths keep the reveal and never
 * issue a preview request.
 */
export declare function locateFileRef(stores: PanelStores, api: PanelApi, rel: string): Promise<void>;
/** Document-level click handler: locate recognized chat file references. */
export declare function handleFileRefClick(stores: PanelStores, api: PanelApi, event: MouseEvent): void;
//# sourceMappingURL=file-ref.d.ts.map