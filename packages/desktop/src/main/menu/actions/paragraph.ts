import { type BrowserWindow, type Menu, type MenuItem } from 'electron'
import { COMMANDS } from '../../commands'
import type { CommandManager } from '../../commands'

type Win = BrowserWindow | null | undefined

// Paragraph-menu items that can actually be executed across a multi-block
// selection; everything else is disabled when the selection spans blocks.
const CROSS_BLOCK_ENABLED_PARAGRAPH: readonly string[] = [
  'codeFencesMenuItem',
  'quoteBlockMenuItem',
  'alertMenuItem',
  'orderListMenuItem',
  'bulletListMenuItem',
  'taskListMenuItem'
]

const TABLE_MENU_PARENT_IDS: readonly string[] = ['tableSubmenuMenuItem']

const TABLE_INSERT_MENU_IDS: readonly string[] = ['insertTableMenuItem']

const TABLE_OPERATION_MENU_IDS: readonly string[] = [
  'tableInsertRowAboveMenuItem',
  'tableInsertRowBelowMenuItem',
  'tableAppendRowMenuItem',
  'tableMoveRowUpMenuItem',
  'tableMoveRowDownMenuItem',
  'tableDeleteRowMenuItem',
  'tableInsertColumnLeftMenuItem',
  'tableInsertColumnRightMenuItem',
  'tableAppendColumnMenuItem',
  'tableMoveColumnLeftMenuItem',
  'tableMoveColumnRightMenuItem',
  'tableDeleteColumnMenuItem',
  'tableDeleteMenuItem'
]

const TABLE_SEPARATOR_IDS: readonly string[] = [
  'tableRowSeparator',
  'tableColumnSeparator',
  'tableDeleteSeparator'
]

const TASK_STATUS_PARENT_AND_SET_IDS: readonly string[] = [
  'taskStatusMenuItem',
  'markTaskCompleteMenuItem',
  'markTaskIncompleteMenuItem'
]

const ALERT_MENU_ID_BY_TYPE: Readonly<Record<string, string>> = Object.freeze({
  note: 'noteBlockMenuItem',
  tip: 'tipBlockMenuItem',
  important: 'importantBlockMenuItem',
  warning: 'warningBlockMenuItem',
  caution: 'cautionBlockMenuItem'
})

const MENU_ID_MAP: Readonly<Record<string, string>> = Object.freeze({
  heading1MenuItem: 'h1',
  heading2MenuItem: 'h2',
  heading3MenuItem: 'h3',
  heading4MenuItem: 'h4',
  heading5MenuItem: 'h5',
  heading6MenuItem: 'h6',
  codeFencesMenuItem: 'pre',
  htmlBlockMenuItem: 'html',
  mathBlockMenuItem: 'multiplemath',
  quoteBlockMenuItem: 'blockquote',
  orderListMenuItem: 'ol',
  bulletListMenuItem: 'ul',
  taskListMenuItem: 'task',
  paragraphMenuItem: 'p',
  horizontalLineMenuItem: 'hr',
  frontMatterMenuItem: 'frontmatter' // 'pre'
})

const transformEditorElement = (win: Win, type: string): void => {
  if (win && win.webContents) {
    win.webContents.send('mt::editor-paragraph-action', { type })
  }
}

const transformTableElement = (win: Win, type: string): void => {
  transformEditorElement(win, type)
}

const insertParagraph = (win: Win, direction: 'before' | 'after'): void => {
  if (win && win.webContents) {
    win.webContents.send('mt::cm-insert-paragraph', direction)
  }
}

export const bulletList = (win: Win): void => {
  transformEditorElement(win, 'ul-bullet')
}

export const codeFence = (win: Win): void => {
  transformEditorElement(win, 'pre')
}

export const degradeHeading = (win: Win): void => {
  transformEditorElement(win, 'degrade heading')
}

export const frontMatter = (win: Win): void => {
  transformEditorElement(win, 'front-matter')
}

export const heading1 = (win: Win): void => {
  transformEditorElement(win, 'heading 1')
}

export const heading2 = (win: Win): void => {
  transformEditorElement(win, 'heading 2')
}

export const heading3 = (win: Win): void => {
  transformEditorElement(win, 'heading 3')
}

export const heading4 = (win: Win): void => {
  transformEditorElement(win, 'heading 4')
}

export const heading5 = (win: Win): void => {
  transformEditorElement(win, 'heading 5')
}

