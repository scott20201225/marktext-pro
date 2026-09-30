<template>
  <div
    class="document-toc"
    :class="[{ 'document-toc-overflow': !wordWrapInToc, 'document-toc-wordwrap': wordWrapInToc }]"
  >
    <div class="title">
      <span>{{ t('sideBar.toc.title') }}</span>
      <button
        class="document-toc-close"
        type="button"
        :title="t('sideBar.icons.toc')"
        @click="emit('close')"
      >
        <el-icon :size="18">
          <DArrowLeft />
        </el-icon>
      </button>
    </div>
    <el-tree
      v-if="keyedToc.length"
      :data="keyedToc"
      node-key="key"
      :default-expanded-keys="expandedKeys"
      :props="defaultProps"
      :expand-on-click-node="false"
      :indent="10"
      :icon="ArrowRight"
      @node-click="handleClick"
      @node-expand="onExpand"
      @node-collapse="onCollapse"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/store/editor'
import { usePreferencesStore } from '@/store/preferences'
import { deriveKeyedToc, type KeyedTocNode } from '@/util/tocKeys'
import bus from '../../bus'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { ArrowRight, DArrowLeft } from '@element-plus/icons-vue'

const { t } = useI18n()
const emit = defineEmits<{ close: [] }>()

const editorStore = useEditorStore()
const preferencesStore = usePreferencesStore()

const defaultProps = {
  children: 'children',
  label: 'label'
}

const { toc } = storeToRefs(editorStore)
const { wordWrapInToc } = storeToRefs(preferencesStore)

// Stable per-node key so el-tree preserves the user's expand/collapse state
// across content edits (#3028) and tab switches (#3791). See deriveKeyedToc.
const keyedToc = computed<KeyedTocNode[]>(() => deriveKeyedToc(toc.value))

// Track which headings the user collapsed, by stable key (#3028). Headings are
// expanded by default; a collapse is remembered here.
const collapsedKeys = ref<Set<string>>(new Set())

const onCollapse = (data: { key?: string }): void => {
  if (data.key) collapsedKeys.value = new Set(collapsedKeys.value).add(data.key)
}

const onExpand = (data: { key?: string }): void => {
  if (!data.key) return
  const next = new Set(collapsedKeys.value)
  next.delete(data.key)
  collapsedKeys.value = next
}

// The set el-tree should have expanded: every node that is neither collapsed
// nor inside a collapsed ancestor. On each content edit el-tree rebuilds and
// re-applies these keys, so binding the *correct* set makes it paint the right
// state directly — instead of expanding everything and then collapsing, which
// flickered.
const expandedKeys = computed<string[]>(() => {
  const keys: string[] = []
  const walk = (nodes: KeyedTocNode[], hiddenByAncestor: boolean): void => {
    for (const node of nodes) {
      const collapsed = hiddenByAncestor || collapsedKeys.value.has(node.key)
      if (!collapsed) keys.push(node.key)
      walk(node.children, collapsed)
    }
  }
  walk(keyedToc.value, false)
  return keys
})

const handleClick = (data: { slug?: unknown }): void => {
  // editor.vue builds a CSS selector with `#${slug}` — bail out if the
  // node has no slug (e.g. unsluggable headings) to avoid emitting
  // `undefined` / non-string payloads and producing `#undefined` selectors.
  if (typeof data.slug !== 'string' || data.slug.length === 0) return
  bus.emit('scroll-to-header', data.slug)
}
</script>

