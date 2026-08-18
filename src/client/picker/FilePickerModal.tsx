/**
 * File-picker modal: a pi-desktop-style multi-select tree browser for '@'
 * file/folder references.
 *
 * Trigger: typing `@` (with nothing after it) in the composer opens this
 * modal directly — no inline trigger menu (the shell's trigger menu is a
 * flat candidate list that cannot host a tree). The modal owns a recursive
 * tree with lazy expansion, a workspace filename search, per-row checkboxes
 * for multi-selection, and a chip row of the picked paths.
 *
 * Insertion replaces the `@` token the picker was opened from with the
 * picked references joined by spaces (`@a.ts @src/ @b.md`); cancel drops
 * the stray `@`.
 * @module dsh-filemgr/client/picker/FilePickerModal
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { JSX } from 'react'
import { createPortal } from 'react-dom'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { FsEntry, SearchHit } from '../../core/types.ts'
import type { PanelApi } from '../api.ts'
import { filePicker, type PickState } from './file-picker.ts'
import { ChevronDownIcon, ChevronRightIcon, CloseIcon, FileIcon, FolderIcon, FolderOpenIcon, SearchIcon } from '../components/icons.tsx'
import { appendToDraft, insertFileReference, type RefSpan } from '../reference.ts'
import pickerCss from '../styles/picker.module.css'

/** Debounce for the workspace search box. */
const SEARCH_DEBOUNCE_MS = 200

/** Split a relative path into its ancestor chain ('' when empty). */
function ancestors(rel: string): string[] {
  const out: string[] = []
  let acc = ''
  for (const part of rel.split('/')) {
    if (part === '') continue
    acc = acc === '' ? part : `${acc}/${part}`
    out.push(acc)
  }
  return out
}

/** One picked path with its kind (drives the trailing slash on insert). */
export interface PickedPath {
  path: string
  isDir: boolean
}

