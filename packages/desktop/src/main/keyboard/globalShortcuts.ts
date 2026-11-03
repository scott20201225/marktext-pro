import { app, globalShortcut } from 'electron'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'
import log from 'electron-log'
import { getCaptureWindowManager } from '../windows/captureWindow'
import { getClipboardModalWindow } from '../windows/clipboardModal'

/**
 * Check whether MarkNotePro companion app is actively running.
 * Priority rule: If MarkNotePro is active, MarkTextPro yields global shortcuts to prevent conflicts.
 */
export const isMarkNoteProRunning = (): boolean => {
  // 1. Check PID heartbeat file in ~/.mark-suite/running/marknotepro.json
  try {
    const pidFile = path.join(os.homedir(), '.mark-suite', 'running', 'marknotepro.json')
    if (fs.existsSync(pidFile)) {
      const info = JSON.parse(fs.readFileSync(pidFile, 'utf-8'))
      if (info && info.pid) {
        try {
          process.kill(info.pid, 0)
          return true
        } catch {}
      }
    }
  } catch {}

  // 2. Cross-platform process table check
  try {
    if (process.platform === 'win32') {
      const out = execSync('tasklist /FI "IMAGENAME eq marknotepro.exe" /NH', {
        encoding: 'utf-8',
        timeout: 1000,
        stdio: ['ignore', 'pipe', 'ignore']
      })
      return /marknotepro\.exe/i.test(out)
    } else if (process.platform === 'darwin') {
      const out = execSync('pgrep -x MarkNotePro || pgrep -f "MarkNotePro.app/Contents/MacOS"', {
        encoding: 'utf-8',
        timeout: 1000,
        stdio: ['ignore', 'pipe', 'ignore']
      })
      return out.trim().length > 0
    } else {
      const out = execSync('pgrep -x marknotepro || pgrep -f "/opt/MarkNotePro"', {
        encoding: 'utf-8',
        timeout: 1000,
        stdio: ['ignore', 'pipe', 'ignore']
      })
      return out.trim().length > 0
    }
  } catch {
    return false
  }
}

let coordinationTimer: NodeJS.Timeout | null = null
let isShortcutsRegisteredByMarkText = false

const screenshotShortcuts = [
  'Control+Shift+F1',
  'Command+Shift+F1',
  'CommandOrControl+Shift+F1',
  'Control+Shift+1',
  'Command+Shift+1'
]

const clipboardShortcuts = [
  'Control+Shift+F3',
  'Command+Shift+F3',
  'CommandOrControl+Shift+F3',
  'Control+Shift+3'
]

const unregisterOurShortcuts = (): void => {
  if (!isShortcutsRegisteredByMarkText) return
  log.info('[GlobalShortcuts] Yielding / unregistering global shortcuts in MarkTextPro...')
  for (const s of screenshotShortcuts) {
    try {
      globalShortcut.unregister(s)
    } catch {}
  }
  for (const s of clipboardShortcuts) {
    try {
      globalShortcut.unregister(s)
    } catch {}
  }
  isShortcutsRegisteredByMarkText = false
}

const registerOurShortcuts = (): void => {
  if (isShortcutsRegisteredByMarkText) return

  const captureManager = getCaptureWindowManager()
  const clipboardModal = getClipboardModalWindow()

  // 1. Screenshot shortcuts
  for (const shortcut of screenshotShortcuts) {
    try {
      if (!globalShortcut.isRegistered(shortcut)) {
        globalShortcut.register(shortcut, () => {
          log.info(`[GlobalShortcut] 🔥 MarkTextPro triggered screen capture via: ${shortcut}`)
          captureManager.startCapture()
        })
      }
    } catch (e) {
      log.warn(`[GlobalShortcut] Error registering ${shortcut}:`, e)
    }
  }

  // 2. Clipboard History shortcuts
  for (const shortcut of clipboardShortcuts) {
    try {
      if (!globalShortcut.isRegistered(shortcut)) {
        globalShortcut.register(shortcut, () => {
          log.info(`[GlobalShortcut] 🔥 MarkTextPro triggered clipboard modal via: ${shortcut}`)
          clipboardModal.toggle()
        })
      }
    } catch (e) {
      log.warn(`[GlobalShortcut] Error registering ${shortcut}:`, e)
    }
  }

  isShortcutsRegisteredByMarkText = true
  log.info('[GlobalShortcuts] MarkTextPro successfully registered global shortcuts')
}

export const registerGlobalShortcuts = (): void => {
  // Initial check on startup
  if (isMarkNoteProRunning()) {
    log.info('[GlobalShortcuts] MarkNotePro is active. MarkTextPro yields global hotkeys.')
    unregisterOurShortcuts()
  } else {
    registerOurShortcuts()
  }

  // Dynamic coordination interval (re-checks every 5 seconds)
  if (coordinationTimer) clearInterval(coordinationTimer)
  coordinationTimer = setInterval(() => {
    const markNoteActive = isMarkNoteProRunning()
    if (markNoteActive && isShortcutsRegisteredByMarkText) {
      log.info('[GlobalShortcuts] Detected MarkNotePro launch. MarkTextPro yielding global hotkeys.')
      unregisterOurShortcuts()
    } else if (!markNoteActive && !isShortcutsRegisteredByMarkText) {
      log.info('[GlobalShortcuts] MarkNotePro is no longer active. MarkTextPro claiming global hotkeys.')
      registerOurShortcuts()
    }
  }, 5000)

  app.on('will-quit', () => {
    if (coordinationTimer) {
      clearInterval(coordinationTimer)
      coordinationTimer = null
    }
    unregisterOurShortcuts()
  })
}