<style>
body {
  --toc-text-color: color-mix(in srgb, var(--editorBgColor, #ffffff) 8%, #000000 92%);
  --toc-icon-color: color-mix(in srgb, var(--editorBgColor, #ffffff) 25%, #000000 75%);
}

body.dark {
  --toc-text-color: color-mix(in srgb, var(--editorBgColor, #1e1e1e) 5%, #ffffff 95%);
  --toc-icon-color: color-mix(in srgb, var(--editorBgColor, #1e1e1e) 20%, #ffffff 80%);
}

.document-toc {
  height: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  background: var(--editorBgColor);
  color: var(--toc-text-color, var(--tree-text-color, #333333));
  --el-tree-text-color: var(--toc-text-color, var(--tree-text-color, #333333));
  --el-tree-expand-icon-color: var(--toc-icon-color, var(--tree-icon-color, #666666));
}

body.dark .document-toc {
  color: var(--toc-text-color, var(--tree-text-color, #ffffff));
  --el-tree-text-color: var(--toc-text-color, var(--tree-text-color, #ffffff));
  --el-tree-expand-icon-color: var(--toc-icon-color, var(--tree-icon-color, #cccccc));
}

.document-toc .title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--toc-text-color, var(--tree-text-color, #333333));
  font-weight: 600;
  font-size: 15px;
  margin: 0;
  padding: 16px 16px 10px;
}

body.dark .document-toc .title {
  color: var(--toc-text-color, var(--tree-text-color, #ffffff));
}

.document-toc-close {
  display: inline-flex;
  width: 24px;
  height: 24px;
  padding: 0;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--toc-icon-color, var(--tree-icon-color, #666666));
  cursor: pointer;
}

body.dark .document-toc-close {
  color: var(--toc-icon-color, var(--tree-icon-color, #cccccc));
}

.document-toc-close:hover {
  color: var(--toc-text-color, var(--tree-text-color, #333333));
  background: var(--floatHoverColor);
}

body.dark .document-toc-close:hover {
  color: var(--toc-text-color, var(--tree-text-color, #ffffff));
}

.document-toc .el-tree-node {
  margin-top: 8px;
}

.document-toc .el-tree {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: transparent;
  color: var(--toc-text-color, var(--tree-text-color, #333333));
  padding: 0 8px 14px;
}

body.dark .document-toc .el-tree {
  color: var(--toc-text-color, var(--tree-text-color, #ffffff));
}

.document-toc .el-tree-node__content {
  border-radius: 4px;
}

.document-toc .el-tree-node__label {
  color: var(--toc-text-color, var(--tree-text-color, #333333)) !important;
}

body.dark .document-toc .el-tree-node__label {
  color: var(--toc-text-color, var(--tree-text-color, #ffffff)) !important;
}

.document-toc .el-tree-node__expand-icon {
  color: var(--toc-icon-color, var(--tree-icon-color, #666666)) !important;
}

body.dark .document-toc .el-tree-node__expand-icon {
  color: var(--toc-icon-color, var(--tree-icon-color, #cccccc)) !important;
}

.document-toc .el-tree-node:focus > .el-tree-node__content,
.document-toc .el-tree-node__content:hover,
.document-toc .el-tree-node.is-current > .el-tree-node__content {
  background: var(--floatHoverColor) !important;
}

.document-toc .el-tree-node:focus > .el-tree-node__content .el-tree-node__label,
.document-toc .el-tree-node__content:hover .el-tree-node__label,
.document-toc .el-tree-node.is-current > .el-tree-node__content .el-tree-node__label {
  color: var(--toc-text-color, var(--tree-text-color, #333333)) !important;
}

body.dark .document-toc .el-tree-node:focus > .el-tree-node__content .el-tree-node__label,
body.dark .document-toc .el-tree-node__content:hover .el-tree-node__label,
body.dark .document-toc .el-tree-node.is-current > .el-tree-node__content .el-tree-node__label {
  color: var(--toc-text-color, var(--tree-text-color, #ffffff)) !important;
}

.document-toc > li {
  font-size: 14px;
  margin-bottom: 15px;
  cursor: pointer;
}
.document-toc-overflow {
  overflow: auto;
}
.document-toc-wordwrap {
  overflow-x: hidden;
  overflow-y: auto;
}

.document-toc-wordwrap .el-tree-node__content {
  white-space: normal;
  height: auto;
  min-height: 26px;
}
</style>
