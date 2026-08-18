/**
 * Composer placeholder hint: the shell owns the input-bar placeholder
 * ("给智能体发消息") and exposes no override seam (the composer bar is a
 * single slot owned by ui-conversation, and its locale namespace rejects
 * duplicate registration), so this zero-render sentinel — riding the same
 * `conversation.input.dock` band as the mermaid enhancer — rewrites the
 * placeholder attribute in the DOM. It re-applies on any placeholder
 * attribute change or node insert, which covers React re-renders that
 * reset the attribute to the shell default. English UI is left untouched
 * (exact-match on the Chinese string only).
 * @module dsh-filemgr/client/chat/placeholder-hint
 */

import { useEffect } from 'react'
import type { JSX } from 'react'

const OLD_PLACEHOLDER = '给智能体发消息'
const NEW_PLACEHOLDER = '给智能体发消息。@引用项目文件，/ 调用技能与指令'

/** Rewrite every composer input whose placeholder matches the shell default. */
function apply(): void {
  for (const el of document.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>('textarea, input[type="text"]')) {
    if (el.placeholder === OLD_PLACEHOLDER) el.placeholder = NEW_PLACEHOLDER
  }
}

/** Hidden sentinel: renders nothing, owns the placeholder rewriting observer. */
export function PlaceholderHint(): JSX.Element | null {
  useEffect(() => {
    apply()
    const observer = new MutationObserver((records) => {
      const relevant = records.some(
        (record) => record.type === 'attributes' || record.addedNodes.length > 0,
      )
      if (relevant) apply()
    })
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['placeholder'],
      childList: true,
      subtree: true,
    })
    return () => { observer.disconnect() }
  }, [])
  return null
}