export const heading6 = (win: Win): void => {
  transformEditorElement(win, 'heading 6')
}

export const horizontalLine = (win: Win): void => {
  transformEditorElement(win, 'hr')
}

export const htmlBlock = (win: Win): void => {
  transformEditorElement(win, 'html')
}

export const looseListItem = (win: Win): void => {
  transformEditorElement(win, 'loose-list-item')
}

export const mathFormula = (win: Win): void => {
  transformEditorElement(win, 'mathblock')
}

export const orderedList = (win: Win): void => {
  transformEditorElement(win, 'ol-order')
}

export const paragraph = (win: Win): void => {
  transformEditorElement(win, 'paragraph')
}

export const insertParagraphBefore = (win: Win): void => {
  insertParagraph(win, 'before')
}

export const insertParagraphAfter = (win: Win): void => {
  insertParagraph(win, 'after')
}

export const quoteBlock = (win: Win): void => {
  transformEditorElement(win, 'blockquote')
}

const alert = (win: Win, type: string): void => {
  transformEditorElement(win, `admonition ${type}`)
}

export const noteBlock = (win: Win): void => {
  alert(win, 'note')
}

export const tipBlock = (win: Win): void => {
  alert(win, 'tip')
}

export const importantBlock = (win: Win): void => {
  alert(win, 'important')
}

export const warningBlock = (win: Win): void => {
  alert(win, 'warning')
}

export const cautionBlock = (win: Win): void => {
  alert(win, 'caution')
}

export const table = (win: Win): void => {
  transformEditorElement(win, 'table')
}

export const tableInsertRowAbove = (win: Win): void => {
  transformTableElement(win, 'table.insert-row-above')
}

export const tableInsertRowBelow = (win: Win): void => {
  transformTableElement(win, 'table.insert-row-below')
}

export const tableAppendRow = (win: Win): void => {
  transformTableElement(win, 'table.append-row')
}

export const tableDeleteRow = (win: Win): void => {
  transformTableElement(win, 'table.delete-row')
}

export const tableMoveRowUp = (win: Win): void => {
  transformTableElement(win, 'table.move-row-up')
}

export const tableMoveRowDown = (win: Win): void => {
  transformTableElement(win, 'table.move-row-down')
}

export const tableInsertColumnLeft = (win: Win): void => {
  transformTableElement(win, 'table.insert-column-left')
}

export const tableInsertColumnRight = (win: Win): void => {
  transformTableElement(win, 'table.insert-column-right')
}

export const tableAppendColumn = (win: Win): void => {
  transformTableElement(win, 'table.append-column')
}

export const tableDeleteColumn = (win: Win): void => {
  transformTableElement(win, 'table.delete-column')
}

export const tableMoveColumnLeft = (win: Win): void => {
  transformTableElement(win, 'table.move-column-left')
}

export const tableMoveColumnRight = (win: Win): void => {
  transformTableElement(win, 'table.move-column-right')
}

export const tableDelete = (win: Win): void => {
  transformTableElement(win, 'table.delete')
}

export const taskList = (win: Win): void => {
  transformEditorElement(win, 'ul-task')
}

export const toggleTaskStatus = (win: Win): void => {
  transformEditorElement(win, 'task-status-toggle')
}

export const markTaskComplete = (win: Win): void => {
  transformEditorElement(win, 'task-status-complete')
}

export const markTaskIncomplete = (win: Win): void => {
  transformEditorElement(win, 'task-status-incomplete')
}

export const indentList = (win: Win): void => {
  transformEditorElement(win, 'list-indent')
}

export const outdentList = (win: Win): void => {
  transformEditorElement(win, 'list-outdent')
}

export const linkReference = (win: Win): void => {
  transformEditorElement(win, 'link-reference')
}

export const footnotes = (win: Win): void => {
  transformEditorElement(win, 'footnote')
}

export const increaseHeading = (win: Win): void => {
  transformEditorElement(win, 'upgrade heading')
}

// --- Commands -------------------------------------------------------------

