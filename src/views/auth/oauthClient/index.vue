<template>
  <div class="page">
    <!-- 搜索区 -->
    <PageSearch
      v-model="state.query"
      @search="search"
      @reset="reset"
    >
      <el-form-item :label="t('oauthClient.clientId')">
        <el-input
          v-model="state.query.id"
          clearable
          :placeholder="t('common.pleaseInput')"
        />
      </el-form-item>
      <el-form-item :label="t('oauthClient.authorizedGrantTypes')">
        <el-input
          v-model="state.query.authorizedGrantTypes"
          clearable
        />
      </el-form-item>
      <template #actions>
        <el-button
          v-permission="['oauthClient:add']"
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
        :label="t('oauthClient.clientId')"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        :label="t('oauthClient.authorizedGrantTypes')"
        min-width="160"
      >
        <template #default="{ row }">
          <template v-if="(row as OauthClient).authorizedGrantTypes">
            <el-tag
              v-for="g in (row as OauthClient).authorizedGrantTypes!.split(',')"
              :key="g"
              :type="grantTypeTag(g)"
              size="small"
              style="margin: 0 4px 2px 0"
            >
              {{ g.trim() }}
            </el-tag>
          </template>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="t('oauthClient.scopes')"
        min-width="130"
      >
        <template #default="{ row }">
          <template v-if="(row as OauthClient).scopes">
            <el-tag
              v-for="s in (row as OauthClient).scopes!.split(',')"
              :key="s"
              size="small"
              type="info"
              style="margin: 0 4px 2px 0"
            >
              {{ s.trim() }}
            </el-tag>
          </template>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="webServerRedirectUri"
        :label="t('oauthClient.webServerRedirectUri')"
        min-width="180"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ (row as OauthClient).webServerRedirectUri || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="accessTokenValidity"
        :label="t('oauthClient.accessTokenValidity')"
        width="160"
        align="center"
      />
      <el-table-column
        prop="refreshTokenValidity"
        :label="t('oauthClient.refreshTokenValidity')"
        width="170"
        align="center"
      />
      <el-table-column
        prop="accessTokenFormat"
        :label="t('oauthClient.accessTokenFormat')"
        width="130"
        align="center"
      >
        <template #default="{ row }">
          <el-tag
            :type="(row as OauthClient).accessTokenFormat === 'self-contained' ? 'primary' : 'info'"
            size="small"
          >
            {{ (row as OauthClient).accessTokenFormat || '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="t('oauthClient.clientAuthenticationMethods')"
        min-width="160"
      >
        <template #default="{ row }">
          <template v-if="(row as OauthClient).clientAuthenticationMethods">
            <el-tag
              v-for="m in (row as OauthClient).clientAuthenticationMethods!.split(',')"
              :key="m"
              :type="authMethodTag(m)"
              size="small"
              style="margin: 0 4px 2px 0"
            >
              {{ m.trim() }}
            </el-tag>
          </template>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        :label="t('oauthClient.createTime')"
        width="180"
      />
      <el-table-column
        :label="t('common.operation')"
        width="140"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            size="small"
            @click="onDetail(row as OauthClient)"
          >
            详情
          </el-button>
          <el-button
            v-permission="['oauthClient:edit']"
            size="small"
            @click="onEdit(row as OauthClient)"
          >
            {{ t('common.edit') }}
          </el-button>
        </template>
      </el-table-column>
    </PageTable>

    <!-- 新增/编辑对话框 -->
    <PageDialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? t('common.add') : t('common.edit')"
      :loading="submitting"
      width="680px"
      @submit="onSubmit"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="160px"
      >
        <el-form-item
          v-if="dialogMode === 'add'"
          :label="t('oauthClient.clientId')"
          prop="id"
        >
          <el-input v-model="form.id" />
        </el-form-item>
        <el-form-item
          v-if="dialogMode === 'add'"
          :label="t('oauthClient.clientSecret')"
          prop="clientSecret"
        >
          <el-input
            v-model="form.clientSecret"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item
          :label="t('oauthClient.authorizedGrantTypes')"
          prop="authorizedGrantTypes"
        >
          <el-select
            v-model="form.authorizedGrantTypes"
            multiple
            filterable
            allow-create
            default-first-option
            :placeholder="t('common.pleaseSelect')"
            style="width: 100%"
          >
            <el-option
              v-for="g in GRANT_TYPE_OPTIONS"
              :key="g.value"
              :label="g.label"
              :value="g.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('oauthClient.scopes')">
          <el-input v-model="form.scopes" />
        </el-form-item>
        <el-form-item :label="t('oauthClient.webServerRedirectUri')">
          <el-input v-model="form.webServerRedirectUri" />
        </el-form-item>
        <el-form-item :label="t('oauthClient.accessTokenValidity')">
          <el-input-number
            v-model="form.accessTokenValidity"
            :min="1"
            :max="86400"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('oauthClient.refreshTokenValidity')">
          <el-input-number
            v-model="form.refreshTokenValidity"
            :min="1"
            :max="2592000"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('oauthClient.clientAuthenticationMethods')">
          <el-select
            v-model="form.clientAuthenticationMethods"
            multiple
            filterable
            allow-create
            default-first-option
            :placeholder="t('common.pleaseSelect')"
            style="width: 100%"
          >
            <el-option
              v-for="m in AUTH_METHOD_OPTIONS"
              :key="m.value"
              :label="m.label"
              :value="m.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('oauthClient.accessTokenFormat')">
          <el-select
            v-model="form.accessTokenFormat"
            clearable
            :placeholder="t('common.pleaseSelect')"
            style="width: 100%"
          >
            <el-option
              v-for="f in TOKEN_FORMAT_OPTIONS"
              :key="f.value"
              :label="f.label"
              :value="f.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否复用刷新令牌">
          <el-select
            v-model="form.reuseRefreshToken"
            :placeholder="t('common.pleaseSelect')"
            style="width: 100%"
          >
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="单一登录">
          <el-select
            v-model="form.singleUserLogin"
            :placeholder="t('common.pleaseSelect')"
            style="width: 100%"
          >
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
      </el-form>
    </PageDialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="客户端详情"
      width="720px"
      :close-on-click-modal="false"
      @closed="detailData = null"
    >
      <template v-if="detailData">
        <el-descriptions
          :column="2"
          border
          :label-width="160"
        >
          <el-descriptions-item
            :label="t('oauthClient.clientId')"
            :span="2"
          >
            {{ detailData.id }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('oauthClient.authorizedGrantTypes')">
            <template v-if="detailData.authorizedGrantTypes">
              <el-tag
                v-for="g in detailData.authorizedGrantTypes.split(',')"
                :key="g"
                :type="grantTypeTag(g)"
                size="small"
                style="margin: 0 4px 4px 0"
              >
                {{ g.trim() }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item :label="t('oauthClient.scopes')">
            <template v-if="detailData.scopes">
              <el-tag
                v-for="s in detailData.scopes.split(',')"
                :key="s"
                size="small"
                type="info"
                style="margin: 0 4px 4px 0"
              >
                {{ s.trim() }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item
            :label="t('oauthClient.webServerRedirectUri')"
            :span="2"
          >
            {{ detailData.webServerRedirectUri || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('oauthClient.clientAuthenticationMethods')">
            <template v-if="detailData.clientAuthenticationMethods">
              <el-tag
                v-for="m in detailData.clientAuthenticationMethods.split(',')"
                :key="m"
                :type="authMethodTag(m)"
                size="small"
                style="margin: 0 4px 4px 0"
              >
                {{ m.trim() }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item :label="t('oauthClient.accessTokenValidity')">{{ detailData.accessTokenValidity ?? '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('oauthClient.refreshTokenValidity')">{{ detailData.refreshTokenValidity ?? '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('oauthClient.accessTokenFormat')">
            <el-tag
              :type="detailData.accessTokenFormat === 'self-contained' ? 'primary' : 'info'"
              size="small"
            >
              {{ detailData.accessTokenFormat || '-' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="是否复用刷新令牌">
            <el-tag
              :type="detailData.reuseRefreshToken ? 'success' : 'info'"
              size="small"
            >
              {{ detailData.reuseRefreshToken ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="单一登录">
            <el-tag
              :type="detailData.singleUserLogin ? 'success' : 'info'"
              size="small"
            >
              {{ detailData.singleUserLogin ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { usePage } from '@/composables/usePage'
import PageSearch from '@/components/PageSearch.vue'
import PageTable from '@/components/PageTable.vue'
import PageDialog from '@/components/PageDialog.vue'
import { pageOauthClient, addOauthClient, editOauthClient, getOauthClientById } from '@/api/auth/oauthClient'
import type { OauthClient } from '@/types/auth'

const { t } = useI18n()

// ==================== 列表 ====================
const { state, search, reset, onPageChange } = usePage<OauthClient, Record<string, any>>(
  pageOauthClient,
  () => ({ id: '', authorizedGrantTypes: '' })
)

// ==================== Tag 颜色映射 ====================
type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

/** OAuth2 授权类型 → Tag 颜色：把不同 grant type 视觉上区分开 */
function grantTypeTag(grant?: string): TagType {
  switch ((grant || '').trim()) {
    case 'authorization_code': return 'primary'
    case 'refresh_token':      return 'success'
    case 'password':           return 'warning'
    case 'client_credentials': return 'danger'
    case 'implicit':           return 'info'
    default:                   return 'info'
  }
}

/** OAuth2 客户端认证方式 → Tag 颜色 */
function authMethodTag(method?: string): TagType {
  switch ((method || '').trim()) {
    case 'client_secret_basic': return 'primary'
    case 'client_secret_post':  return 'success'
    case 'client_secret_jwt':   return 'warning'
    case 'private_key_jwt':     return 'danger'
    case 'none':                return 'info'
    default:                    return 'info'
  }
}

// ==================== 下拉选项常量 ====================
const GRANT_TYPE_OPTIONS = [
  { label: 'authorization_code', value: 'authorization_code' },
  { label: 'password', value: 'password' },
  { label: 'refresh_token', value: 'refresh_token' },
  { label: 'client_credentials', value: 'client_credentials' },
  { label: 'implicit', value: 'implicit' },
]

const AUTH_METHOD_OPTIONS = [
  { label: 'client_secret_basic', value: 'client_secret_basic' },
  { label: 'client_secret_post', value: 'client_secret_post' },
  { label: 'client_secret_jwt', value: 'client_secret_jwt' },
  { label: 'private_key_jwt', value: 'private_key_jwt' },
  { label: 'none', value: 'none' },
]

const TOKEN_FORMAT_OPTIONS = [
  { label: 'self-contained (JWT)', value: 'self-contained' },
  { label: 'reference (不透明)', value: 'reference' },
]

// ==================== 新增/编辑 ====================
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<Record<string, any>>({
  id: '',
  clientSecret: '',
  authorizedGrantTypes: [] as string[],
  scopes: '',
  webServerRedirectUri: '',
  accessTokenValidity: 3600,
  refreshTokenValidity: 7200,
  clientAuthenticationMethods: [] as string[],
  accessTokenFormat: 'self-contained',
  reuseRefreshToken: true,
  singleUserLogin: true
})

const formRules = computed<FormRules>(() => ({
  id: [{
    required: dialogMode.value === 'add',
    message: () => t('oauthClient.clientId'),
    trigger: 'blur'
  }],
  clientSecret: [{
    required: dialogMode.value === 'add',
    message: () => t('oauthClient.clientSecret'),
    trigger: 'blur'
  }],
  authorizedGrantTypes: [{
    validator: (_rule: any, value: any, callback: any) => {
      if (!value || value.length === 0) {
        callback(new Error(t('oauthClient.authorizedGrantTypes')))
      } else {
        callback()
      }
    },
    trigger: 'change'
  }]
}))

function onAdd() {
  dialogMode.value = 'add'
  Object.assign(form, {
    id: '',
    clientSecret: '',
    authorizedGrantTypes: [],
    scopes: '',
    webServerRedirectUri: '',
    accessTokenValidity: 3600,
    refreshTokenValidity: 7200,
    clientAuthenticationMethods: [],
    accessTokenFormat: 'self-contained',
    reuseRefreshToken: true,
    singleUserLogin: true
  })
  dialogVisible.value = true
}

async function onEdit(row: OauthClient) {
  dialogMode.value = 'edit'
  try {
    const detail = await getOauthClientById(row.id!)
    Object.assign(form, {
      id: detail.id || '',
      clientSecret: '',
      authorizedGrantTypes: (detail.authorizedGrantTypes || '').split(',').filter(Boolean),
      scopes: detail.scopes || '',
      webServerRedirectUri: detail.webServerRedirectUri || '',
      accessTokenValidity: detail.accessTokenValidity ?? 3600,
      refreshTokenValidity: detail.refreshTokenValidity ?? 7200,
      clientAuthenticationMethods: (detail.clientAuthenticationMethods || '').split(',').filter(Boolean),
      accessTokenFormat: detail.accessTokenFormat || 'self-contained',
      reuseRefreshToken: detail.reuseRefreshToken ?? true,
      singleUserLogin: detail.singleUserLogin ?? true
    })
  } catch {
    Object.assign(form, {
      id: row.id || '',
      clientSecret: '',
      authorizedGrantTypes: (row.authorizedGrantTypes || '').split(',').filter(Boolean),
      scopes: row.scopes || '',
      webServerRedirectUri: row.webServerRedirectUri || '',
      accessTokenValidity: row.accessTokenValidity ?? 3600,
      refreshTokenValidity: row.refreshTokenValidity ?? 7200,
      clientAuthenticationMethods: (row.clientAuthenticationMethods || '').split(',').filter(Boolean),
      accessTokenFormat: row.accessTokenFormat || 'self-contained',
      reuseRefreshToken: row.reuseRefreshToken ?? true,
      singleUserLogin: row.singleUserLogin ?? true
    })
  }
  dialogVisible.value = true
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    const body: Record<string, any> = {
      id: form.id,
      // 多选数组 → 逗号分隔字符串（后端存储格式）
      authorizedGrantTypes: (form.authorizedGrantTypes as string[]).join(',') || undefined,
      clientAuthenticationMethods: (form.clientAuthenticationMethods as string[]).join(',') || undefined,
      scopes: form.scopes || undefined,
      webServerRedirectUri: form.webServerRedirectUri || undefined,
      accessTokenValidity: form.accessTokenValidity,
      refreshTokenValidity: form.refreshTokenValidity,
      accessTokenFormat: form.accessTokenFormat || undefined,
      reuseRefreshToken: form.reuseRefreshToken,
      singleUserLogin: form.singleUserLogin
    }
    if (dialogMode.value === 'add') {
      body.clientSecret = form.clientSecret
      await addOauthClient(body)
    } else {
      await editOauthClient(body)
    }
    ElMessage.success(t('common.success'))
    dialogVisible.value = false
    search()
  } catch (e: any) {
    ElMessage.error(e?.message || t('common.fail'))
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  formRef.value?.resetFields()
}

// ==================== 详情 ====================
const detailVisible = ref(false)
const detailData = ref<OauthClient | null>(null)

async function onDetail(row: OauthClient) {
  try {
    detailData.value = await getOauthClientById(row.id!)
  } catch {
    detailData.value = { ...row } as OauthClient
  }
  detailVisible.value = true
}

onMounted(search)
</script>

<style scoped>
/* 详情描述：长文本（客户端 ID、回调 URL 等）在单元格内换行，不撑破弹窗宽度 */
:deep(.el-descriptions__label) {
  white-space: nowrap;
}
:deep(.el-descriptions__content) {
  word-break: break-all;
  overflow-wrap: break-word;
}

/* 对话框表单的 label 点击不触发 select 下拉（默认行为：点击 label 会 focus 关联控件） */
:deep(.el-dialog .el-form-item__label) {
  pointer-events: none;
}
</style>