import {
  SEPARATOR,
  getNewFile,
  getNewDrawing,
  getNewKdbx,
  getNewGeoGebraMenu,
  getNewMindMapMenu,
  getNewDirectory,
  getCOPY,
  getCopyPath,
  getCUT,
  getPASTE,
  getRENAME,
  getDELETE,
  getShowInFolder
} from './menuItems'
import { popupContextMenu, type ContextMenuItem } from '../popupMenu'

export const showContextMenu = (
  event: { clientX: number; clientY: number },
  hasPathCache: boolean
): void => {
  const contextItems: ContextMenuItem[] = [
    getNewFile(),
    getNewDrawing(),
    getNewKdbx(),
    getNewGeoGebraMenu(),
    getNewMindMapMenu(),
    getNewDirectory(),
    SEPARATOR,
    getCOPY(),
    getCUT(),
    getPASTE(),
    SEPARATOR,
    getRENAME(),
    getDELETE(),
    SEPARATOR,
    getCopyPath(),
    SEPARATOR,
    getShowInFolder()
  ]

  for (const item of contextItems) {
    if (item?.id === 'pasteMenuItem') {
      item.enabled = hasPathCache
    }
  }

  const items: ContextMenuItem[] = contextItems.map((item) => {
    if (!item || item.type === 'separator') return item
    const click = item.click
    return {
      ...item,
      click: click ? () => click(null, null) : undefined
    }
  })

  popupContextMenu(items, { x: event.clientX, y: event.clientY })
}
