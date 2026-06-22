<template>
  <div class="page">
    <!-- 搜索区 -->
    <PageSearch
      v-model="state.query"
      @search="search"
      @reset="reset"
    >
      <el-form-item :label="t('role.roleCode')">
        <el-input
          v-model="state.query.roleCode"
          clearable
        />
      </el-form-item>
      <el-form-item :label="t('role.roleName')">
        <el-input
          v-model="state.query.roleName"
          clearable
        />
      </el-form-item>
      <template #actions>
        <el-button
          v-permission="['role:add']"
          type="primary"
          @click="onAdd"
        >
          {{ t('common.add') }}
        </el-button>
      </template>
    </PageSearch>

    <!-- 列表区 -->
    <PageTable
      :state="state"
      row-key="id"
      @page-change="onPageChange"
    >
      <el-table-column
        prop="id"
        label="ID"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        prop="roleCode"
        :label="t('role.roleCode')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="roleName"
        :label="t('role.roleName')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="clientId"
        :label="t('role.clientId')"
        show-overflow-tooltip
      />
      <el-table-column :label="t('common.status')">
        <template #default="{ row }">
          <el-tag :type="(row as Role).status === 'NORMAL' ? 'success' : 'info'">
            {{ (row as Role).status === 'NORMAL' ? t('common.enabled') : t('common.disabled') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="remark"
        :label="t('role.remark')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="createTime"
        :label="t('role.createTime')"
        width="180"
      />
      <el-table-column
        :label="t('common.operation')"
        width="300"
      >
        <template #default="{ row }">
          <el-button
            size="small"
            @click="onDetail(row as Role)"
          >
            详情
          </el-button>
          <el-button
            v-permission="['role:edit']"
            size="small"
            @click="onEdit(row as Role)"
          >
            {{ t('common.edit') }}
          </el-button>
          <el-button
            v-permission="['role:editStatus']"
            size="small"
            @click="onToggleStatus(row as Role)"
          >
            {{ (row as Role).status === 'NORMAL' ? t('common.disabled') : t('common.enabled') }}
          </el-button>
          <el-button
            v-permission="['role:assignMenu']"
            size="small"
            type="primary"
            @click="onAssignMenu(row as Role)"
          >
            {{ t('role.menuAssign') }}
          </el-button>
        </template>
      </el-table-column>
    </PageTable>

    <!-- 新增/编辑对话框 -->
    <PageDialog
      v-model="crud.dialogVisible.value"
      :title="crud.dialogMode.value === 'add' ? t('common.add') : t('common.edit')"
      :loading="crud.submitting.value"
      @submit="onSubmit"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item
          :label="t('role.roleCode')"
          prop="roleCode"
        >
          <el-input
            v-model="form.roleCode"
            :disabled="crud.dialogMode.value === 'edit'"
          />
        </el-form-item>
        <el-form-item
          :label="t('role.roleName')"
          prop="roleName"
        >
          <el-input v-model="form.roleName" />
        </el-form-item>
        <el-form-item
          :label="t('role.clientId')"
          prop="clientId"
        >
          <el-select
            v-model="form.clientId!"
            filterable
            remote
            reserve-keyword
            placeholder="请输入客户端ID搜索"
            :remote-method="searchClients"
            :loading="clientLoading"
            :disabled="crud.dialogMode.value === 'edit'"
          >
            <el-option
              v-for="item in clientOptions"
              :key="item.id"
              :label="item.id!"
              :value="item.id!"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('common.status')">
          <el-radio-group v-model="form.status">
            <el-radio value="NORMAL">
              {{ t('common.enabled') }}
            </el-radio>
            <el-radio value="DISABLED">
              {{ t('common.disabled') }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('role.remark')">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
    </PageDialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="角色详情"
      width="720px"
      :close-on-click-modal="false"
      @closed="detailData = null"
    >
      <template v-if="detailData">
        <el-descriptions
          :column="2"
          border
          :label-width="140"
        >
          <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
          <el-descriptions-item :label="t('role.roleCode')">{{ detailData.roleCode }}</el-descriptions-item>
          <el-descriptions-item :label="t('role.roleName')">{{ detailData.roleName }}</el-descriptions-item>
          <el-descriptions-item :label="t('role.clientId')">{{ detailData.clientId }}</el-descriptions-item>
          <el-descriptions-item :label="t('common.status')">
            <el-tag :type="detailData.status === 'NORMAL' ? 'success' : 'info'">
              {{ detailData.status === 'NORMAL' ? t('common.enabled') : t('common.disabled') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('role.remark')">{{ detailData.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('role.createTime')">{{ detailData.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detailData.updateTime || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div
          v-if="detailMenuTree.length"
          class="detail-menus"
        >
          <div class="detail-menus-title">关联菜单</div>
          <div class="detail-menu-tree">
            <el-tree
              :data="detailMenuTree"
              :props="{ label: 'name', children: 'children' }"
              default-expand-all
            />
          </div>
        </div>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 分配菜单对话框 -->
    <PageDialog
      v-model="menuDialogVisible"
      :title="t('role.menuAssign')"
      :loading="menuSubmitting"
      @submit="onSubmitMenu"
      @closed="onMenuDialogClosed"
    >
      <el-descriptions
        :column="1"
        border
        size="small"
      >
        <el-descriptions-item label="角色名称">{{ menuRoleInfo.roleName }}</el-descriptions-item>
        <el-descriptions-item label="角色编码">{{ menuRoleInfo.roleCode }}</el-descriptions-item>
        <el-descriptions-item label="所属客户端">{{ menuRoleInfo.clientId }}</el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">关联菜单</el-divider>
      <div class="menu-tree-wrapper">
        <el-tree
          ref="menuTreeRef"
          :data="menuTree"
          show-checkbox
          node-key="id"
          :default-expand-all="true"
          :props="{ label: 'name', children: 'children' }"

        />
        <div
          v-if="menuTree.length === 0"
          class="menu-empty"
        >
          <el-icon :size="32"><Warning /></el-icon>
          <span>暂无可分配菜单</span>
        </div>
      </div>
    </PageDialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { usePage } from '@/composables/usePage'
import { useCrud } from '@/composables/useCrud'
import PageSearch from '@/components/PageSearch.vue'
import PageTable from '@/components/PageTable.vue'
import PageDialog from '@/components/PageDialog.vue'
import {
  pageRole,
  getRoleById,
  addRole,
  editRole,
  editRoleStatus,
  roleMenuConfig
} from '@/api/auth/role'
import { getMenuTree } from '@/api/auth/menu'
import { pageOauthClient } from '@/api/auth/oauthClient'
import type { Role } from '@/types/auth'
import type { OauthClient } from '@/types/auth'
import type { MenuNode } from '@/utils/menu'

const { t } = useI18n()

// ==================== 列表 ====================
const { state, search, reset, onPageChange } = usePage<Role, Record<string, any>>(
  pageRole,
  () => ({ roleCode: '', roleName: '' })
)

// ==================== 客户端远程搜索 ====================
const clientLoading = ref(false)
const clientOptions = ref<OauthClient[]>([])

async function searchClients(query: string) {
  clientLoading.value = true
  try {
    const resp = await pageOauthClient({
      current: 1,
      size: 50,
      query: query ? { id: query } : {}
    })
    clientOptions.value = resp.records
  } catch {
    clientOptions.value = []
  } finally {
    clientLoading.value = false
  }
}

// ==================== 新增/编辑 ====================
const crud = useCrud<Partial<Role>, Partial<Role> & { id: string }>({
  add: addRole,
  update: editRole,
  remove: async () => undefined
})

const formRef = ref<FormInstance>()
const form = reactive<Partial<Role>>({ roleCode: '', roleName: '', clientId: '', status: 'NORMAL', remark: '' })

const formRules = computed<FormRules>(() => ({
  roleCode: [{ required: true, message: () => t('role.roleCode'), trigger: 'blur' }],
  roleName: [{ required: true, message: () => t('role.roleName'), trigger: 'blur' }],
  clientId: [{ required: true, message: () => t('role.clientId'), trigger: 'blur' }]
}))

function onAdd() {
  Object.assign(form, { roleCode: '', roleName: '', clientId: '', status: 'NORMAL', remark: '' })
  clientOptions.value = []
  searchClients('')
  crud.openAdd()
}

async function onEdit(row: Role) {
  try {
    const detail = await getRoleById(row.id!)
    Object.assign(form, {
      roleCode: detail.roleCode,
      roleName: detail.roleName,
      clientId: detail.clientId,
      status: detail.status,
      remark: detail.remark || ''
    })
    // 编辑时把当前 clientId 加入选项
    if (detail.clientId) {
      clientOptions.value = [{ id: detail.clientId }]
    }
  } catch {
    Object.assign(form, {
      roleCode: row.roleCode,
      roleName: row.roleName,
      clientId: row.clientId,
      status: row.status,
      remark: row.remark || ''
    })
    if (row.clientId) {
      clientOptions.value = [{ id: row.clientId }]
    }
  }
  crud.openEdit(row.id!)
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  const ok = await crud.submit({ ...form })
  if (ok) search()
}

function resetForm() {
  formRef.value?.resetFields()
}

// ==================== 启停用（二次确认） ====================
async function onToggleStatus(row: Role) {
  const next = row.status === 'NORMAL' ? 'DISABLED' : 'NORMAL'
  const action = next === 'DISABLED' ? '停用' : '启用'
  await ElMessageBox.confirm(`确定要${action}角色「${row.roleName}」吗？`, '操作确认', {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  })
  await editRoleStatus({ id: row.id, status: next })
  ElMessage.success('操作成功')
  search()
}

// ==================== 详情 ====================
const detailVisible = ref(false)
const detailData = ref<Role | null>(null)
const detailMenuTree = ref<any[]>([])

async function onDetail(row: Role) {
  detailMenuTree.value = []
  try {
    const data = await getRoleById(row.id!, true)
    detailData.value = data
    if ((data as any).menus?.length) {
      detailMenuTree.value = (data as any).menus
    }
  } catch {
    detailData.value = { ...row } as Role
    detailMenuTree.value = []
  }
  detailVisible.value = true
}

// ==================== 分配菜单 ====================
const menuDialogVisible = ref(false)
const menuSubmitting = ref(false)
const menuRoleId = ref('')
const menuRoleInfo = reactive({ roleName: '', roleCode: '', clientId: '' })
const menuTree = ref<MenuNode[]>([])
const menuTreeRef = ref<any>(null)
/** 递归收集树中所有叶子节点的 id */
function collectLeafIds(tree: any[]): string[] {
  const ids: string[] = []
  const walk = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        walk(node.children)
      } else {
        ids.push(node.id)
      }
    }
  }
  walk(tree)
  return ids
}

async function onAssignMenu(row: Role) {
  menuRoleId.value = row.id!
  menuRoleInfo.roleName = row.roleName
  menuRoleInfo.roleCode = row.roleCode
  menuRoleInfo.clientId = row.clientId
  menuTree.value = []
  // 加载菜单树
  try {
    menuTree.value = await getMenuTree()
  } catch {
    menuTree.value = []
  }
  menuDialogVisible.value = true
  // 加载角色已有菜单并回显勾选
  try {
    const data = await getRoleById(row.id!, true)
    const menus = (data as any).menus as any[] | undefined
    if (menus?.length) {
      // 收集所有叶子节点 id 用于勾选
      const leafIds = collectLeafIds(menus)
      if (leafIds.length && menuTreeRef.value) {
        await nextTick()
        menuTreeRef.value.setCheckedKeys(leafIds)
      }
    }
  } catch {
    // 忽略
  }
}

function onMenuDialogClosed() {
  menuTree.value = []
  checkedMenuCount.value = 0
}

async function onSubmitMenu() {
  if (!menuTreeRef.value) return
  const checkedKeys = menuTreeRef.value.getCheckedKeys() as string[]
  const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys() as string[]
  const menuIds = [...checkedKeys, ...halfCheckedKeys]
  menuSubmitting.value = true
  try {
    await roleMenuConfig({ id: menuRoleId.value, menuIds })
    ElMessage.success('分配成功')
    menuDialogVisible.value = false
  } catch (e: any) {
    ElMessage.error(e?.message || '分配失败')
  } finally {
    menuSubmitting.value = false
  }
}

onMounted(search)
</script>

<style scoped>
.menu-tree-wrapper {
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 8px 12px;
}
.menu-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 13px;
  padding: 24px 0;
}

.detail-menus { margin-top: 16px; }
.detail-menus-title { font-weight: 600; font-size: 13px; color: #303133; margin-bottom: 8px; }
.detail-menu-tree {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 8px 12px;
}
</style>
