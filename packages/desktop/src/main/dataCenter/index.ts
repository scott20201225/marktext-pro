import fs from 'fs'
import path from 'path'
import { BrowserWindow, dialog, ipcMain } from 'electron'
import schema from './schema.json'
import Store, { type Schema } from 'electron-store'
import { IMAGE_EXTENSIONS } from 'common/filesystem/paths'

const DATA_CENTER_NAME = 'dataCenter'

interface DataCenterPaths {
  dataCenterPath: string
  userDataPath?: string
}

class DataCenter {
  dataCenterPath: string
  hasDataCenterFile: boolean
  store: Store<Record<string, unknown>>

  constructor(paths: DataCenterPaths) {
    this.dataCenterPath = paths.dataCenterPath
    this.hasDataCenterFile = fs.existsSync(path.join(this.dataCenterPath, `./${DATA_CENTER_NAME}.json`))
    this.store = new Store<Record<string, unknown>>({
      schema: schema as Schema<Record<string, unknown>>,
      name: DATA_CENTER_NAME
    })
    this.init()
  }

  init(): void {
    if (this.hasDataCenterFile) {
      for (const key of [
        'imageFolderPath',
        'screenshotFolderPath',
        'webImages',
        'cloudImages',
        'currentUploader',
        'imageBed',
        'imageBedAlias',
        'cliScript'
      ]) {
        this.store.delete(key)
      }
    }

    ipcMain.handle('mt::ask-for-image-path', async(e) => {
      const win = BrowserWindow.fromWebContents(e.sender)
      if (!win) return ''
      const { filePaths } = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: [...IMAGE_EXTENSIONS] }]
      })
      return filePaths?.[0] || ''
    })
  }
}

export default DataCenter
