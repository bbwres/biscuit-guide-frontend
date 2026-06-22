<template>
  <div class="page">
    <div class="toolbar">
      <el-button
        v-permission="['tempFile:cleanup']"
        type="danger"
        @click="onCleanup()"
      >
        清理
      </el-button>
    </div>
    <PageSearch
      v-model="state.query"
      @search="search"
      @reset="reset"
    >
      <el-form-item :label="t('tempFile.expireTime')">
        <el-input
          v-model="state.query.expireTime"
          clearable
        />
      </el-form-item>
    </PageSearch>
    <PageTable
      :state="state"
      row-key="id"
      @page-change="onPageChange"
    >
      <el-table-column
        prop="fileName"
        label="fileName"
      />
      <el-table-column
        prop="originalName"
        label="originalName"
      />
      <el-table-column
        prop="fileSize"
        label="fileSize"
      />
      <el-table-column
        prop="expireTime"
        :label="t('tempFile.expireTime')"
      />
    </PageTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { usePage } from '@/composables/usePage'
import PageSearch from '@/components/PageSearch.vue'
import PageTable from '@/components/PageTable.vue'
import { pageTempFile, cleanupTempFile } from '@/api/basic/tempFile'
import type { TempFile } from '@/types/basic'

const { t } = useI18n()
console.log('tempFile i18n ready', t)
const { state, search, reset, onPageChange, refresh } = usePage<TempFile, Record<string, any>>(
  pageTempFile,
  () => ({ expireTime: '' })
)
async function onCleanup() {
  await ElMessageBox.confirm(t('common.confirm') + '?', t('common.delete'), { type: 'warning' })
  await cleanupTempFile()
  ElMessage.success('清理成功')
  refresh()
}
onMounted(search)
</script>

<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
