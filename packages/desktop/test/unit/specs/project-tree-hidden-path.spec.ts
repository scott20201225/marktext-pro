import { describe, expect, it } from 'vitest'
import { isHiddenProjectTreePath } from 'common/filesystem/paths'

describe('isHiddenProjectTreePath', () => {
  it('hides internal project folders and their children', () => {
    expect(isHiddenProjectTreePath('/workspace/.git')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/.claude/settings.local.json')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/.codex/config.json')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/.cursor/rules')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/.fleet/settings.json')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/.hg/store')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/.idea/workspace.xml')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/.metadata/.plugins')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/.settings/org.eclipse.core.resources.prefs')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/.svn/entries')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/.vscode/settings.json')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/.zed/settings.json')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/Attachments/image.png')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/attachments/image.png')).toBe(true)
  })

  it('handles Windows-style paths without hiding similarly named files', () => {
    expect(isHiddenProjectTreePath('C:\\workspace\\.git\\config')).toBe(true)
    expect(isHiddenProjectTreePath('C:\\workspace\\.idea\\modules.xml')).toBe(true)
    expect(isHiddenProjectTreePath('C:\\workspace\\.vs\\Project\\v17')).toBe(true)
    expect(isHiddenProjectTreePath('C:\\workspace\\.vscode\\settings.json')).toBe(true)
    expect(isHiddenProjectTreePath('C:\\workspace\\Attachments\\photo.png')).toBe(true)
    expect(isHiddenProjectTreePath('/workspace/.gitignore')).toBe(false)
    expect(isHiddenProjectTreePath('/workspace/my-attachments/readme.md')).toBe(false)
  })

  it('only hides folders inside the opened project root when a root path is provided', () => {
    expect(isHiddenProjectTreePath('/Volumes/Attachments/workspace', '/Volumes/Attachments/workspace')).toBe(false)
    expect(isHiddenProjectTreePath('/Volumes/Attachments/workspace/.git/config', '/Volumes/Attachments/workspace')).toBe(true)
    expect(isHiddenProjectTreePath('/Volumes/Attachments/workspace/docs/readme.md', '/Volumes/Attachments/workspace')).toBe(false)
  })
})
