import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'

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
  state: { getSnapshot(): { draft: string; draftRev: number } }
  setDraft(draft: string): void
}
export interface ConversationService {
  input: { for(actx: ClientContext): DraftInput }
}

/** The file-backed reference a composer chip stands for. */
export interface FileReference {
  /** Workspace-relative path (what the agent will read). */
  path: string
  /** First line of the referenced range (1-based, inclusive). */
  startLine: number
  /** Last line of the referenced range (1-based, inclusive). */
  endLine: number
}

/** Basename of a `/`-separated relative path ('' when empty). */
function basenameOf(rel: string): string {
  const idx = rel.lastIndexOf('/')
  return idx >= 0 ? rel.slice(idx + 1) : rel
}

/** Directory of a `/`-separated relative path ('' when none). */
function dirnameOf(rel: string): string {
  const idx = rel.lastIndexOf('/')
  return idx > 0 ? rel.slice(0, idx) : ''
}

/**
 * The chip label: basename, or `basename - dir` when the basename is
 * ambiguous across the workspace (matches the reference screenshot: a short
 * name plus the line range, never the full path).
 */
function formatRefLabel(ref: FileReference): string {
  const basename = basenameOf(ref.path)
  const dirname = dirnameOf(ref.path)
  const name = dirname === '' ? basename : `${basename} - ${dirname}`
  return ref.endLine > ref.startLine ? `${name} ${ref.startLine}-${ref.endLine}` : `${name} ${ref.startLine}`
}

/** The `@path:lines` model form (what the codec serializes to on submit). */
export function formatFileRefToken(ref: { path: string; startLine: number; endLine: number }): string {
  const range = ref.endLine > ref.startLine ? `${ref.startLine}-${ref.endLine}` : `${ref.startLine}`
  return `@${ref.path}:${range}`
}

/** Reference shape the conversation machine mints into a chip occurrence. */
interface ConversationReference {
  source: string
  ref: string
  label: string
  clipboardText: string
}

/** The DRAFT-REV+CAS span the conversation machine expects for chip inserts. */
export interface RefSpan {
  start: number
  end: number
  draftRev: number
}

/** Append `text` to the session's composer draft (plain text — no chip). */
export function appendToDraft(ctx: ClientContext, sessionId: SessionId | undefined, text: string): boolean {
  try {
    if (sessionId === undefined) return false
    const actx = ctx.sessions.scope(sessionId)
    if (actx === undefined) return false
    const conversation = (ctx as unknown as { conversation?: ConversationService }).conversation
    if (conversation === undefined) return false
    const input = conversation.input.for(actx as unknown as ClientContext)
    const draft = input.state.getSnapshot().draft
    input.setDraft(draft.trim() === '' ? text : `${draft} ${text}`)
    return true
  } catch (error) {
    console.warn('[dsh-filemgr] draft insert failed:', error)
    return false
  }
}

/**
 * Insert a file-reference chip into the composer draft at `span`, replacing
 * its range with an occurrence the machine renders as a `</> name N-M`
 * pill. The model text (`@path:lines`) is serialized on submit by the `file`
 * source's codec (file-source.ts) — never the clipboard text.
 *
 * @returns true when the bail was accepted (CAS will still reject on
 *   stale draftRev — caller can re-read draft after).
 */
export function insertFileReference(
  ctx: ClientContext,
  sessionId: SessionId | undefined,
  ref: FileReference,
  span: RefSpan,
): boolean {
  try {
    if (sessionId === undefined) return false
    const actx = ctx.sessions.scope(sessionId)
    if (actx === undefined) return false
    const reference: ConversationReference = {
      source: 'file',
      ref: formatFileRefToken(ref),
      label: formatRefLabel(ref),
      clipboardText: formatFileRefToken(ref),
    }
    return (actx as unknown as {
      bail(target: unknown, event: string, payload: unknown): boolean
    }).bail(actx, 'slash/input-insert-reference', { reference, span })
  } catch (error) {
    console.warn('[dsh-filemgr] file-reference insert failed:', error)
    return false
  }
}

/**
 * Append a file-reference chip at the end of the current draft (the explorer
 * `@` button and the preview "添加到对话" action path). Reads the latest
 * draft + draftRev from the conversation shell and inserts a zero-length chip
 * there, so the chip lands after whatever the user has already typed.
 *
 * @returns true on success.
 */
export function appendFileReferenceChip(
  ctx: ClientContext,
  sessionId: SessionId | undefined,
  ref: FileReference,
): boolean {
  if (sessionId === undefined) return false
  const actx = ctx.sessions.scope(sessionId)
  if (actx === undefined) return false
  const conversation = (ctx as unknown as { conversation?: ConversationService }).conversation
  if (conversation === undefined) return false
  const shell = conversation.input.for(actx as unknown as ClientContext)
  const snap = shell.state.getSnapshot()
  return insertFileReference(
    ctx,
    sessionId,
    ref,
    { start: snap.draft.length, end: snap.draft.length, draftRev: snap.draftRev },
  )
}
