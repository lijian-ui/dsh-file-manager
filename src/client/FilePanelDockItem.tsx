/**
 * FilePanelDockItem — the file-panel dock button rendered into the conversation
 * session header (the `conversation.session.header.utilities` slot).
 *
 * This plugin owns its own dock button independently: dsh-term renders its own
 * terminal button, dsh-file-manager renders this file-panel button. The two
 * are fully decoupled — install either alone and you get just its button;
 * install both and both buttons appear side by side with shared magnification.
 *
 * Clicking broadcasts `dsh-dock:toggle-filepanel` (handled in dsh-file-manager
 * index); the open state is mirrored back through `dsh-dock:filepanel-state`.
 * @module dsh-file-manager/client/FilePanelDockItem
 */
import { useEffect, useState, type ReactElement } from 'react'
import { DockItem } from './DockItem.tsx'

const EV = {
  toggleFile: 'dsh-dock:toggle-filepanel',
  fileState: 'dsh-dock:filepanel-state',
} as const

export function FilePanelDockItem(): ReactElement {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const onState = (e: Event): void => setActive(Boolean((e as CustomEvent).detail))
    window.addEventListener(EV.fileState, onState)
    return () => window.removeEventListener(EV.fileState, onState)
  }, [])
  return (
    <DockItem
      active={active}
      label="文件面板"
      onClick={() => window.dispatchEvent(new CustomEvent(EV.toggleFile))}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 14 1.45-2.9a2 2 0 0 1 1.79-1.1h11.76a2 2 0 0 1 1.94 1.5l1.55 6a2 2 0 0 1-1.94 2.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.5a2 2 0 0 1 1.59.79l.91 1.21a2 2 0 0 0 1.59.79H18a2 2 0 0 1 2 2v2" />
      </svg>
    </DockItem>
  )
}