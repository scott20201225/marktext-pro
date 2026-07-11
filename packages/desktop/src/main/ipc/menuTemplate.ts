import type {
  BrowserWindow,
  Menu,
  MenuItem,
  MenuItemConstructorOptions
} from 'electron'

const isSeparator = (item: MenuItemConstructorOptions | undefined): boolean =>
  item?.type === 'separator'

// Windows popup menus are less forgiving about dynamically hidden items than
// the normal application-menu surface. Before building a temporary popup menu,
// collapse invisible items and any leading/trailing/adjacent separators so a
// partially hidden submenu never leaves "floating" divider lines behind.
export const compactMenuTemplate = (
  items: readonly MenuItemConstructorOptions[] = []
): MenuItemConstructorOptions[] => {
  const visibleItems = items.flatMap((item) => {
    if (!item || item.visible === false) {
      return []
    }

    if (Array.isArray(item.submenu)) {
      const submenu = compactMenuTemplate(item.submenu)
      if (submenu.length === 0 && item.type === 'submenu') {
        return []
      }
      return [{ ...item, submenu }]
    }

    return [item]
  })

  const compacted: MenuItemConstructorOptions[] = []
  for (const item of visibleItems) {
    if (isSeparator(item)) {
      if (compacted.length === 0 || isSeparator(compacted[compacted.length - 1])) {
        continue
      }
    }
    compacted.push(item)
  }

  while (isSeparator(compacted[compacted.length - 1])) {
    compacted.pop()
  }

  return compacted
}

const cloneMenuItemToTemplate = (
  item: MenuItem,
  fallbackWindow?: BrowserWindow | null
): MenuItemConstructorOptions => {
  const submenu = item.submenu ? menuToTemplate(item.submenu, fallbackWindow) : undefined
  const cloned: MenuItemConstructorOptions = {
    id: item.id || undefined,
    label: item.label,
    type: item.type,
    role: item.role,
    accelerator: item.accelerator || undefined,
    enabled: item.enabled,
    visible: item.visible,
    checked: item.checked,
    registerAccelerator: item.registerAccelerator,
    submenu
  }

  if (!item.role && typeof item.click === 'function') {
    cloned.click = (menuItem, focusedWindow, event) => {
      item.click(menuItem, focusedWindow ?? fallbackWindow ?? undefined, event)
    }
  }

  return cloned
}

export const menuToTemplate = (
  menu: Menu,
  fallbackWindow?: BrowserWindow | null
): MenuItemConstructorOptions[] =>
  compactMenuTemplate(menu.items.map((item) => cloneMenuItemToTemplate(item, fallbackWindow)))
