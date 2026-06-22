<template>
  <div class="tags-view">
    <router-link
      v-for="tag in tagsStore.visitedViews"
      :key="tag.path"
      :to="tag.fullPath"
      class="tag-item"
      :class="{ active: isActive(tag) }"
      @contextmenu.prevent="openContextMenu($event, tag)"
    >
      {{ tag.title }}
      <el-icon
        v-if="!tag.affix"
        class="close"
        @click.prevent.stop="closeTag(tag)"
      >
        <Close />
      </el-icon>
    </router-link>

    <!-- 右键菜单 -->
    <teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click="contextMenu.visible = false"
      >
        <div
          class="context-menu-item"
          :class="{ disabled: !contextMenu.tag || contextMenu.tag.affix }"
          @click="onCloseCurrent"
        >
          <el-icon><Close /></el-icon>
          <span>关闭当前</span>
        </div>
        <div
          class="context-menu-item"
          :class="{ disabled: tagsStore.visitedViews.length <= 1 }"
          @click="onCloseOthers"
        >
          <el-icon><SemiSelect /></el-icon>
          <span>关闭其他</span>
        </div>
        <div
          class="context-menu-item"
          :class="{ disabled: tagsStore.visitedViews.filter(v => !v.affix).length === 0 }"
          @click="onCloseAll"
        >
          <el-icon><CircleClose /></el-icon>
          <span>关闭所有</span>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/stores/tagsView'

interface TagItem {
  path: string
  fullPath: string
  name?: string
  title: string
  affix?: boolean
}

const route = useRoute()
const router = useRouter()
const tagsStore = useTagsViewStore()

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  tag: null as TagItem | null
})

function isActive(tag: { path: string }) {
  return tag.path === route.path
}

function closeTag(tag: TagItem) {
  tagsStore.removeView(tag.path)
  if (isActive(tag)) {
    const last = tagsStore.visitedViews[tagsStore.visitedViews.length - 1]
    router.push(last ? last.fullPath : '/')
  }
}

function openContextMenu(e: MouseEvent, tag: TagItem) {
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY
  contextMenu.tag = tag
  contextMenu.visible = true
}

function onCloseCurrent() {
  if (!contextMenu.tag || contextMenu.tag.affix) return
  closeTag(contextMenu.tag)
}

function onCloseOthers() {
  if (tagsStore.visitedViews.length <= 1) return
  tagsStore.removeOthers(contextMenu.tag?.path || route.path)
  // 如果当前路由被关闭了，跳转到保留的标签
  if (!tagsStore.visitedViews.some(v => v.path === route.path)) {
    const last = tagsStore.visitedViews[tagsStore.visitedViews.length - 1]
    router.push(last ? last.fullPath : '/')
  }
}

function onCloseAll() {
  tagsStore.removeAll()
  const last = tagsStore.visitedViews[tagsStore.visitedViews.length - 1]
  router.push(last ? last.fullPath : '/')
}

// 点击任意位置关闭右键菜单
function handleClickOutside() {
  contextMenu.visible = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.tags-view {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 4px 8px;
  display: flex;
  gap: 4px;
  overflow-x: auto;
}
.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  text-decoration: none;
  color: #666;
  font-size: 12px;
  white-space: nowrap;
}
.tag-item.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}
.close { font-size: 12px; }

.context-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  min-width: 140px;
}
.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: background 0.15s;
}
.context-menu-item:hover {
  background: #f5f7fa;
  color: #409eff;
}
.context-menu-item.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}
.context-menu-item.disabled:hover {
  background: transparent;
  color: #c0c4cc;
}
</style>
