import * as contextMenu from './actions'
import { t } from '../../i18n'
import { GEO_GEBRA_MODES } from '../../util/geogebra'
import { MIND_MAP_STRUCTURES } from '../../util/mindmap'
import type { GeoGebraMode, MindMapStructure } from '@shared/types/files'

// NOTE: This are mutable fields that may change at runtime.

export const SEPARATOR = {
  type: 'separator'
}

// Use function form to avoid calling the translation function during module load
export const getNewFile = () => ({
  label: t('contextMenu.sideBar.newFile'),
  id: 'newFileMenuItem',
  click(_menuItem: unknown, _browserWindow: unknown) {
    contextMenu.newFile()
  }
})

export const getNewDrawing = () => ({
  label: t('contextMenu.sideBar.newDrawing'),
  id: 'newDrawingMenuItem',
  click(_menuItem: unknown, _browserWindow: unknown) {
    contextMenu.newDrawing()
  }
})

export const getNewGeoGebra = (mode: GeoGebraMode) => {
  const modeOption = GEO_GEBRA_MODES.find((option) => option.value === mode)
  return {
    label: t(modeOption?.labelKey ?? 'sideBar.tree.geoGebraMode'),
    id: `newGeoGebra-${mode}-menuItem`,
    click(_menuItem: unknown, _browserWindow: unknown) {
      contextMenu.newGeoGebra(mode)
    }
  }
}

export const getNewGeoGebraModes = () =>
  GEO_GEBRA_MODES.map(({ value }) => getNewGeoGebra(value as GeoGebraMode))

export const getNewGeoGebraMenu = () => ({
  label: t('contextMenu.sideBar.newGeoGebra'),
  id: 'newGeoGebraMenuItem',
  submenu: getNewGeoGebraModes()
})

export const getNewMindMap = (structure: MindMapStructure) => {
  const structureOption = MIND_MAP_STRUCTURES.find((option) => option.value === structure)
  return {
    label: t(structureOption?.labelKey ?? 'sideBar.tree.mindMapStructure'),
    id: `newMindMap-${structure}-menuItem`,
    click(_menuItem: unknown, _browserWindow: unknown) {
      contextMenu.newMindMap(structure)
    }
  }
}

export const getNewMindMapStructures = () =>
  MIND_MAP_STRUCTURES.map(({ value }) => getNewMindMap(value as MindMapStructure))

export const getNewMindMapMenu = () => ({
  label: t('contextMenu.sideBar.newMindMap'),
  id: 'newMindMapMenuItem',
  submenu: getNewMindMapStructures()
})

export const getNewDirectory = () => ({
  label: t('contextMenu.sideBar.newDirectory'),
  id: 'newDirectoryMenuItem',
  click(_menuItem: unknown, _browserWindow: unknown) {
    contextMenu.newDirectory()
  }
})

export const getCOPY = () => ({
  label: t('contextMenu.sideBar.copy'),
  id: 'copyMenuItem',
  click(_menuItem: unknown, _browserWindow: unknown) {
    contextMenu.copy()
  }
})

export const getCopyPath = () => ({
  label: t('contextMenu.sideBar.copyPath'),
  id: 'copyPathMenuItem',
  click(_menuItem: unknown, _browserWindow: unknown) {
    contextMenu.copyPath()
  }
})

export const getCUT = () => ({
  label: t('contextMenu.sideBar.cut'),
  id: 'cutMenuItem',
  click(_menuItem: unknown, _browserWindow: unknown) {
    contextMenu.cut()
  }
})

export const getPASTE = () => ({
  label: t('contextMenu.sideBar.paste'),
  id: 'pasteMenuItem',
  click(_menuItem: unknown, _browserWindow: unknown) {
    contextMenu.paste()
  }
})

export const getRENAME = () => ({
  label: t('contextMenu.sideBar.rename'),
  id: 'renameMenuItem',
  click(_menuItem: unknown, _browserWindow: unknown) {
    contextMenu.rename()
  }
})

export const getDELETE = () => ({
  label: t('contextMenu.sideBar.moveToTrash'),
  id: 'deleteMenuItem',
  click(_menuItem: unknown, _browserWindow: unknown) {
    contextMenu.remove()
  }
})

export const getShowInFolder = () => ({
  label: t('contextMenu.sideBar.showInFolder'),
  id: 'showInFolderMenuItem',
  click(_menuItem: unknown, _browserWindow: unknown) {
    contextMenu.showInFolder()
  }
})

// Retained for backward compatibility
export const NEW_FILE = getNewFile()
export const NEW_DRAWING = getNewDrawing()
export const NEW_GEOGEBRA = getNewGeoGebraMenu()
export const NEW_MINDMAP = getNewMindMapMenu()
export const NEW_DIRECTORY = getNewDirectory()
export const COPY = getCOPY()
export const COPY_PATH = getCopyPath()
export const CUT = getCUT()
export const PASTE = getPASTE()
export const RENAME = getRENAME()
export const DELETE = getDELETE()
export const SHOW_IN_FOLDER = getShowInFolder()
