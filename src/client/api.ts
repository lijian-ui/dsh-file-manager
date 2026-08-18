/**
 * Browser client for the host /filemgr/* routes: typed JSON envelope
 * calls plus the SSE change subscription. Same-origin relative fetch (the
 * page and the routes share the webserver).
 * @module dsh-filemgr/client/api
 */

import type {
  DirListing, FileRead, GitBatchResult, GitStatusView, PanelEnvelope, PanelError, SearchView,
} from '../core/types.ts'

/** Transport failure (fetch threw or the response was not JSON). */
const TRANSPORT_ERROR: PanelError = { code: 'internal', message: 'panel route unavailable' }

/** POST one JSON payload and decode the envelope; never throws. */
async function post<T>(path: string, payload: Record<string, unknown>): Promise<PanelEnvelope<T>> {
  let response: Response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    return { ok: false, error: TRANSPORT_ERROR }
  }
  try {
    const envelope = await response.json() as unknown
    if (typeof envelope !== 'object' || envelope === null) return { ok: false, error: TRANSPORT_ERROR }
    const record = envelope as Record<string, unknown>
    if (record.ok === true) return { ok: true, value: record.value as T }
    return { ok: false, error: (record.error as PanelError | undefined) ?? TRANSPORT_ERROR }
  } catch {
    return { ok: false, error: TRANSPORT_ERROR }
  }
}

/** Typed panel operations over the wire. */
export class PanelApi {
  /** List one directory of the project root (rel path; '' = root). */
  list(root: string, path: string): Promise<PanelEnvelope<DirListing>> {
    return post('/filemgr/list', { root, path })
  }

  /** Read one file (text or image data URL). */
  read(root: string, path: string, asImage: boolean): Promise<PanelEnvelope<FileRead>> {
    return post('/filemgr/read', { root, path, asImage })
  }

  /** Write text content back with an optional mtime conflict base. */
  write(root: string, path: string, content: string, baseMtime?: number): Promise<PanelEnvelope<{ mtime: number }>> {
    return post('/filemgr/write', { root, path, content, baseMtime })
  }

  /** Filename search under the root. */
  search(root: string, query: string): Promise<PanelEnvelope<SearchView>> {
    return post('/filemgr/search', { root, query })
  }

  /** Delete a path (untracked discard). */
  delete(root: string, path: string): Promise<PanelEnvelope<{ ok: true }>> {
    return post('/filemgr/delete', { root, path })
  }

  /** Reveal a path in the OS file manager (selecting the entry). */
  reveal(root: string, path: string): Promise<PanelEnvelope<{ ok: true }>> {
    return post('/filemgr/reveal', { root, path })
  }

  /** Open a path with the OS default app. */
  openWithDefault(root: string, path: string): Promise<PanelEnvelope<{ ok: true }>> {
    return post('/filemgr/open-with-default', { root, path })
  }

  /** Rename a path (newName is a bare name, no separators). */
  rename(root: string, path: string, newName: string): Promise<PanelEnvelope<{ ok: true }>> {
    return post('/filemgr/rename', { root, path, newName })
  }

  /** Create a directory at a relative path (parent must exist). */
  mkdir(root: string, path: string): Promise<PanelEnvelope<{ ok: true }>> {
    return post('/filemgr/mkdir', { root, path })
  }

  /** Create an empty file at a relative path (refuses to overwrite). */
  newFile(root: string, path: string): Promise<PanelEnvelope<{ ok: true }>> {
    return post('/filemgr/new-file', { root, path })
  }

  /** The repo status view; null when the root is not a repository. */
  gitStatus(root: string): Promise<PanelEnvelope<GitStatusView | null>> {
    return post('/filemgr/git-status', { root })
  }

  /** The unified diff text of one path (staged = index vs HEAD). */
  gitDiff(root: string, path: string, staged: boolean): Promise<PanelEnvelope<{ content: string }>> {
    return post('/filemgr/git-diff', { root, path, staged })
  }

  /** Stage paths. */
  gitStage(root: string, paths: string[]): Promise<PanelEnvelope<GitBatchResult>> {
    return post('/filemgr/git-stage', { root, paths })
  }

  /** Unstage paths. */
  gitUnstage(root: string, paths: string[]): Promise<PanelEnvelope<GitBatchResult>> {
    return post('/filemgr/git-unstage', { root, paths })
  }

  /** Discard paths (worktree side; untracked paths are deleted). */
  gitDiscard(root: string, paths: string[]): Promise<PanelEnvelope<GitBatchResult>> {
    return post('/filemgr/git-discard', { root, paths })
  }
}

/** One SSE change event pushed by the host. */
export type PanelChangeEvent =
  | { kind: 'fs' }
  | { kind: 'git'; status: GitStatusView }
  | { kind: 'gitUnavailable' }

/**
 * Subscribe to host-pushed changes for one project root (fs watch events and
 * git status polls). Reconnects are handled by the EventSource; the caller
 * re-subscribes when the root changes.
 * @param root - project root to watch.
 * @param onChange - fired on every pushed change.
 * @returns the disposer closing the stream.
 */
export function subscribePanelEvents(root: string, onChange: (event: PanelChangeEvent) => void): () => void {
  const source = new EventSource(`/filemgr/events?root=${encodeURIComponent(root)}`)
  source.addEventListener('change', (raw) => {
    try {
      const event = JSON.parse((raw as MessageEvent).data as string) as PanelChangeEvent
      onChange(event)
    } catch {
      // malformed push; ignore
    }
  })
  return () => { source.close() }
}
