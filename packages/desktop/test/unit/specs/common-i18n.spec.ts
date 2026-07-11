import { afterEach, describe, expect, it } from 'vitest'

import { clearCache, getTranslation } from 'common/i18n'

describe('common i18n', () => {
  afterEach(() => {
    clearCache()
  })

  it('loads repo-local locale files when resourcesPath is unavailable', () => {
    const originalResourcesPath = process.resourcesPath

    try {
      Object.defineProperty(process, 'resourcesPath', {
        value: undefined,
        configurable: true
      })

      expect(getTranslation('menu.paragraph.title', 'zh-CN')).toBe('段落')
      expect(getTranslation('menu.paragraph.insertTable', 'zh-CN')).toBe('插入表格')
    } finally {
      Object.defineProperty(process, 'resourcesPath', {
        value: originalResourcesPath,
        configurable: true
      })
    }
  })
})
