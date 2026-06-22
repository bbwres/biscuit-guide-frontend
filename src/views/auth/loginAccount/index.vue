<template>
  <div class="page">
    <!-- 搜索区 -->
    <PageSearch
      v-model="state.query"
      @search="search"
      @reset="reset"
    >
      <el-form-item :label="t('loginAccount.loginName')">
        <el-input
          v-model="state.query.loginName"
          clearable
        />
      </el-form-item>
      <el-form-item :label="t('loginAccount.name')">
        <el-input
          v-model="state.query.name"
          clearable
        />
      </el-form-item>
      <el-form-item :label="t('common.status')">
        <el-select
          v-model="state.query.status"
          clearable
          style="width: 120px"
        >
          <el-option
            :label="t('common.enabled')"
            value="NORMAL"
          />
          <el-option
            :label="t('common.disabled')"
            value="DISABLED"
          />
          <el-option
            label="锁定"
            value="LOCKED"
          />
          <el-option
            label="未激活"
            value="UNACTIVATED"
          />
        </el-select>
      </el-form-item>
      <template #actions>
        <el-button
          v-permission="['loginAccount:add']"
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
        width="200"
      />
      <el-table-column
        prop="loginName"
        :label="t('loginAccount.loginName')"
      />
      <el-table-column
        prop="name"
        :label="t('loginAccount.name')"
      />
      <el-table-column
        prop="phone"
        :label="t('loginAccount.phone')"
      />
      <el-table-column :label="t('common.status')">
        <template #default="{ row }">
          <el-tag :type="statusTagType((row as LoginAccount).status)">
            {{ statusLabel((row as LoginAccount).status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        :label="t('loginAccount.createTime')"
        width="180"
      />
      <el-table-column
        :label="t('common.operation')"
        width="380"
      >
        <template #default="{ row }">
          <el-button
            size="small"
            @click="onDetail(row as LoginAccount)"
          >
            详情
          </el-button>
          <el-button
            v-permission="['loginAccount:edit']"
            size="small"
            @click="onEdit(row as LoginAccount)"
          >
            {{ t('common.edit') }}
          </el-button>
          <el-button
            v-permission="['loginAccount:editStatus']"
            size="small"
            @click="onToggleStatus(row as LoginAccount)"
          >
            {{ (row as LoginAccount).status === 'NORMAL' ? t('common.disabled') : t('common.enabled') }}
          </el-button>
          <el-button
            v-permission="['loginAccount:resetPwd']"
            size="small"
            @click="onResetPassword(row as LoginAccount)"
          >
            {{ t('loginAccount.passwordReset') }}
          </el-button>
          <el-button
            v-permission="['loginAccount:assignRole']"
            size="small"
            type="primary"
            @click="onAssignRole(row as LoginAccount)"
          >
            {{ t('loginAccount.roleAssign') }}
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
          v-if="crud.dialogMode.value === 'add'"
          :label="t('loginAccount.loginName')"
          prop="loginName"
        >
          <el-input v-model="form.loginName" />
        </el-form-item>
        <el-form-item
          :label="t('loginAccount.name')"
          prop="name"
        >
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item
          v-if="crud.dialogMode.value === 'add'"
          :label="t('loginAccount.loginPassword')"
          prop="loginPassword"
        >
          <el-input
            v-model="form.loginPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item :label="t('loginAccount.phone')">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item
          v-if="crud.dialogMode.value === 'add'"
          :label="t('loginAccount.userId')"
          prop="userId"
        >
          <el-input
            v-model="form.userId"
            clearable
            :placeholder="t('loginAccount.userIdPlaceholder')"
          />
        </el-form-item>
        <el-form-item
          v-if="crud.dialogMode.value === 'add'"
          :label="t('common.status')"
        >
          <el-radio-group v-model="form.status">
            <el-radio value="NORMAL">
              {{ t('common.enabled') }}
            </el-radio>
            <el-radio value="DISABLED">
              {{ t('common.disabled') }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </PageDialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="账户详情"
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
          <el-descriptions-item :label="t('loginAccount.loginName')">{{ detailData.loginName }}</el-descriptions-item>
          <el-descriptions-item :label="t('loginAccount.name')">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item :label="t('loginAccount.phone')">{{ detailData.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('common.status')">
            <el-tag :type="statusTagType(detailData.status)">
              {{ statusLabel(detailData.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('loginAccount.userId')">{{ detailData.userId || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('loginAccount.createTime')">{{ detailData.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('loginAccount.lockedTime')">{{ detailData.lockedTime || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('loginAccount.lastUpdatePasswordTime')">{{ detailData.lastUpdatePasswordTime || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div
          v-if="detailRoles.length"
          class="detail-roles"
        >
          <div class="detail-roles-title">已分配角色</div>
          <el-tag
            v-for="role in detailRoles"
            :key="role.id"
            class="detail-role-tag"
          >
            {{ role.roleName }}（{{ role.clientId }}）
          </el-tag>
        </div>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <PageDialog
      v-model="roleDialogVisible"
      :title="t('loginAccount.roleAssign')"
      :loading="roleSubmitting"
      @submit="onSubmitRole"
      @closed="onRoleDialogClosed"
    >
      <el-descriptions
        :column="1"
        border
        size="small"
      >
        <el-descriptions-item label="登录名">{{ roleAccountInfo.loginName }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ roleAccountInfo.name }}</el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">关联角色</el-divider>
      <div class="role-groups">
        <div
          v-for="group in roleGroups"
          :key="group.clientId"
          class="role-group"
        >
          <div class="role-group-title">
            <el-icon size="14"><Monitor /></el-icon>
            <span>客户端：{{ group.clientId }}</span>
            <el-tag
              size="small"
              type="info"
              class="role-group-count"
            >
              {{ group.roles.length }}
            </el-tag>
          </div>
          <el-checkbox-group
            v-model="roleForm.roleIds"
            class="role-checkbox-group"
          >
            <el-checkbox
              v-for="role in group.roles"
              :key="role.id"
              :value="role.id!"
              :label="role.id!"
              border
            >
              {{ role.roleName }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <div
          v-if="roleGroups.length === 0"
          class="role-empty"
        >
          <el-icon :size="32"><Warning /></el-icon>
          <span>暂无可分配角色</span>
        </div>
      </div>
    </PageDialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { usePage } from '@/composables/usePage'
import { useCrud } from '@/composables/useCrud'
import PageSearch from '@/components/PageSearch.vue'
import PageTable from '@/components/PageTable.vue'
import PageDialog from '@/components/PageDialog.vue'
import {
  pageLoginAccount,
  getLoginAccountById,
  getAccountRoles,
  addLoginAccount,
  editLoginAccount,
  editAccountStatus,
  resetAccountPassword,
  accountRoleConfig
} from '@/api/auth/loginAccount'
import { pageRole } from '@/api/auth/role'
import type { LoginAccount, LoginAccountAddOrUpdate, LoginAccountStatus } from '@/types/auth'
import type { Role } from '@/types/auth'

const { t } = useI18n()

// ==================== 状态映射 ====================
function statusLabel(status?: LoginAccountStatus): string {
  switch (status) {
    case 'NORMAL': return t('common.enabled')
    case 'DISABLED': return t('common.disabled')
    case 'LOCKED': return t('common.locked')
    case 'UNACTIVATED': return t('common.unactivated')
    default: return status ?? '-'
  }
}

function statusTagType(status?: LoginAccountStatus): 'success' | 'info' | 'warning' | 'danger' {
  switch (status) {
    case 'NORMAL': return 'success'
    case 'DISABLED': return 'info'
    case 'LOCKED': return 'danger'
    case 'UNACTIVATED': return 'warning'
    default: return 'info'
  }
}

// ==================== 列表 ====================
const { state, search, reset, onPageChange } = usePage<LoginAccount, Record<string, any>>(
  pageLoginAccount,
  () => ({ loginName: '', name: '', status: '' })
)

// ==================== 新增/编辑 ====================
const crud = useCrud<LoginAccountAddOrUpdate, { id: string; name: string; phone?: string }>({
  add: addLoginAccount,
  update: editLoginAccount,
  remove: async () => undefined
})

const formRef = ref<FormInstance>()
const form = reactive<LoginAccountAddOrUpdate>({
  loginName: '',
  name: '',
  loginPassword: '',
  phone: '',
  userId: '',
  status: 'NORMAL'
})

const formRules = computed<FormRules>(() => ({
  loginName: [{ required: true, message: () => t('loginAccount.loginName'), trigger: 'blur' }],
  name: [{ required: true, message: () => t('loginAccount.name'), trigger: 'blur' }],
  loginPassword: [{
    required: crud.dialogMode.value === 'add',
    message: () => t('loginAccount.loginPassword'),
    trigger: 'blur'
  }],
  userId: [{
    required: crud.dialogMode.value === 'add',
    message: () => t('loginAccount.userIdPlaceholder'),
    trigger: 'blur'
  }]
}))

function onAdd() {
  Object.assign(form, { loginName: '', name: '', loginPassword: '', phone: '', userId: '', status: 'NORMAL' })
  crud.openAdd()
}

async function onEdit(row: LoginAccount) {
  Object.assign(form, {
    loginName: row.loginName,
    name: row.name,
    loginPassword: '',
    phone: row.phone || '',
    status: row.status
  })
  crud.openEdit(row.id!)
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()

  let ok: boolean
  if (crud.dialogMode.value === 'add') {
    // 新增：addAccount 接收完整 LoginAccountAddOrUpdate
    ok = await crud.submit({
      loginName: form.loginName,
      name: form.name,
      loginPassword: form.loginPassword,
      phone: form.phone,
      userId: form.userId,
      status: form.status
    })
  } else {
    // 编辑：editAccount 后端只接受 { id, name, phone }
    ok = await crud.submit({ id: '', name: form.name, phone: form.phone } as any)
  }
  if (ok) search()
}

function resetForm() {
  formRef.value?.resetFields()
}

// ==================== 启停用（二次确认） ====================
async function onToggleStatus(row: LoginAccount) {
  const next: LoginAccountStatus = row.status === 'NORMAL' ? 'DISABLED' : 'NORMAL'
  const action = next === 'DISABLED' ? '停用' : '启用'
  await ElMessageBox.confirm(`确定要${action}账户「${row.loginName}」吗？`, '操作确认', {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  })
  await editAccountStatus({ id: row.id!, status: next })
  ElMessage.success('操作成功')
  search()
}

// ==================== 详情 ====================
const detailVisible = ref(false)
const detailData = ref<LoginAccount | null>(null)
const detailRoles = ref<Role[]>([])

async function onDetail(row: LoginAccount) {
  try {
    const [account, roles] = await Promise.all([
      getLoginAccountById(row.id!),
      getAccountRoles(row.id!)
    ])
    detailData.value = account
    detailRoles.value = roles || []
  } catch {
    detailData.value = { ...row } as LoginAccount
    detailRoles.value = []
  }
  detailVisible.value = true
}

// ==================== 重置密码 ====================
async function onResetPassword(row: LoginAccount) {
  const { value } = await ElMessageBox.prompt(t('loginAccount.newPassword'), t('loginAccount.passwordReset'), {
    inputPattern: /.{6,}/,
    inputErrorMessage: 'Min 6 chars'
  })
  await resetAccountPassword({ id: row.id!, newPassword: value })
  ElMessage.success('重置成功')
}

// ==================== 分配角色 ====================
const roleDialogVisible = ref(false)
const roleSubmitting = ref(false)
const roleAccountId = ref('')
const roleAccountInfo = reactive({ loginName: '', name: '' })
const roleList = ref<Role[]>([])
const roleForm = reactive({ roleIds: [] as string[] })

// 按 clientId 分组
const roleGroups = computed(() => {
  const map = new Map<string, Role[]>()
  for (const role of roleList.value) {
    const key = role.clientId || 'default'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(role)
  }
  return Array.from(map.entries()).map(([clientId, roles]) => ({ clientId, roles }))
})

async function onAssignRole(row: LoginAccount) {
  roleAccountId.value = row.id!
  roleAccountInfo.loginName = row.loginName
  roleAccountInfo.name = row.name
  roleForm.roleIds = []
  // 加载角色列表
  try {
    const resp = await pageRole({ current: 1, size: 200, query: {} })
    roleList.value = resp.records
  } catch {
    roleList.value = []
  }
  // 获取该账户已有角色
  try {
    const roles = await getAccountRoles(row.id!)
    if (roles?.length) {
      roleForm.roleIds = roles.map(r => r.id!)
    }
  } catch {
    // 忽略
  }
  roleDialogVisible.value = true
}

function onRoleDialogClosed() {
  roleForm.roleIds = []
  roleList.value = []
}

async function onSubmitRole() {
  roleSubmitting.value = true
  try {
    await accountRoleConfig({ id: roleAccountId.value, roleIds: roleForm.roleIds })
    ElMessage.success('分配成功')
    roleDialogVisible.value = false
  } catch (e: any) {
    ElMessage.error(e?.message || '分配失败')
  } finally {
    roleSubmitting.value = false
  }
}

onMounted(search)
</script>

<style scoped>
.role-groups {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 4px 0;
}
.role-group + .role-group {
  border-top: 1px solid #ebeef5;
}
.role-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #303133;
  padding: 10px 16px 4px;
}
.role-group-count {
  margin-left: auto;
  font-weight: 400;
}
.role-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 16px 12px;
}
.role-checkbox-group :deep(.el-checkbox.is-bordered) {
  margin-right: 0;
  border-radius: 16px;
  padding: 4px 12px;
  height: auto;
}
.role-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 13px;
  padding: 24px 0;
}

.detail-roles { margin-top: 16px; }
.detail-roles-title { font-weight: 600; font-size: 13px; color: #303133; margin-bottom: 8px; }
.detail-role-tag { margin: 0 8px 8px 0; }
</style>