export const loadParagraphCommands = (commandManager: CommandManager): void => {
  commandManager.add(COMMANDS.PARAGRAPH_BULLET_LIST, bulletList)
  commandManager.add(COMMANDS.PARAGRAPH_CODE_FENCE, codeFence)
  commandManager.add(COMMANDS.PARAGRAPH_DEGRADE_HEADING, degradeHeading)
  commandManager.add(COMMANDS.PARAGRAPH_FRONT_MATTER, frontMatter)
  commandManager.add(COMMANDS.PARAGRAPH_HEADING_1, heading1)
  commandManager.add(COMMANDS.PARAGRAPH_HEADING_2, heading2)
  commandManager.add(COMMANDS.PARAGRAPH_HEADING_3, heading3)
  commandManager.add(COMMANDS.PARAGRAPH_HEADING_4, heading4)
  commandManager.add(COMMANDS.PARAGRAPH_HEADING_5, heading5)
  commandManager.add(COMMANDS.PARAGRAPH_HEADING_6, heading6)
  commandManager.add(COMMANDS.PARAGRAPH_HORIZONTAL_LINE, horizontalLine)
  commandManager.add(COMMANDS.PARAGRAPH_INDENT_LIST, indentList)
  commandManager.add(COMMANDS.PARAGRAPH_HTML_BLOCK, htmlBlock)
  commandManager.add(COMMANDS.PARAGRAPH_LOOSE_LIST_ITEM, looseListItem)
  commandManager.add(COMMANDS.PARAGRAPH_MATH_FORMULA, mathFormula)
  commandManager.add(COMMANDS.PARAGRAPH_ORDERED_LIST, orderedList)
  commandManager.add(COMMANDS.PARAGRAPH_OUTDENT_LIST, outdentList)
  commandManager.add(COMMANDS.PARAGRAPH_PARAGRAPH, paragraph)
  commandManager.add(COMMANDS.PARAGRAPH_QUOTE_BLOCK, quoteBlock)
  commandManager.add(COMMANDS.PARAGRAPH_TABLE, table)
  commandManager.add(COMMANDS.PARAGRAPH_TASK_LIST, taskList)
  commandManager.add(COMMANDS.PARAGRAPH_INCREASE_HEADING, increaseHeading)
}

// --- IPC events -------------------------------------------------------------

// NOTE: Don't use static `getMenuItemById` here, instead request the menu by
//       window id from `AppMenu` manager.

const visitParagraphMenuItems = (
  applicationMenu: Menu,
  visit: (item: MenuItem) => void
): void => {
  const paragraphMenuItem = applicationMenu.getMenuItemById('paragraphMenuEntry')!
  const walk = (item: MenuItem): void => {
    visit(item)
    item.submenu?.items.forEach(walk)
  }
  paragraphMenuItem.submenu!.items.forEach(walk)
}

const setParagraphMenuItemStatus = (applicationMenu: Menu, bool: boolean): void => {
  visitParagraphMenuItems(applicationMenu, (item) => {
    item.enabled = bool
  })
}

const setMultipleStatus = (
  applicationMenu: Menu,
  list: readonly string[],
  status: boolean
): void => {
  visitParagraphMenuItems(applicationMenu, (item) => {
    if (item.id && list.includes(item.id)) item.enabled = status
  })
}

const setMultipleVisible = (
  applicationMenu: Menu,
  list: readonly string[],
  visible: boolean
): void => {
  visitParagraphMenuItems(applicationMenu, (item) => {
    if (item.id && list.includes(item.id)) item.visible = visible
  })
}

const configureTableMenu = (applicationMenu: Menu, isTable: boolean): void => {
  setMultipleVisible(applicationMenu, TABLE_INSERT_MENU_IDS, !isTable)
  setMultipleVisible(applicationMenu, TABLE_OPERATION_MENU_IDS, isTable)
  setMultipleVisible(applicationMenu, TABLE_SEPARATOR_IDS, isTable)
}

export interface SelectionState {
  affiliation: Record<string, boolean>
  admonitionType?: string
  isTable?: boolean
  isLooseListItem?: boolean
  isTaskList?: boolean
  isDisabled?: boolean
  isMultiline?: boolean
  isCodeFences?: boolean
  isCodeContent?: boolean
  hasFrontMatter?: boolean
}

