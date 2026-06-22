<template>
  <div class="page">
    <div class="toolbar">
      <el-button
        v-permission="['fileBusiness:add']"
        type="primary"
        @click="onAdd()"
      >
        {{ t('common.add') }}
      </el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
    >
      <el-table-column
        prop="businessCode"
        :label="t('fileBusiness.businessCode')"
      />
      <el-table-column
        prop="businessName"
        :label="t('fileBusiness.businessName')"
      />
      <el-table-column
        prop="description"
        :label="t('fileBusiness.description')"
      />
      <el-table-column :label="t('common.status')">
        <template #default="{ row }">
          <el-tag :type="(row as any).status === 'NORMAL' ? 'success' : 'info'">
            {{ (row as any).status === 'NORMAL' ? t('common.enabled') : t('common.disabled') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="t('common.operation')"
        width="160"
      >
        <template #default="{ row }">
          <el-button
            v-permission="['fileBusiness:edit']"
            size="small"
            @click="onEdit(row as any)"
          >
            {{ t('common.edit') }}
          </el-button>
          <el-button
            v-permission="['fileBusiness:delete']"
            size="small"
            type="danger"
            @click="onDelete(row as any)"
          >
            {{ t('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { listFileBusiness, deleteFileBusiness } from '@/api/basic/fileBusiness'
import type { FileBusiness } from '@/types/basic'

const { t } = useI18n()
console.log('fileBusiness i18n ready', t)
const list = ref<FileBusiness[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try { list.value = await listFileBusiness() } finally { loading.value = false }
}
function onAdd() { ElMessage.info('新增对话框请按需扩展') }
function onEdit(row: FileBusiness) { ElMessage.info(`编辑 ${row.businessName}`) }
async function onDelete(row: FileBusiness) {
  await ElMessageBox.confirm(t('common.confirm') + '?', t('common.delete'), { type: 'warning' })
  await deleteFileBusiness(row.id!)
  ElMessage.success('删除成功')
  load()
}
onMounted(load)
</script>

<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
