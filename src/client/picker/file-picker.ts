/**
 * File-picker bridge: the single channel between the '@' trigger source
 * (which asks for a directory) and the tree-browser modal (which renders it).
 *
 * Why a modal and not the inline trigger menu: the shell's trigger menu is a
 * flat candidate list with no tree affordance — picking a directory cannot
 * expand it (the menu closes on pick, and the shell only re-runs trigger
 * detection on keyboard input, not on programmatic draft writes). The modal
 * is the pi-desktop-style answer: a real directory tree with lazy expansion,
 * a search box, and one-click insertion.
 *
 * The bridge is framework-free (subscribe/getSnapshot/open/close) so the
 * trigger source can open the picker without touching React; the modal host
 * component subscribes and renders. Insertion happens through the
 * conversation input shell, replacing the exact `@` token span the picker
 * was opened from.
 * @module dsh-filemgr/client/picker/file-picker
 */

import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'

/** The `@` token span captured when the picker opened (replace-on-insert). */
export interface PickSpan {
  /** Start offset of the `@` token in the draft. */
  start: number
  /** End offset (the caret). */
  end: number
}

/** What the picker is currently anchored to. */
export interface PickRequest {
  /** Session whose draft the picker will edit. */
  sessionId: SessionId
  /** Project root (canonical cwd) everything is relative to. */
  root: string
  /** Directory to start browsing at ('' = root). */
  initialDir: string
  /** The `@` token span to replace on insert. */
  span: PickSpan
}

/** The bridge's public snapshot. */
export interface PickState {
  open: boolean
  req: PickRequest | null
}

/** Minimal listener shape. */
type Listener = (state: PickState) => void

/** Framework-free singleton store backing the modal. */
class FilePickerBridge {
  private state: PickState = { open: false, req: null }
  private readonly listeners = new Set<Listener>()

  /** Current snapshot (stable reference until the next open/close). */
  getSnapshot(): PickState {
    return this.state
  }

  /** Subscribe to open/close transitions. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /** Open the picker anchored to one `@` token. */
  open(req: PickRequest): void {
    this.state = { open: true, req }
    this.emit()
  }

  /** Close the picker without inserting anything. */
  close(): void {
    if (!this.state.open) return
    this.state = { open: false, req: null }
    this.emit()
  }

  private emit(): void {
    for (const listener of this.listeners) listener(this.state)
  }
}

/** The shared singleton instance. */
export const filePicker = new FilePickerBridge()
