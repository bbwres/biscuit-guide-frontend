<template>
  <div class="page">
    <PageSearch
      v-model="state.query"
      @search="search"
      @reset="reset"
    >
      <el-form-item :label="t('fileInfo.fileName')">
        <el-input
          v-model="state.query.fileName"
          clearable
        />
      </el-form-item>
      <el-form-item :label="t('fileInfo.businessType')">
        <el-input
          v-model="state.query.businessType"
          clearable
        />
      </el-form-item>
    </PageSearch>

    <div class="toolbar">
      <el-upload
        :http-request="onUpload"
        :show-file-list="false"
        :before-upload="beforeUpload"
      >
        <el-button
          v-permission="['fileInfo:upload']"
          type="primary"
        >
          {{ t('common.add') }}
        </el-button>
      </el-upload>
    </div>

    <PageTable
      :state="state"
      row-key="id"
      @page-change="onPageChange"
    >
      <el-table-column
        prop="fileName"
        :label="t('fileInfo.fileName')"
      />
      <el-table-column
        prop="originalName"
        :label="t('fileInfo.originalName')"
      />
      <el-table-column
        prop="fileSize"
        :label="t('fileInfo.fileSize')"
      >
        <template #default="{ row }">
          {{ formatSize((row as any).fileSize) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="businessType"
        :label="t('fileInfo.businessType')"
      />
      <el-table-column
        :label="t('common.operation')"
        width="160"
      >
        <template #default="{ row }">
          <el-button
            v-permission="['fileInfo:delete']"
            size="small"
            type="danger"
            @click="onDelete(row as any)"
          >
            {{ t('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </PageTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ElMessage, ElMessageBox, type UploadRequestOptions } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { usePage } from '@/composables/usePage'
import PageSearch from '@/components/PageSearch.vue'
import PageTable from '@/components/PageTable.vue'
import { pageFileInfo, uploadFile, deleteFile } from '@/api/basic/fileInfo'
import type { FileInfo } from '@/types/basic'

const { t } = useI18n()
console.log('fileInfo i18n ready', t)
const { state, search, reset, onPageChange, refresh } = usePage<FileInfo, Record<string, any>>(
  pageFileInfo,
  () => ({ fileName: '', businessType: '' })
)

function formatSize(bytes: number) {
  if (!bytes) return '0 B'
  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`
}

async function onUpload(opts: UploadRequestOptions) {
  const fd = new FormData()
  fd.append('file', opts.file)
  await uploadFile(fd)
  ElMessage.success('上传成功')
  refresh()
}
function beforeUpload(file: File) {
  if (file.size > 500 * 1024 * 1024) {
    ElMessage.error('文件不能超过 500MB')
    return false
  }
  return true
}
async function onDelete(row: FileInfo) {
  await ElMessageBox.confirm(t('common.confirm') + '?', t('common.delete'), { type: 'warning' })
  await deleteFile(row.id!)
  ElMessage.success('删除成功')
  refresh()
}
onMounted(search)
</script>

<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
