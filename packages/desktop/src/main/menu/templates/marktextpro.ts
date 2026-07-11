import { app, type BrowserWindow, type MenuItemConstructorOptions } from 'electron'
import { showAboutDialog } from '../actions/help'
import * as actions from '../actions/marktextpro'
import { t } from '../../i18n'
import type Keybindings from '../../keyboard/shortcutHandler'

// macOS only menu.

export default function(keybindings: Keybindings): MenuItemConstructorOptions {
  return {
    label: t('menu.marktextpro.title'),
    submenu: [
      {
        label: t('menu.marktextpro.about'),
        click(_menuItem, focusedWindow) {
          showAboutDialog(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        label: t('menu.marktextpro.checkUpdates'),
        click(_menuItem, focusedWindow) {
          actions.checkUpdates((focusedWindow as BrowserWindow | undefined) ?? null)
        }
      },
      {
        label: t('menu.marktextpro.preferences'),
        accelerator: keybindings.getAccelerator('file.preferences') ?? undefined,
        click() {
          actions.userSetting()
        }
      },
      {
        type: 'separator'
      },
      {
        label: t('menu.marktextpro.services'),
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: t('menu.marktextpro.hide'),
        accelerator: keybindings.getAccelerator('mt.hide') ?? undefined,
        click() {
          actions.osxHide()
        }
      },
      {
        label: t('menu.marktextpro.hideOthers'),
        accelerator: keybindings.getAccelerator('mt.hide-others') ?? undefined,
        click() {
          actions.osxHideAll()
        }
      },
      {
        label: t('menu.marktextpro.showAll'),
        click() {
          actions.osxShowAll()
        }
      },
      {
        type: 'separator'
      },
      {
        label: t('menu.marktextpro.quit'),
        accelerator: keybindings.getAccelerator('file.quit') ?? undefined,
        click: app.quit
      }
    ]
  }
}
