import { ipcMain } from 'electron'

export const selectLanguage = (language: string): void => {
  ipcMain.emit('set-user-preference', { language })
}
