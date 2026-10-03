import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import bus from '@/bus'

vi.hoisted(() => {
  const w = globalThis as unknown as {
    window?: {
      path?: {
        sep: string
        normalize: (p: string) => string
        basename: (p: string) => string
        dirname: (p: string) => string
        relative: (from: string, to: string) => string
        isAbsolute: (p: string) => boolean
      }
      fileUtils?: {
        hasMarkdownExtension: (n: string) => boolean
        pathExists: (p: string) => Promise<boolean>
        isSamePathSync: (a: string, b: string) => boolean
        isChildOfDirectory: (parent: string, child: string) => boolean
      }
      electron?: { ipcRenderer: { send: (...a: unknown[]) => void; on: (...a: unknown[]) => void } }
    }
  }
  w.window ??= {}
  w.window.path ??= {
    sep: '/',
    normalize: (p: string) => p.replace(/\\/g, '/'),
    basename: (p: string) => p.split('/').filter(Boolean).pop() || '',
    dirname: (p: string) => p.split('/').slice(0, -1).join('/') || '/',
    relative: (from: string, to: string) => {
      const normFrom = from.replace(/\\/g, '/').replace(/\/$/, '')
      const normTo = to.replace(/\\/g, '/').replace(/\/$/, '')
      if (normTo.startsWith(normFrom + '/')) {
        return normTo.slice(normFrom.length + 1)
      }
      return normTo === normFrom ? '' : normTo
    },
    isAbsolute: (p: string) => p.startsWith('/')
  }
  w.window.fileUtils ??= {
    hasMarkdownExtension: (n: string) => n.endsWith('.md'),
    pathExists: () => Promise.resolve(false),
    isSamePathSync: (a: string, b: string) => a.replace(/\\/g, '/') === b.replace(/\\/g, '/'),
    isChildOfDirectory: (parent: string, child: string) => {
      const p = parent.replace(/\\/g, '/').replace(/\/$/, '')
      const c = child.replace(/\\/g, '/').replace(/\/$/, '')
      return c.startsWith(p + '/')
    }
  }
  w.window.electron ??= { ipcRenderer: { send: () => {}, on: () => {} } }
})

import { useProjectStore } from '@/store/project'
import { useEditorStore } from '@/store/editor'

describe('SideBar directory targeting & automatic parent folder selection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('sets createCache dirname to selected folder when folder is active', () => {
    const store = useProjectStore()
    store.OPEN_PROJECT('/workspace/root', { scheduleBufferUpdate: false })
    store.LISTEN_FOR_SIDEBAR_CONTEXT_MENU()

    const folderNode = {
      id: 'f1',
      name: 'subfolder',
      pathname: '/workspace/root/subfolder',
      isDirectory: true as const,
      isFile: false as const,
      isMarkdown: false,
      folders: [],
      files: []
    }

    store.CHANGE_ACTIVE_ITEM(folderNode)
    bus.emit('SIDEBAR::new', 'file')

    expect(store.createCache.dirname).toBe('/workspace/root/subfolder')
    expect(store.createCache.type).toBe('file')
  })

  it('sets createCache dirname to root when root is active or no item is active', () => {
    const store = useProjectStore()
    store.OPEN_PROJECT('/workspace/root', { scheduleBufferUpdate: false })
    store.LISTEN_FOR_SIDEBAR_CONTEXT_MENU()

    store.CHANGE_ACTIVE_ITEM(store.projectTree)
    bus.emit('SIDEBAR::new', 'mindmap')

    expect(store.createCache.dirname).toBe('/workspace/root')
    expect(store.createCache.type).toBe('mindmap')

    store.CHANGE_ACTIVE_ITEM({})
    bus.emit('SIDEBAR::new', 'drawing')

    expect(store.createCache.dirname).toBe('/workspace/root')
    expect(store.createCache.type).toBe('drawing')
  })

  it('automatically selects parent folder when selecting a file inside workspace', () => {
    const projectStore = useProjectStore()
    projectStore.OPEN_PROJECT('/workspace/root', { scheduleBufferUpdate: false })

    // Simulate folder structure in projectTree
    projectStore.projectTree!.folders = [
      {
        id: 'sub1',
        name: 'docs',
        pathname: '/workspace/root/docs',
        isDirectory: true,
        isFile: false,
        isMarkdown: false,
        folders: [],
        files: []
      }
    ]

    // Selecting a file in /workspace/root/docs
    projectStore.SELECT_PARENT_FOLDER_FOR_FILE('/workspace/root/docs/guide.md')
    expect(projectStore.activeItem?.pathname).toBe('/workspace/root/docs')

    // Selecting a file in root directory /workspace/root
    projectStore.SELECT_PARENT_FOLDER_FOR_FILE('/workspace/root/readme.md')
    expect(projectStore.activeItem?.pathname).toBe('/workspace/root')
  })

  it('does NOT change currently selected folder when file is outside workspace', () => {
    const projectStore = useProjectStore()
    projectStore.OPEN_PROJECT('/workspace/root', { scheduleBufferUpdate: false })

    const folderNode = {
      id: 'sub1',
      name: 'docs',
      pathname: '/workspace/root/docs',
      isDirectory: true as const,
      isFile: false as const,
      isMarkdown: false,
      folders: [],
      files: []
    }
    projectStore.CHANGE_ACTIVE_ITEM(folderNode)

    // Selecting an external file outside workspace
    projectStore.SELECT_PARENT_FOLDER_FOR_FILE('/external/path/notes.md')
    // Active item should remain untouched
    expect(projectStore.activeItem?.pathname).toBe('/workspace/root/docs')
  })

  it('automatically updates active folder on editorStore.UPDATE_CURRENT_FILE', () => {
    const projectStore = useProjectStore()
    const editorStore = useEditorStore()

    projectStore.OPEN_PROJECT('/workspace/root', { scheduleBufferUpdate: false })
    projectStore.projectTree!.folders = [
      {
        id: 'sub2',
        name: 'notes',
        pathname: '/workspace/root/notes',
        isDirectory: true,
        isFile: false,
        isMarkdown: false,
        folders: [],
        files: []
      }
    ]

    editorStore.UPDATE_CURRENT_FILE({
      id: 'tab-1',
      pathname: '/workspace/root/notes/todo.md',
      filename: 'todo.md',
      markdown: '',
      isSaved: true,
      cursor: { line: 0, ch: 0 },
      history: { index: 0, stack: [] }
    } as any)

    expect(projectStore.activeItem?.pathname).toBe('/workspace/root/notes')
  })
})
