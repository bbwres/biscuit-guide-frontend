<template>
  <el-main class="app-main">
    <TagsView />
    <router-view v-slot="{ Component, route }">
      <transition
        name="fade-transform"
        mode="out-in"
      >
        <keep-alive :include="cachedViews">
          <component
            :is="Component"
            :key="route.fullPath"
          />
        </keep-alive>
      </transition>
    </router-view>
  </el-main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTagsViewStore } from '@/stores/tagsView'
import TagsView from './TagsView.vue'

const tagsStore = useTagsViewStore()
const cachedViews = computed(() => tagsStore.cachedViews)
</script>

<style scoped>
.app-main {
  padding: 0;
  background: #f5f7fa;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 业务页通用：给主区域一个内边距，避免贴边 + 区分多页面 */
.app-main :deep(.page) {
  padding: 16px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 表格表头：加粗，与正文形成视觉对比 */
.app-main :deep(.el-table th.el-table__cell) {
  font-weight: 600;
  color: #1f2329;
  border-bottom: 1px solid #dcdfe6 !important;
}

/* 操作栏按钮：链接样式 */
.app-main :deep(.el-table .el-button--small) {
  --el-button-border-color: transparent;
  --el-button-bg-color: transparent;
  --el-button-text-color: #409eff;
  --el-button-hover-border-color: transparent;
  --el-button-hover-bg-color: transparent;
  --el-button-hover-text-color: #66b1ff;
  --el-button-active-border-color: transparent;
  --el-button-active-bg-color: transparent;
  padding: 4px 2px;
}
.app-main :deep(.el-table .el-button--small.el-button--primary) {
  --el-button-text-color: #409eff;
  --el-button-hover-text-color: #66b1ff;
}

.fade-transform-enter-active, .fade-transform-leave-active { transition: all 0.2s; }
.fade-transform-enter-from { opacity: 0; transform: translateY(8px); }
.fade-transform-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
