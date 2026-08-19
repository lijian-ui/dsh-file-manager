/**
 * FileManager right-panel system — browser half: mounts the explorer and preview
 * columns into the web shell's frame grid (through the layout controller),
 * binds the four stores to the live client runtime (the active session's cwd
 * is the project root), subscribes to the host change stream (fs + git), and
 * follows the shell's dark marker (body[data-ds-dark-theme]) via CSS only.
 *
 * Failure policy: every DOM/runtime wiring failure is logged, never thrown —
 * the web shell fails the whole boot when a plugin apply throws.
 *
 * FileManager right-panel design (Apache-2.0, iOfficeAI/FileManager) — re-implemented
 * from measured behavior and architecture, not copied code.
 * @module dsh-filemgr/client
 */

import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { ClientContext, SessionId, SettingsScope, SettingsScopeSpec } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the official settings-scope service onto the client Context.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: pulls the ui-conversation SlotMap merge (the input dock entry).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { PanelApi, subscribePanelEvents } from './api.ts'
import { FileManagerSettingsCard, FileManagerSettingsCardController, type FileManagerPanelSettings } from './FileManagerSettingsCard.tsx'
import { PanelLayoutController } from './layout.ts'
import { createPanelStores, layoutSetRoot } from './store.ts'
import { mountPanels } from './mount.tsx'
import { NS, dictionaries, setLanguage, type FileManagerPanelKey } from './locales.ts'
import { DragFileInlay, type DragFileInjected } from './drag/DragFileInlay.tsx'
import { insertPathIntoDraft } from './drag/file-drag.ts'
import { MermaidChatEnhancer } from './chat/mermaid-chat.tsx'
import { PlaceholderHint } from './chat/placeholder-hint.tsx'
import { FilePickerHost } from './picker/FilePickerModal.tsx'
import { handleFileRefClick } from './chat/file-ref.ts'
import { appendToDraft, appendFileReferenceChip } from './reference.ts'
import { registerFileReferenceSource } from './file-source.ts'
import type { FileReferenceSelection } from './preview/selection.ts'
import './styles/chip.module.css'
import { FilePanelDockItem } from './FilePanelDockItem.tsx'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Panel surface copy. */
    'filemgr': FileManagerPanelKey
  }

  interface SlotMap {
    /**
     * One family plugin card inside the Web UI Plugins group. Spelled here
     * with the same shape so this package can register without depending on
     * the sibling web-ui-settings package.
     */
    'web-ui.plugin.item': { kind: 'list'; scope: 'root'; owner: SettingsPluginItemOwnerProps }
  }
}

/** Owner share of a plugin card (the section supplies nothing). */
export interface SettingsPluginItemOwnerProps {
  /** Marker field: card owner props are intentionally empty. */
  children?: never
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /**
     * Optional rc.6 compatibility binder provided by dsh-web-ui-settings;
     * absent when that group plugin is not installed, so callers fall back to
     * the official settings scope.
     */
    webUiSettings?: { bind<S>(spec: SettingsScopeSpec<S>): SettingsScope<S> }
  }
}

/** Required services: sessions for the project root, locale for the copy, the settings scope for the master switch, and conversation for the composer draft edits (picker insert / @ button). */
export const inject = ['sessions', 'locale', 'settingsScope', 'conversation']

/** Shared, stateless fs client (the PanelApi only wraps fetch calls). */
const panelApi = new PanelApi()

