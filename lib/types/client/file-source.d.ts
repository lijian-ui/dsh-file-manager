/**
 * The `file` input-trigger source: registers the reference codec the shell's
 * submit pipeline needs to serialize a file chip (`slash: no serializer for
 * reference source "file"` disappears once this source is in the roster).
 *
 * The source is deliberately INERT as a menu participant: the file picker is
 * our own pi-desktop-style tree modal (see picker/FilePickerModal.tsx), not
 * the shell's flat trigger menu, so `candidates` returns nothing and `onPick`
 * never fires. Its only jobs are (1) to be findable by
 * `inputTriggers.serializeReference('file', ref)` and (2) to own the model
 * projection of a chip — the `@path:lines` plain-text token.
 *
 * Trigger '@' keeps the chip family visually consistent with the other '@'
 * sources; the menu group this source contributes is empty and is covered by
 * the picker modal the moment a bare `@` lands.
 * @module dsh-filemgr/client/file-source
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** The roster name the chip occurrences address (see reference.ts). */
export declare const FILE_SOURCE_NAME = "file";
/** Required services: the trigger roster plus the session scope carrier. */
export declare const inject: string[];
/**
 * Register the inert `file` reference source (codec only). Safe to call
 * multiple times (each call returns a disposer; the roster rejects a
 * duplicate (trigger, name) seat, so guard with a module flag).
 */
export declare function registerFileReferenceSource(ctx: ClientContext): () => void;
//# sourceMappingURL=file-source.d.ts.map