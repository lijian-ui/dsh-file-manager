/**
 * Pure drag-to-composer helpers shared by the explorer rows (the drag
 * source) and the composer dock inlay (the drop target): the custom MIME
 * type, the drag-state detector, and the draft-splicing rule. Deliberately
 * framework-free so the splicing math is unit-testable in isolation.
 *
 * The composer host only accepts OS image drops (its document-level drop
 * handler checks `dataTransfer.types` for `Files` and routes through the
 * image pipeline), so a workspace file needs its own MIME. A plain relative
 * path is inserted into the draft — the agent reads the file through its
 * existing tools without any prefix grammar.
 * @module dsh-filemgr/client/drag/file-drag
 */
/** Custom MIME carrying a workspace-relative file path. */
export declare const FILE_DRAG_MIME = "application/x-dsh-file";
/**
 * Whether a drag event carries our file payload.
 * @param types - the live `dataTransfer.types` list (read-only during drag).
 * @returns true when our MIME is present.
 */
export declare function hasFileDrag(types: readonly string[] | undefined): boolean;
/**
 * Whether a drop payload is a plausible workspace-relative path. The custom
 * MIME only proves the drag carries *some* string — a foreign page can set it
 * too, so the payload itself is validated before it reaches the draft:
 * relative POSIX shape only; no absolute paths, no '..' segments, no
 * backslashes, no control characters, and a sane length.
 * @param path - the raw payload from dataTransfer.
 * @returns true when the payload is safe to splice into the draft.
 */
export declare function isValidFileDragPayload(path: string): boolean;
/**
 * Splice a workspace-relative path into a composer draft at the caret.
 *
 * Separator rule: one space is added before the path unless the caret sits
 * at the start of the draft or right after whitespace; one space is added
 * after the path unless the caret sits at the end of the draft or right
 * before whitespace. Empty path or an out-of-range caret are no-ops.
 *
 * @param draft - the current draft text.
 * @param path - the relative path to insert.
 * @param caret - insertion offset (default: the end of the draft).
 * @returns the next draft; the caller owns writing it through the input
 * facade.
 */
export declare function insertPathIntoDraft(draft: string, path: string, caret?: number): string;
//# sourceMappingURL=file-drag.d.ts.map