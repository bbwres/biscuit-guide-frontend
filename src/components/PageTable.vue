<template>
  <div class="page-table">
    <slot name="toolbar" />
    <el-table
      v-loading="state.loading"
      :data="(state.data as any)"
      :row-key="rowKey"
      stripe
      style="width: 100%"
    >
      <slot />
    </el-table>
    <div class="pagination">
      <el-pagination
        :current-page="state.current"
        :page-size="state.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="state.total"
        layout="total, sizes, prev, pager, next"
        background
        small
        @current-change="(p: number) => onPageChange({ current: p, size: state.size })"
        @size-change="(s: number) => onPageChange({ current: 1, size: s })"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T, Q extends Record<string, any>">
import type { PageState } from '@/composables/usePage'

defineProps<{
  state: PageState<T, Q>
  rowKey?: string
}>()

const emit = defineEmits<{
  (e: 'page-change', payload: { current: number; size: number }): void
}>()

function onPageChange(payload: { current: number; size: number }) {
  emit('page-change', payload)
}
</script>

<style scoped>
.page-table {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.page-table :deep(.el-table) { border: 0; }
.page-table :deep(.el-table th.el-table__cell) { border-bottom: 1px solid #ebeef5 !important; }
.page-table :deep(.el-table td.el-table__cell) { border-bottom: 1px solid #ebeef5 !important; }
.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #ebeef5;
}
.pagination :deep(.el-pagination__sizes .el-select) { width: 100px; }
</style>