/** The modal surface (portal target; renders only while open). */
export function FilePickerModal({
  state,
  api,
  onInsert,
  onClose,
}: {
  state: PickState
  api: PanelApi
  onInsert: (paths: PickedPath[]) => void
  onClose: () => void
}): JSX.Element | null {
  const req = state.req
  const root = req?.root ?? ''
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [dirs, setDirs] = useState<Record<string, FsEntry[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState<Map<string, boolean>>(new Map())
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<SearchHit[] | null>(null)
  const [searching, setSearching] = useState(false)
  const searchSeq = useRef(0)

  /** Load one directory listing into the tree cache (guarded). */
  const loadDir = (dir: string): void => {
    if (dirs[dir] !== undefined || loading[dir]) return
    setLoading((prev) => ({ ...prev, [dir]: true }))
    void api.list(root, dir).then((result) => {
      setLoading((prev) => ({ ...prev, [dir]: false }))
      if (result.ok) setDirs((prev) => ({ ...prev, [dir]: result.value.entries }))
    })
  }

  /** Prime the tree: root + the initial directory's ancestor chain. */
  useEffect(() => {
    setExpanded(new Set())
    setDirs({})
    setLoading({})
    setSelected(new Map())
    setSearch('')
    setSearchResults(null)
    if (root === '') return
    loadDir('')
    if (req !== null && req.initialDir !== '') {
      for (const dir of ancestors(req.initialDir)) {
        setExpanded((prev) => new Set(prev).add(dir))
        loadDir(dir)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, req?.initialDir])

  // Debounced, seq-guarded workspace filename search.
  useEffect(() => {
    const q = search.trim()
    if (q === '') {
      searchSeq.current += 1
      setSearchResults(null)
      setSearching(false)
      return
    }
    const seq = ++searchSeq.current
    setSearching(true)
    const timer = setTimeout(() => {
      void api.search(root, q).then((result) => {
        if (searchSeq.current !== seq) return
        setSearching(false)
        setSearchResults(result.ok ? result.value.hits : [])
      })
    }, SEARCH_DEBOUNCE_MS)
    return () => { clearTimeout(timer) }
  }, [search, root, api])

  const toggleDir = (dir: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(dir)) next.delete(dir)
      else {
        next.add(dir)
        loadDir(dir)
      }
      return next
    })
  }

  /** Toggle one path in the multi-selection (checkbox semantics). */
  const toggleSelect = (path: string, isDir: boolean): void => {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(path)) next.delete(path)
      else next.set(path, isDir)
      return next
    })
  }

  // Escape closes.
  useEffect(() => {
    if (!state.open) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.open, onClose])

  const tree = useMemo(() => {
    const renderNode = (entry: FsEntry, depth: number): JSX.Element => {
      const isDir = entry.isDir
      const isOpen = expanded.has(entry.path)
      const isSel = selected.has(entry.path)
      const children = dirs[entry.path] ?? []
      const isLoading = loading[entry.path] === true
      return (
        <div key={entry.path}>
          <div
            className={`${pickerCss.row}${isSel ? ` ${pickerCss.rowSelected}` : ''}`}
            style={{ paddingLeft: 8 + depth * 16 }}
            onClick={() => toggleSelect(entry.path, isDir)}
          >
            <span
              className={pickerCss.chev}
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                if (!isDir) return
                e.stopPropagation()
                toggleDir(entry.path)
              }}
            >
              {isDir ? (isOpen ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />) : <span className={pickerCss.chevSpacer} />}
            </span>
            <span className={pickerCss.icon}>
              {isDir ? (isOpen ? <FolderOpenIcon size={15} /> : <FolderIcon size={15} />) : <FileIcon size={15} />}
            </span>
            <span className={pickerCss.name} title={entry.path}>{entry.name}</span>
            <span
              className={`${pickerCss.check}${isSel ? ` ${pickerCss.checkOn}` : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                toggleSelect(entry.path, isDir)
              }}
            >
              {isSel ? <CheckIcon size={12} /> : null}
            </span>
          </div>
          {isDir && isOpen && (
            <div>
              {isLoading ? (
                <div className={pickerCss.note} style={{ paddingLeft: 8 + (depth + 1) * 16 }}>加载中…</div>
              ) : children.length === 0 ? (
                <div className={pickerCss.note} style={{ paddingLeft: 8 + (depth + 1) * 16 }}>（空目录）</div>
              ) : (
                children.map((child) => renderNode(child, depth + 1))
              )}
            </div>
          )}
        </div>
      )
    }
    return renderNode
  }, [expanded, dirs, loading, selected, toggleDir, toggleSelect])

  if (!state.open || req === null) return null
  const rootEntries = dirs[''] ?? []
  const rootLoading = loading[''] === true
  const selectedList: PickedPath[] = Array.from(selected.entries()).map(([path, isDir]) => ({ path, isDir }))

  return createPortal(
    <div className={pickerCss.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={pickerCss.modal} onClick={(e) => e.stopPropagation()}>
        <div className={pickerCss.header}>
          <div className={pickerCss.titleRow}>
            <span className={pickerCss.title}>引用项目文件</span>
            <button type="button" className={pickerCss.closeBtn} onClick={onClose} aria-label="关闭">
              <CloseIcon size={16} />
            </button>
          </div>
          <div className={pickerCss.searchWrap}>
            <span className={pickerCss.searchIcon}><SearchIcon size={14} /></span>
            <input
              className={pickerCss.searchInput}
              placeholder="搜索工作区文件…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search !== '' && (
              <button type="button" className={pickerCss.searchClear} onClick={() => setSearch('')} aria-label="清空">
                <CloseIcon size={13} />
              </button>
            )}
          </div>
          <div className={pickerCss.rootPath} title={root}>{root}</div>
        </div>

        <div className={pickerCss.body}>
          {searchResults !== null ? (
            searching ? (
              <div className={pickerCss.note}>搜索中…</div>
            ) : searchResults.length === 0 ? (
              <div className={pickerCss.note}>没有匹配的文件</div>
            ) : (
              searchResults.map((hit) => {
                const isSel = selected.has(hit.path)
                return (
                  <div
                    key={hit.path}
                    className={`${pickerCss.row}${isSel ? ` ${pickerCss.rowSelected}` : ''}`}
                    onClick={() => toggleSelect(hit.path, false)}
                  >
                    <span className={pickerCss.chevSpacer} />
                    <span className={pickerCss.icon}><FileIcon size={15} /></span>
                    <span className={pickerCss.name} title={hit.path}>
                      <span>{hit.name}</span>
                      <span className={pickerCss.subpath}>{hit.path}</span>
                    </span>
                    <span
                      className={`${pickerCss.check}${isSel ? ` ${pickerCss.checkOn}` : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSelect(hit.path, false)
                      }}
                    >
                      {isSel ? <CheckIcon size={12} /> : null}
                    </span>
                  </div>
                )
              })
            )
          ) : rootLoading ? (
            <div className={pickerCss.note}>加载中…</div>
          ) : rootEntries.length === 0 ? (
            <div className={pickerCss.note}>（空目录）</div>
          ) : (
            rootEntries.map((entry) => tree(entry, 0))
          )}
        </div>

        <div className={pickerCss.footer}>
          <div className={pickerCss.chips}>
            {selectedList.length === 0 ? (
              <span className={pickerCss.chipsEmpty}>选择文件或目录（可多选）</span>
            ) : (
              selectedList.map((pick) => (
                <span key={pick.path} className={pickerCss.chip}>
                  <span>@{pick.path}{pick.isDir ? '/' : ''}</span>
                  <button
                    type="button"
                    className={pickerCss.chipX}
                    onClick={() => toggleSelect(pick.path, pick.isDir)}
                    aria-label="移除"
                  >
                    <CloseIcon size={11} />
                  </button>
                </span>
              ))
            )}
          </div>
          <div className={pickerCss.footerActions}>
            <button type="button" className={pickerCss.cancelBtn} onClick={onClose}>取消</button>
            <button
              type="button"
              className={pickerCss.insertBtn}
              disabled={selectedList.length === 0}
              onClick={() => onInsert(selectedList)}
            >
              插入{selectedList.length > 0 ? ` (${selectedList.length})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Minimal inline check glyph (avoids an extra icon import cycle). */
function CheckIcon({ size }: { size: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6.2 4.8 8.5 9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Minimal structural view of the conversation input service (see reference.ts). */
interface DraftInput {
  state: { getSnapshot(): { draft: string; draftRev: number } }
  setDraft(draft: string): void
}
interface ConversationService {
  input: { for(actx: ClientContext): DraftInput }
}

/** Active `@` mention candidate in the draft (mimics pi-desktop's getActiveMention). */
export function findAtMention(value: string, caret: number): { start: number; query: string } | null {
  const before = value.slice(0, caret)
  const at = before.lastIndexOf('@')
  if (at < 0) return null
  // The '@' must sit at a token boundary (start or after whitespace/punctuation).
  if (at > 0 && !/[\s,;.!?()[\]{}"'/\\]/.test(before[at - 1])) return null
  return { start: at, query: before.slice(at + 1) }
}

/**
 * The picker host: watches the composer textarea for a bare `@` (opening the
 * modal directly, pi-desktop style — no inline trigger menu), subscribes to
 * the bridge, and renders the modal. Insertion replaces the `@` token span
 * with the picked references joined by spaces; cancel drops the stray `@`.
 */
export function FilePickerHost({ ctx, api }: { ctx: ClientContext; api: PanelApi }): JSX.Element {
  const [state, setState] = useState<PickState>(filePicker.getSnapshot())
  useEffect(() => filePicker.subscribe(setState), [])

  // When the modal opens, close the shell's inline trigger menu: the `file`
  // codec source registers under '@' (and any other '@' sources exist), so a
  // bare `@` also pops the flat menu — the modal must be the only surface.
  useEffect(() => {
    if (!state.open || state.req === null) return
    try {
      const actx = ctx.sessions.scope(state.req.sessionId)
      if (actx === undefined) return
      const inputTriggers = (ctx as unknown as {
        get(name: string): unknown
      }).get('inputTriggers') as { sessionOf(a: ClientContext): { dismiss(): void } } | undefined
      inputTriggers?.sessionOf(actx).dismiss()
    } catch {
      // Menu dismissal is best-effort; the modal stands alone regardless.
    }
  }, [state.open, state.req, ctx])

  // Composer `@` watcher: open the picker the moment a bare `@` lands.
  useEffect(() => {
    const watched = new WeakSet<HTMLTextAreaElement>()
    const onInput = (e: Event): void => {
      if (filePicker.getSnapshot().open) return
      const ta = e.target as HTMLTextAreaElement
      const caret = ta.selectionStart ?? ta.value.length
      const mention = findAtMention(ta.value, caret)
      if (mention === null || mention.query !== '') return
      const snapshot = ctx.sessions.list.getSnapshot()
      const sessionId = snapshot.current
      if (sessionId === undefined) return
      const cwd = snapshot.byId[sessionId]?.cwd
      const root = typeof cwd === 'string' && cwd !== '' ? cwd : ''
      if (root === '') return
      filePicker.open({
        sessionId,
        root,
        initialDir: '',
        span: { start: mention.start, end: mention.start + 1 },
      })
    }
    const attach = (): void => {
      for (const ta of document.querySelectorAll<HTMLTextAreaElement>('textarea')) {
        if (watched.has(ta)) continue
        watched.add(ta)
        ta.addEventListener('input', onInput)
      }
    }
    attach()
    const observer = new MutationObserver(attach)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      for (const ta of document.querySelectorAll<HTMLTextAreaElement>('textarea')) {
        ta.removeEventListener('input', onInput)
      }
    }
  }, [ctx])

  /**
   * Insert the picked references into the composer draft as file-reference
   * chips (one `slash/input-insert-reference` bail per file; the `file`
   * source codec serializes each to `@path:lines` on submit). Folders fall
   * back to plain `@path/ ` text since the chip has no line concept.
   * Multiple selections land as adjacent chips.
   */
  const insert = async (paths: PickedPath[]): Promise<void> => {
    const current = filePicker.getSnapshot()
    if (!current.open || current.req === null || paths.length === 0) return
    const { sessionId, root, span } = current.req
    try {
      const actx = ctx.sessions.scope(sessionId)
      if (actx === undefined) return
      const conversation = (ctx as unknown as { conversation?: ConversationService }).conversation
      if (conversation === undefined) return
      const shell = conversation.input.for(actx)
      // Pre-fetch every file's line count in parallel (bails are serial so
      // they share the same draft; reads are independent).
      const lineCounts = await Promise.all(paths.map(async (pick) => {
        if (pick.isDir) return { pick, lines: null }
        const result = await api.read(root, pick.path, false)
        if (!result.ok) return { pick, lines: null }
        const text = result.value.content
        const trimmed = text.endsWith('\n') ? text.slice(0, -1) : text
        const lines = trimmed === '' ? 1 : trimmed.split('\n').length
        return { pick, lines }
      }))
      // Walk in original order. The first chip replaces the `@` token; the
      // rest insert at the current cursor (0-length span) so the machine
      // appends each one in turn.
      let cursor = span.end
      let firstSpan = true
      for (const { pick, lines } of lineCounts) {
        if (pick.isDir) {
          appendToDraft(ctx, sessionId, `@${pick.path}/ `)
          continue
        }
        if (lines === null) continue
        const snap = shell.state.getSnapshot()
        const currentSpan: RefSpan = firstSpan
          ? { start: span.start, end: span.end, draftRev: snap.draftRev }
          : { start: cursor, end: cursor, draftRev: snap.draftRev }
        const ok = insertFileReference(
          ctx,
          sessionId,
          { path: pick.path, startLine: 1, endLine: lines },
          currentSpan,
        )
        if (ok) {
          firstSpan = false
          // The machine replaces [start,end) with U+FFFC and an optional
          // trailing space; the cursor advances by 2 for the new characters.
          cursor += 2
        }
      }
      filePicker.close()
    } catch (error) {
      console.warn('[dsh-filemgr] picker insert failed:', error)
    }
  }

  /** Cancel: drop the stray `@` the picker was opened from. */
  const close = (): void => {
    const current = filePicker.getSnapshot()
    if (current.open && current.req !== null) {
      const { sessionId, span } = current.req
      try {
        const actx = ctx.sessions.scope(sessionId)
        const conversation = (ctx as unknown as { conversation?: ConversationService }).conversation
        if (actx !== undefined && conversation !== undefined) {
          const shell = conversation.input.for(actx)
          const draft = shell.state.getSnapshot().draft
          const token = draft.slice(span.start, span.end)
          if (token.startsWith('@')) {
            shell.setDraft(draft.slice(0, span.start) + draft.slice(span.end))
          }
        }
      } catch {
        // Best-effort cleanup; the picker still closes.
      }
    }
    filePicker.close()
  }

  return <FilePickerModal state={state} api={api} onInsert={insert} onClose={close} />
}
