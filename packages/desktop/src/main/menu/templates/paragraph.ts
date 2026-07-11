import { type BrowserWindow, type MenuItemConstructorOptions } from 'electron'
import * as actions from '../actions/paragraph'
import { t } from '../../i18n'
import type Keybindings from '../../keyboard/shortcutHandler'
import { withTopLevelMenuMnemonic } from './mnemonics'

export default function(keybindings: Keybindings): MenuItemConstructorOptions {
  return {
    id: 'paragraphMenuEntry',
    label: withTopLevelMenuMnemonic('paragraph', t('menu.paragraph.title')),
    submenu: [
      {
        id: 'heading1MenuItem',
        label: t('menu.paragraph.heading1'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.heading-1') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.heading1(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'heading2MenuItem',
        label: t('menu.paragraph.heading2'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.heading-2') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.heading2(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'heading3MenuItem',
        label: t('menu.paragraph.heading3'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.heading-3') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.heading3(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'heading4MenuItem',
        label: t('menu.paragraph.heading4'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.heading-4') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.heading4(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'heading5MenuItem',
        label: t('menu.paragraph.heading5'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.heading-5') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.heading5(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'heading6MenuItem',
        label: t('menu.paragraph.heading6'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.heading-6') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.heading6(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        type: 'separator'
      },
      {
        id: 'upgradeHeadingMenuItem',
        label: t('menu.paragraph.promoteHeading'),
        accelerator: keybindings.getAccelerator('paragraph.upgrade-heading') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.increaseHeading(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'degradeHeadingMenuItem',
        label: t('menu.paragraph.demoteHeading'),
        accelerator: keybindings.getAccelerator('paragraph.degrade-heading') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.degradeHeading(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        type: 'separator'
      },
      {
        id: 'tableSubmenuMenuItem',
        label: t('menu.paragraph.table'),
        submenu: [
          {
            id: 'insertTableMenuItem',
            label: t('menu.paragraph.insertTable'),
            accelerator: keybindings.getAccelerator('paragraph.table') ?? undefined,
            click(_menuItem, focusedWindow) {
              actions.table(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tableRowSeparator',
            type: 'separator'
          },
          {
            id: 'tableInsertRowAboveMenuItem',
            label: t('menu.paragraph.insertRowAbove'),
            click(_menuItem, focusedWindow) {
              actions.tableInsertRowAbove(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tableInsertRowBelowMenuItem',
            label: t('menu.paragraph.insertRowBelow'),
            click(_menuItem, focusedWindow) {
              actions.tableInsertRowBelow(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tableAppendRowMenuItem',
            label: t('menu.paragraph.appendRow'),
            click(_menuItem, focusedWindow) {
              actions.tableAppendRow(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tableMoveRowUpMenuItem',
            label: t('menu.paragraph.moveRowUp'),
            click(_menuItem, focusedWindow) {
              actions.tableMoveRowUp(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tableMoveRowDownMenuItem',
            label: t('menu.paragraph.moveRowDown'),
            click(_menuItem, focusedWindow) {
              actions.tableMoveRowDown(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tableDeleteRowMenuItem',
            label: t('menu.paragraph.deleteRow'),
            click(_menuItem, focusedWindow) {
              actions.tableDeleteRow(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tableColumnSeparator',
            type: 'separator'
          },
          {
            id: 'tableInsertColumnLeftMenuItem',
            label: t('menu.paragraph.insertColumnLeft'),
            click(_menuItem, focusedWindow) {
              actions.tableInsertColumnLeft(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tableInsertColumnRightMenuItem',
            label: t('menu.paragraph.insertColumnRight'),
            click(_menuItem, focusedWindow) {
              actions.tableInsertColumnRight(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tableAppendColumnMenuItem',
            label: t('menu.paragraph.appendColumn'),
            click(_menuItem, focusedWindow) {
              actions.tableAppendColumn(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tableMoveColumnLeftMenuItem',
            label: t('menu.paragraph.moveColumnLeft'),
            click(_menuItem, focusedWindow) {
              actions.tableMoveColumnLeft(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tableMoveColumnRightMenuItem',
            label: t('menu.paragraph.moveColumnRight'),
            click(_menuItem, focusedWindow) {
              actions.tableMoveColumnRight(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tableDeleteColumnMenuItem',
            label: t('menu.paragraph.deleteColumn'),
            click(_menuItem, focusedWindow) {
              actions.tableDeleteColumn(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tableDeleteSeparator',
            type: 'separator'
          },
          {
            id: 'tableDeleteMenuItem',
            label: t('menu.paragraph.deleteTable'),
            click(_menuItem, focusedWindow) {
              actions.tableDelete(focusedWindow as BrowserWindow | undefined)
            }
          }
        ]
      },
      {
        id: 'codeFencesMenuItem',
        label: t('menu.paragraph.codeFences'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.code-fence') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.codeFence(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'quoteBlockMenuItem',
        label: t('menu.paragraph.quoteBlock'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.quote-block') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.quoteBlock(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'alertMenuItem',
        label: t('menu.paragraph.alert'),
        submenu: [
          {
            id: 'noteBlockMenuItem',
            label: t('menu.paragraph.noteBlock'),
            type: 'checkbox',
            click(_menuItem, focusedWindow) {
              actions.noteBlock(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'tipBlockMenuItem',
            label: t('menu.paragraph.tipBlock'),
            type: 'checkbox',
            click(_menuItem, focusedWindow) {
              actions.tipBlock(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'importantBlockMenuItem',
            label: t('menu.paragraph.importantBlock'),
            type: 'checkbox',
            click(_menuItem, focusedWindow) {
              actions.importantBlock(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'warningBlockMenuItem',
            label: t('menu.paragraph.warningBlock'),
            type: 'checkbox',
            click(_menuItem, focusedWindow) {
              actions.warningBlock(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'cautionBlockMenuItem',
            label: t('menu.paragraph.cautionBlock'),
            type: 'checkbox',
            click(_menuItem, focusedWindow) {
              actions.cautionBlock(focusedWindow as BrowserWindow | undefined)
            }
          }
        ]
      },
      {
        id: 'mathBlockMenuItem',
        label: t('menu.paragraph.mathBlock'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.math-formula') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.mathFormula(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'htmlBlockMenuItem',
        label: t('menu.paragraph.htmlBlock'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.html-block') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.htmlBlock(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        type: 'separator'
      },
      {
        id: 'orderListMenuItem',
        label: t('menu.paragraph.orderedList'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.order-list') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.orderedList(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'bulletListMenuItem',
        label: t('menu.paragraph.bulletList'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.bullet-list') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.bulletList(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'taskListMenuItem',
        label: t('menu.paragraph.taskList'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.task-list') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.taskList(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'taskStatusMenuItem',
        label: t('menu.paragraph.taskStatus'),
        submenu: [
          {
            id: 'toggleTaskStatusMenuItem',
            label: t('menu.paragraph.toggleTaskStatus'),
            click(_menuItem, focusedWindow) {
              actions.toggleTaskStatus(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'markTaskCompleteMenuItem',
            label: t('menu.paragraph.markAsComplete'),
            click(_menuItem, focusedWindow) {
              actions.markTaskComplete(focusedWindow as BrowserWindow | undefined)
            }
          },
          {
            id: 'markTaskIncompleteMenuItem',
            label: t('menu.paragraph.markAsIncomplete'),
            click(_menuItem, focusedWindow) {
              actions.markTaskIncomplete(focusedWindow as BrowserWindow | undefined)
            }
          }
        ]
      },
      {
        id: 'linkReferenceMenuItem',
        label: t('menu.paragraph.linkReference'),
        click(_menuItem, focusedWindow) {
          actions.linkReference(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'footnotesMenuItem',
        label: t('menu.paragraph.footnotes'),
        click(_menuItem, focusedWindow) {
          actions.footnotes(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        type: 'separator'
      },
      {
        id: 'looseListItemMenuItem',
        label: t('menu.paragraph.looseListItem'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.loose-list-item') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.looseListItem(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        type: 'separator'
      },
      {
        id: 'paragraphMenuItem',
        label: t('menu.paragraph.paragraph'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.paragraph') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.paragraph(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'horizontalLineMenuItem',
        label: t('menu.paragraph.horizontalRule'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.horizontal-line') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.horizontalLine(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'frontMatterMenuItem',
        label: t('menu.paragraph.frontMatter'),
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.front-matter') ?? undefined,
        click(_menuItem, focusedWindow) {
          actions.frontMatter(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        type: 'separator'
      },
      {
        id: 'insertParagraphBeforeMenuItem',
        label: t('contextMenu.insertParagraphBefore'),
        click(_menuItem, focusedWindow) {
          actions.insertParagraphBefore(focusedWindow as BrowserWindow | undefined)
        }
      },
      {
        id: 'insertParagraphAfterMenuItem',
        label: t('contextMenu.insertParagraphAfter'),
        click(_menuItem, focusedWindow) {
          actions.insertParagraphAfter(focusedWindow as BrowserWindow | undefined)
        }
      }
    ]
  }
}
