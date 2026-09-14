<template>
  <div class="side-bar-folder">
    <div
      ref="folderEl"
      class="folder-name"
      :style="{ 'padding-left': `${depth * 6 + 10}px` }"
      :class="[{ active: folder.id === activeItem.id }]"
      :title="folder.pathname"
      @click="folderNameClick"
      @dblclick="folderNameDoubleClick"
    >
      <el-icon
        class="icon-arrow"
        :class="{ fold: isCollapsed }"
        :size="12"
        @click.stop="toggleCollapsed"
      >
        <ArrowRight />
      </el-icon>
      <input
        v-if="renameCache === folder.pathname"
        ref="renameInput"
        v-model="newName"
        type="text"
        class="rename"
        @click.stop="noop"
        @keydown.enter.prevent="renameFromKeyboard"
        @blur="renameOnBlur"
      >
      <span
        v-else
        class="text-overflow"
      >{{ folder.name }}</span>
      <button
        class="folder-action-button"
        type="button"
        :title="t('sideBar.tree.nodeActions')"
        @click.stop="showFolderActionMenu"
      >
        <el-icon :size="14">
          <MoreFilled />
        </el-icon>
      </button>
    </div>
    <div
      v-if="!isCollapsed"
      class="folder-contents"
    >
      <tree-folder
        v-for="childFolder of folder.folders"
        :key="childFolder.id"
        :folder="childFolder"
        :depth="depth + 1"
      />
      <input
        v-if="createCache.dirname === folder.pathname"
        ref="input"
        v-model="createName"
        type="text"
        class="new-input"
        :placeholder="createInputPlaceholder"
        :style="{ 'margin-left': `${depth * 5 + 15}px` }"
        @keydown.enter.prevent="handleInputEnterFromKeyboard"
        @blur="handleInputBlur"
      >
      <File
        v-for="file of folder.files"
        :key="file.id"
        :file="file"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '@/store/project'
import { showContextMenu } from '../../contextMenu/sideBar'
import bus from '../../bus'
import File from './treeFile.vue'
import { ArrowRight, MoreFilled } from '@element-plus/icons-vue'
import type { TreeFolderNode } from './types'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  folder: TreeFolderNode
  depth: number
}>()

const projectStore = useProjectStore()
const { t } = useI18n()

const createName = ref('')
const newName = ref('')

const folderEl = ref<HTMLDivElement | null>(null)
const renameInput = ref<HTMLInputElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
let skipNextBlur = false

// Use a local reactive state for isCollapsed that syncs with the prop
const isCollapsed = ref<boolean>(!!props.folder.isCollapsed)

const { renameCache } = storeToRefs(projectStore)
const { createCache } = storeToRefs(projectStore)
const { activeItem } = storeToRefs(projectStore)
const { clipboard } = storeToRefs(projectStore)

const createInputPlaceholder = computed(() => {
  const cache = createCache.value as { type?: string }
  return cache.type === 'directory'
    ? t('sideBar.tree.enterDirectoryName')
    : t('sideBar.tree.enterMarkdownFileName')
})

const handleInputFocus = (): void => {
  // Only the folder that is the create target reacts. Expand it FIRST so the
  // create input renders even when the folder was collapsed, then focus it on
  // the next tick — previously the expand sat behind `if (input.value)`, which
  // is null while collapsed, so New File on a collapsed folder did nothing
  // (#3439).
  if (createCache.value.dirname !== props.folder.pathname) return
  isCollapsed.value = false
  nextTick(() => {
    if (input.value) {
      input.value.focus()
      createName.value = ''
    }
  })
}

const handleInputEnter = (): void => {
  projectStore.CREATE_FILE_DIRECTORY(createName.value)
}

const handleInputEnterFromKeyboard = (): void => {
  skipNextBlur = true
  handleInputEnter()
  window.setTimeout(() => { skipNextBlur = false }, 0)
}

const handleInputBlur = (): void => {
  if (!skipNextBlur) handleInputEnter()
}

const folderNameClick = (): void => {
  projectStore.CHANGE_ACTIVE_ITEM(props.folder)
}

const folderNameDoubleClick = (event: MouseEvent): void => {
  const target = event.target as HTMLElement | null
  if (target?.closest('input, button')) return
  toggleCollapsed()
}

const toggleCollapsed = (): void => {
  isCollapsed.value = !isCollapsed.value
}

const showFolderActionMenu = (event: MouseEvent): void => {
  projectStore.CHANGE_ACTIVE_ITEM(props.folder)
  const target = event.currentTarget as HTMLElement | null
  const rect = target?.getBoundingClientRect()
  showContextMenu(
    {
      clientX: rect ? rect.left + rect.width / 2 : event.clientX,
      clientY: rect ? rect.bottom : event.clientY
    },
    !!clipboard.value
  )
}

const noop = (): void => {}

const focusRenameInput = (): void => {
  nextTick(() => {
    if (renameInput.value) {
      renameInput.value.focus()
      newName.value = props.folder.name
    }
  })
}

const rename = (): void => {
  if (newName.value) {
    projectStore.RENAME_IN_SIDEBAR(newName.value)
  }
}

const renameFromKeyboard = (): void => {
  skipNextBlur = true
  rename()
  window.setTimeout(() => { skipNextBlur = false }, 0)
}

const renameOnBlur = (): void => {
  if (!skipNextBlur) rename()
}

onMounted(() => {
  if (folderEl.value) {
    folderEl.value.addEventListener('contextmenu', (event) => {
      event.preventDefault()
      projectStore.CHANGE_ACTIVE_ITEM(props.folder)
      showContextMenu(event, !!clipboard.value)
    })
  }
  bus.on('SIDEBAR::show-new-input', handleInputFocus)
  bus.on('SIDEBAR::show-rename-input', focusRenameInput)
})
</script>

<style scoped>
.side-bar-folder {
  & > .folder-name {
    cursor: default;
    user-select: none;
    display: flex;
    align-items: center;
    height: 30px;
    padding-right: 15px;
    gap: 6px;
    & > .icon-arrow {
      flex-shrink: 0;
      color: var(--sideBarIconColor);
      margin-right: 5px;
      transition: transform 0.25s ease-out;
      transform: rotate(90deg);
    }
    & > .icon-arrow.fold {
      transform: rotate(0);
    }
    &:hover {
      background: var(--sideBarItemHoverBgColor);
    }
  }
}
.folder-name > span,
.folder-name > input.rename {
  flex: 1;
  min-width: 0;
}
.folder-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--sideBarIconColor);
  cursor: pointer;
}
.folder-action-button:hover {
  background: var(--sideBarItemHoverBgColor);
  color: var(--sideBarTitleColor);
}
.new-input,
input.rename {
  outline: none;
  height: 22px;
  margin: 5px 0;
  padding: 0 6px;
  color: var(--sideBarColor);
  border: 1px solid var(--floatBorderColor);
  background: var(--floatBorderColor);
  width: 70%;
  border-radius: 3px;
}
</style>
