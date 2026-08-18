/**
 * The filemgr settings card: the total on/off switch (issue #307).
 * Registers into the `web-ui.plugin.item` slot the Web UI Plugins group
 * renders, bound to the `filemgr` settings namespace through the family
 * settings bridge (or the official settings scope when the deployment exposes
 * the namespace directly). Turning the panel off unmounts the right-panel
 * columns, the floating expand button, the /filemgr/* routes and the
 * workspace fs watch + git polling behind them.
 * @module @lijian-ui/dsh-file-manager/client/FileManagerSettingsCard
 */

import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import { PluginSettingsCard, BooleanField } from './PluginSettingsCard.tsx'
import { CardForm, booleanField, type CardActions, type CardShell, type FieldState as CardFieldState } from './settings-form.ts'

/** The filemgr fields this card edits (the namespace's full schema). */
export interface FileManagerPanelSettings {
  /** Whether the right-panel system (columns, floating button, routes, watch/polling) is mounted at all; default on. */
  enabled?: boolean
}

/** What the filemgr card renders. */
export interface FileManagerSettingsCardState extends CardShell {
  enabled: CardFieldState
}

/** The registration-side face the card's slot entry injects. */
export interface FileManagerSettingsCardFace extends CardActions {
  hooks: {
    /** Card snapshot bound by the renderer as useFilemgrSettingsCard. */
    filemgrSettingsCard: SnapshotStore<FileManagerSettingsCardState>
  }
}

/** Bridges the `filemgr` scope onto the card's staged form. */
export class FileManagerSettingsCardController {
  private readonly form: CardForm<FileManagerPanelSettings>
  private readonly store: SnapshotStore<FileManagerSettingsCardState>

  /** @param scope - the bound settings scope for the `filemgr` namespace. */
  constructor(scope: SettingsScope<FileManagerPanelSettings>) {
    this.form = new CardForm(scope, [
      booleanField('enabled'),
    ])
    this.store = this.form.bind(() => this.projection())
  }

  private projection(): FileManagerSettingsCardState {
    return {
      ...this.form.shell(),
      enabled: this.form.field('enabled'),
    }
  }

  /**
   * Build the face the card's slot registration injects.
   * @returns the card's snapshot and its form actions.
   */
  inject(): FileManagerSettingsCardFace {
    return { hooks: { filemgrSettingsCard: this.store }, ...this.form.actions() }
  }

  /**
   * Release the card's scope subscription and bound stores; the slot
   * disposer calls this on teardown.
   */
  dispose(): void {
    this.form.dispose()
  }
}

/** Props the renderer binds for the filemgr card. */
export type FileManagerSettingsCardProps =
  PropsRuntime<'web-ui.plugin.item'>
  & PropsLocale<'filemgr'>
  & InjectFace<FileManagerSettingsCardFace>

/**
 * Render the filemgr card.
 * @param props - locale copy, the card snapshot, and its form actions.
 * @returns the card.
 */
export function FileManagerSettingsCard(props: FileManagerSettingsCardProps) {
  const { t } = props
  const state = props.useFilemgrSettingsCard(snapshot => snapshot)
  const disabled = !state.writable
  const fieldProps = {
    overriddenLabel: t('settings.overridden'),
    resetLabel: t('settings.reset'),
    invalidLabel: t('settings.invalidNumber'),
    disabled,
  }
  return (
    <PluginSettingsCard
      t={t}
      titleKey="settings.title"
      descriptionKey="settings.description"
      state={state}
      onSave={props.save}
      onDiscard={props.discard}
    >
      <BooleanField
        id="settings-filemgr-enabled"
        label={t('settings.enabled')}
        hint={t('settings.enabledHint')}
        inheritLabel={t('settings.inherit')}
        onLabel={t('settings.on')}
        offLabel={t('settings.off')}
        {...fieldProps}
        {...state.enabled}
        onEdit={(text) => { props.edit('enabled', text) }}
        onReset={() => { props.resetField('enabled') }}
      />
    </PluginSettingsCard>
  )
}