/** Apply the browser half. */
export function apply(ctx: ClientContext): void {
  // Session header dock button (file-panel): each plugin owns its own button
  // in conversation.session.header.utilities, so file-manager works standalone
  // without dsh-term. Cross-button magnification is coordinated via window
  // events (see DockItem.tsx).
  ctx.inject(['slots'], (scope: ClientContext) => {
    scope.slots.inject('conversation.session.header.utilities', () =>
      scope.slots.register({
        name: 'conversation.session.header.utilities',
        id: 'filemgr-dock-item',
        order: -2,
        inject: () => ({}),
      }, FilePanelDockItem))
  })

  ctx.effect(() => ctx.locale.register(NS, dictionaries), 'dsh-filemgr: dictionaries')

  // The `file` reference source: registers the codec that serializes file
  // chips on submit (`@path:lines`), which the shell requires before any
  // `slash/input-insert-reference` chip can send. Inert as a menu
  // participant — the '@' tree modal is our own picker, not the shell menu.
  ctx.effect(() => registerFileReferenceSource(ctx), 'dsh-filemgr: file reference source')

  // The '@' picker is our own tree modal (pi-desktop style), NOT the shell's
  // flat trigger menu: a bare `@` in the composer opens FilePickerHost
  // directly. The one inputTriggers registration above is codec-only and
  // inert in the menu; the modal covers any residual menu the moment it
  // opens.

  // The composer drop target for explorer file drags: mounted in the
  // official `conversation.input.dock` band (declared by the shipped
  // ui-conversation rc.6 shell), session-routed through the conversation
  // input facade. A missing session scope or conversation service degrades
  // to no-op — the panels themselves never depend on the dock entry.
  ctx.inject(['slots', 'conversation', 'sessions'], (scope: ClientContext) => {
    const sessions = scope.sessions
    const conversation = scope.conversation
    scope.slots.inject('conversation.input.dock', () =>
      scope.slots.register({
        name: 'conversation.input.dock',
        id: 'filemgr-drag-file',
        order: 90,
        locale: NS,
        inject: (sessionId: SessionId | undefined): DragFileInjected => ({
          insertPath: (path: string): boolean => {
            if (sessionId === undefined) return false
            const actx = sessions.scope(sessionId)
            if (actx === undefined) return false
            const input = conversation.input
            if (input === undefined) return false
            const shell = input.for(actx)
            const draft = shell.state.getSnapshot().draft
            shell.setDraft(insertPathIntoDraft(draft, path))
            return true
          },
        }),
      }, DragFileInlay))
  })

  // Transcript mermaid enhancement rides the same dock as a zero-render
  // sentinel: the shell has no message-body slot, so the sentinel observes
  // the document for the chat renderer's `code.language-mermaid` blocks.
  ctx.inject(['slots'], (scope: ClientContext) => {
    scope.slots.inject('conversation.input.dock', () =>
      scope.slots.register({
        name: 'conversation.input.dock',
        id: 'filemgr-mermaid-chat',
        order: 91,
      }, MermaidChatEnhancer))
  })

  // Composer placeholder hint rides the same band: the shell's input bar
  // placeholder ("给智能体发消息") has no plugin override seam, so a sentinel
  // rewrites the DOM attribute to advertise the '@' file reference and the
  // '/' command trigger (see placeholder-hint.tsx).
  ctx.inject(['slots'], (scope: ClientContext) => {
    scope.slots.inject('conversation.input.dock', () =>
      scope.slots.register({
        name: 'conversation.input.dock',
        id: 'filemgr-placeholder-hint',
        order: 92,
      }, PlaceholderHint))
  })

  // The settings card: one master switch (issue #307) in the Web UI Plugins
  // group, bound to the 'filemgr' namespace through the family bridge
  // (or the official settings scope when the deployment exposes it).
  ctx.inject(['slots', 'settingsScope'], (settingsCtx: ClientContext) => {
    const binder = settingsCtx.get('webUiSettings') ?? settingsCtx.settingsScope
    const panelScope = binder.bind<FileManagerPanelSettings>({ namespace: NS })
    const settingsCard = new FileManagerSettingsCardController(panelScope)
    settingsCtx.slots.inject('web-ui.plugin.item', () => {
      const unregister = settingsCtx.slots.register({
        name: 'web-ui.plugin.item',
        id: 'filemgr',
        order: 110,
        locale: NS,
        inject: () => settingsCard.inject(),
      }, FileManagerSettingsCard)
      return () => {
        settingsCard.dispose()
        unregister()
      }
    })
  })

  ctx.effect(() => {
    // Master switch (issue #307): the settings card edits the 'filemgr'
    // namespace through the family settings bridge (or the official scope).
    // While off, the panels, the floating button and the change stream stay
    // unmounted; toggling the switch re-mounts them live (the pet's model).
    let panelScope: SettingsScope<FileManagerPanelSettings> | undefined
    try {
      const binder = ctx.get('webUiSettings') ?? ctx.settingsScope
      if (binder !== undefined) panelScope = binder.bind<FileManagerPanelSettings>({ namespace: NS })
    } catch (error) {
      // A missing settings seam must not break the panel boot: default on.
      panelScope = undefined
    }
    const enabled = (): boolean => panelScope?.getSnapshot().value?.enabled ?? true
    let disposeUi: (() => void) | undefined

    /**
     * Mount the whole panel UI (columns, handles, floating button, change
     * stream, persists) and return its teardown. A fresh lifecycle per
     * enable keeps toggling idempotent (the layout controller cannot be
     * reused after dispose).
     */
    const mountUi = (): (() => void) => {
      const stores = createPanelStores(panelApi)
      const layout = new PanelLayoutController(stores.layout)
      const disposers: Array<() => void> = []
      let disposeGitEvents: (() => void) | undefined
      let currentRoot = ''
      let lastPreviewOpen = false

      // The Explorer row '@' button: insert a file-reference chip for files
      // (path + 1..N) or plain `@<rel-path>/` text for folders. File lines
      // are fetched from the host so the chip can carry an accurate line
      // range; failures fall back to plain text.
      const onReference = (path: string, isDir: boolean): void => {
        const sessionId = ctx.sessions.list.getSnapshot().current as SessionId | undefined
        if (sessionId === undefined) {
          console.warn('[dsh-filemgr] @ 引用插入失败：没有活动会话')
          return
        }
        if (isDir) {
          appendToDraft(ctx, sessionId, `@${path}/ `)
          return
        }
        void panelApi.read(currentRoot, path, false).then((result) => {
          if (!result.ok) {
            appendToDraft(ctx, sessionId, `@${path} `)
            return
          }
          const text = result.value.content
          const trimmed = text.endsWith('\n') ? text.slice(0, -1) : text
          const lines = trimmed === '' ? 1 : trimmed.split('\n').length
          appendFileReferenceChip(ctx, sessionId, { path, startLine: 1, endLine: lines })
        })
      }

      // The preview "添加到对话" action: insert a file-reference chip
      // carrying the selected line range, appended at the draft end.
      const onAddFileReference = (selection: FileReferenceSelection): boolean => {
        const sessionId = ctx.sessions.list.getSnapshot().current as SessionId | undefined
        return appendFileReferenceChip(ctx, sessionId, selection)
      }

      // The project root follows the active session's cwd; switching sessions
      // re-binds every store (widths, collapse, tree, tabs persist per root).
      const bindRoot = (): void => {
        const snapshot = ctx.sessions.list.getSnapshot()
        const sessionId = snapshot.current as SessionId | undefined
        const cwd = sessionId === undefined ? undefined : snapshot.byId[sessionId]?.cwd
        const root = typeof cwd === 'string' && cwd !== '' ? cwd : ''
        if (root === currentRoot) return
        currentRoot = root

        // The change stream is git-only and lives exactly as long as the SCM
        // tab is visible (no fs watch — the explorer/preview refresh on user
        // actions, see the host route layer). Drop the old stream on root
        // switches; syncGitSubscription re-evaluates it below.
        disposeGitEvents?.()
        disposeGitEvents = undefined
        const previewOpen = stores.preview.getSnapshot().open
        lastPreviewOpen = previewOpen
        layoutSetRoot(stores.layout, root, previewOpen)
        stores.explorer.setRoot(root)
        stores.scm.setRoot(root)
        stores.preview.setRoot(root)

        syncGitSubscription()
      }

      /**
       * Keep the git change stream in lockstep with SCM-tab visibility:
       * opening the changes tab starts the subscription (and fetches status
       * once immediately — the host poll only ticks on its own cadence);
       * switching away closes it, so git polling happens only while the SCM
       * panel is actually on screen. Idempotent — explorer state changes
       * (expansion, selection) call it and it no-ops unless the tab flipped.
       */
      const syncGitSubscription = (): void => {
        const root = currentRoot
        const want = root !== '' && stores.explorer.getSnapshot().activeTab === 'changes'
        if (want && disposeGitEvents === undefined) {
          void stores.scm.refresh()
          disposeGitEvents = subscribePanelEvents(root, (event) => {
            if (event.kind === 'git') {
              // The host status is the only truth; land it directly.
              stores.scm.update((prev) => (prev.root !== root ? prev : { ...prev, status: event.status, loading: false }))
              // The index/worktree moved: every open diff tab is stale by now.
              void stores.preview.handleGitChange(root)
            }
            if (event.kind === 'gitUnavailable') {
              // The host could not run git at all: land the friendly
              // unavailable state once instead of a "not a repository" view.
              stores.scm.update((prev) => (prev.root !== root ? prev : { ...prev, status: null, loading: false, gitMissing: true }))
            }
          })
        } else if (!want && disposeGitEvents !== undefined) {
          disposeGitEvents()
          disposeGitEvents = undefined
        }
      }
      disposers.push(ctx.sessions.list.subscribe(bindRoot))
      disposers.push(stores.explorer.subscribe(syncGitSubscription))
      bindRoot()

      // Header tool-dock bridge (dsh-term's AnimatedDock): the "file panel"
      // icon toggles this plugin's explorer through a window event, so the two
      // bundles stay decoupled. We also mirror explorerCollapsed back so the
      // dock icon highlights in lockstep.
      const onToggleFile = (): void => layout.toggleExplorer()
      window.addEventListener('dsh-dock:toggle-filepanel', onToggleFile)
      const unsubFileState = stores.layout.subscribe(() => {
        window.dispatchEvent(new CustomEvent('dsh-dock:filepanel-state', {
          detail: !stores.layout.getSnapshot().explorerCollapsed,
        }))
      })
      window.dispatchEvent(new CustomEvent('dsh-dock:filepanel-state', {
        detail: !stores.layout.getSnapshot().explorerCollapsed,
      }))

      // Mirror the preview open state into the layout store (single source: the
      // preview store), and play the enter animation when the region opens.
      const mirrorPreviewOpen = (): void => {
        const open = stores.preview.getSnapshot().open
        if (open === lastPreviewOpen) return
        lastPreviewOpen = open
        stores.layout.update((prev) => ({ ...prev, previewOpen: open }))
        if (open) {
          const col = document.querySelector<HTMLElement>('[data-filemgr-preview-col]')
          col?.classList.add('filemgr-preview-enter')
          setTimeout(() => col?.classList.remove('filemgr-preview-enter'), 300)
        }
      }
      disposers.push(stores.preview.subscribe(mirrorPreviewOpen))

      // Language mirroring (the shell owns <html lang>; the dictionary follows).
      let langObserver: MutationObserver | undefined
      const syncLanguage = (): void => {
        setLanguage(document.documentElement.lang?.startsWith('zh') ? 'zh' : 'en')
      }
      langObserver = new MutationObserver(syncLanguage)
      langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
      syncLanguage()

      // Mount everything. DOM failures degrade the panels, never the GUI.
      try {
        layout.mount()
        mountPanels(stores, () => layout.toggleExplorer(), onReference, onAddFileReference)
      } catch (error) {
        console.error('[dsh-filemgr] mount failed:', error)
      }

      // The '@' tree-browser modal host: a dedicated root appended to body so
      // the modal portals above the shell chrome regardless of panel state.
      const pickerHostEl = document.createElement('div')
      document.body.appendChild(pickerHostEl)
      const pickerRoot = createRoot(pickerHostEl)
      pickerRoot.render(createElement(FilePickerHost, { ctx, api: panelApi }))

      // Chat file-reference clicks (issue #314): recognize workspace paths in
      // transcript code spans and locate them in the Explorer / Preview.
      const onFileRefClick = (event: MouseEvent): void => {
        try {
          handleFileRefClick(stores, panelApi, event)
        } catch (error) {
          // A broken locate must never break the transcript's own clicks.
          console.error('[dsh-filemgr] file ref locate failed:', error)
        }
      }
      document.addEventListener('click', onFileRefClick)

      // Debounced persists (explorer/scm/preview) may be pending when the page
      // hides; flush them so a close/background never drops the last 150ms.
      const flushOnHide = (): void => stores.flushNow()
      const onVisibilityChange = (): void => {
        if (document.visibilityState === 'hidden') flushOnHide()
      }
      window.addEventListener('pagehide', flushOnHide)
      document.addEventListener('visibilitychange', onVisibilityChange)

      return () => {
        flushOnHide()
        window.removeEventListener('pagehide', flushOnHide)
        window.removeEventListener('dsh-dock:toggle-filepanel', onToggleFile)
        unsubFileState()
        document.removeEventListener('visibilitychange', onVisibilityChange)
        document.removeEventListener('click', onFileRefClick)
        disposeGitEvents?.()
        langObserver?.disconnect()
        pickerRoot.unmount()
        pickerHostEl.remove()
        for (const dispose of disposers) dispose()
        layout.dispose()
      }
    }
    const syncUi = (): void => {
      if (enabled() && disposeUi === undefined) {
        disposeUi = mountUi()
      } else if (!enabled() && disposeUi !== undefined) {
        disposeUi()
        disposeUi = undefined
      }
    }
    syncUi()
    const unsubscribeSettings = panelScope?.subscribe(syncUi)
    return () => {
      unsubscribeSettings?.()
      if (disposeUi !== undefined) {
        disposeUi()
        disposeUi = undefined
      }
    }
  }, 'dsh-filemgr: wiring')
}