const setCheckedMenuItem = (
  applicationMenu: Menu,
  { affiliation, admonitionType, isLooseListItem }: SelectionState
): void => {
  const activeAlertMenuItemId = admonitionType ? ALERT_MENU_ID_BY_TYPE[admonitionType] : undefined
  visitParagraphMenuItems(applicationMenu, (item) => {
    if (item.type === 'checkbox') item.checked = false
  })
  visitParagraphMenuItems(applicationMenu, (item) => {
    if (!item.id) {
      return false
    } else if (activeAlertMenuItemId && item.id === activeAlertMenuItemId) {
      item.checked = true
    } else if (item.id === 'quoteBlockMenuItem' && activeAlertMenuItemId) {
      item.checked = false
    } else if (item.id === 'looseListItemMenuItem') {
      item.checked = !!isLooseListItem
    } else if (
      Object.keys(affiliation).some((b) => {
        if (item.id === 'codeFencesMenuItem' && /code$/.test(b)) {
          return true
        }
        // Each list kind is its own affiliation key (ol / ul / task), so a
        // nested chain checks every level via the id map.
        return b === MENU_ID_MAP[item.id]
      })
    ) {
      item.checked = true
    }
    return undefined
  })
}

/**
 * Update paragraph menu entires from given state.
 *
 * @param applicationMenu The application menu instance.
 * @param state The selection information.
 */
export const updateSelectionMenus = (
  applicationMenu: Menu,
  state: SelectionState
): void => {
  const {
    // Key/boolean object like "ul: true" of block elements that are selected.
    // This may be an empty object when multiple block elements are selected.
    affiliation,
    isDisabled,
    isMultiline,
    isCodeFences,
    isCodeContent,
    isTable
  } = state

  // Reset format menu.
  const formatMenuItem: MenuItem = applicationMenu.getMenuItemById('formatMenuItem')!
  formatMenuItem.submenu!.items.forEach((item: MenuItem) => (item.enabled = true))

  // Handle menu checked.
  setCheckedMenuItem(applicationMenu, state)

  // Reset paragraph menu.
  setParagraphMenuItemStatus(applicationMenu, !isDisabled)
  configureTableMenu(applicationMenu, !!isTable)
  if (isDisabled) {
    return
  }

  if (isTable) {
    setParagraphMenuItemStatus(applicationMenu, false)
    setMultipleStatus(applicationMenu, [...TABLE_MENU_PARENT_IDS, ...TABLE_OPERATION_MENU_IDS], true)
    return
  }

  setMultipleStatus(applicationMenu, TABLE_MENU_PARENT_IDS, true)
  setMultipleStatus(applicationMenu, TABLE_INSERT_MENU_IDS, true)
  setMultipleStatus(applicationMenu, TABLE_OPERATION_MENU_IDS, false)

  if (isCodeFences) {
    setParagraphMenuItemStatus(applicationMenu, false)

    // Non-formattable code-like content (code/math/html/frontmatter/diagram):
    // disable every format item. Tables never reach here (they return early via
    // isDisabled) so table cells keep formatting.
    formatMenuItem.submenu!.items.forEach((item: MenuItem) => (item.enabled = false))

    // A code line is selected — re-enable the code-fence toggle.
    if (isCodeContent && Object.keys(affiliation).some((b) => /code$/.test(b))) {
      setMultipleStatus(applicationMenu, ['codeFencesMenuItem'], true)
    }
  } else if (isMultiline) {
    // Format: link/image are meaningless across a multi-block selection.
    formatMenuItem.submenu!.items
      .filter((item: MenuItem) => item.id === 'hyperlinkMenuItem' || item.id === 'imageMenuItem')
      .forEach((item: MenuItem) => (item.enabled = false))
    // Paragraph: enable only the items that have a defined cross-block action.
    const paragraphMenu = applicationMenu.getMenuItemById('paragraphMenuEntry')!
    paragraphMenu.submenu!.items.forEach((item: MenuItem) => {
      if (item.id) {
        item.enabled = CROSS_BLOCK_ENABLED_PARAGRAPH.includes(item.id)
      }
    })
  }

  // Disable loose list item when not inside any list (bullet / ordered / task).
  if (!affiliation.ul && !affiliation.ol && !affiliation.task) {
    setMultipleStatus(applicationMenu, ['looseListItemMenuItem'], false)
  }

  const enableTaskStatus = !isCodeFences && !!state.isTaskList
  setMultipleStatus(applicationMenu, TASK_STATUS_PARENT_AND_SET_IDS, enableTaskStatus)
  setMultipleStatus(applicationMenu, ['toggleTaskStatusMenuItem'], enableTaskStatus && !isMultiline)

  // Front matter may exist at most once per document; disable the menu item
  // whenever the document already has one.
  if (state.hasFrontMatter) {
    setMultipleStatus(applicationMenu, ['frontMatterMenuItem'], false)
  }
}
