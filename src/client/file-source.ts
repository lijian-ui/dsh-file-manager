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

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client'

/** The roster name the chip occurrences address (see reference.ts). */
export const FILE_SOURCE_NAME = 'file'

/** Required services: the trigger roster plus the session scope carrier. */
export const inject = ['inputTriggers']

/**
 * Register the inert `file` reference source (codec only). Safe to call
 * multiple times (each call returns a disposer; the roster rejects a
 * duplicate (trigger, name) seat, so guard with a module flag).
 */
export function registerFileReferenceSource(ctx: ClientContext): () => void {
  // ctx.get — not property access: the caller (index.ts apply) does not
  // declare 'inputTriggers' in its inject list, and property access would
  // throw "cannot get property without inject". get() needs no inject.
  const inputTriggers = (ctx.get as (name: string) => unknown)('inputTriggers') as
    | { registerSource(src: InputTriggerSource): () => void }
    | undefined
  if (inputTriggers === undefined) return () => {}
  const source: InputTriggerSource = {
    trigger: '@',
    name: FILE_SOURCE_NAME,
    candidates: async () => [],
    onPick: () => undefined,
    codec: {
      clipboardText: (ref) => ref,
      serialize: (ref, _signal) => Promise.resolve(ref),
    },
  }
  try {
    return inputTriggers.registerSource(source)
  } catch (error) {
    // Duplicate registration (HMR remount) is not a failure.
    console.warn('[dsh-filemgr] file reference source already registered:', error)
    return () => {}
  }
}
