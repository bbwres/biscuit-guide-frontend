<template>
  <div class="page">
    <!-- 搜索区 -->
    <PageSearch
      v-model="state.query"
      @search="search"
      @reset="reset"
    >
      <el-form-item :label="t('menu.name')">
        <el-input
          v-model="state.query.name"
          clearable
          :placeholder="t('common.pleaseInput')"
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
        </el-select>
      </el-form-item>
      <template #actions>
        <el-button
          v-permission="['menu:add']"
          type="primary"
          @click="onAdd()"
        >
          {{ t('common.add') }}
        </el-button>
        <el-button
          type="danger"
          @click="toggleExpand"
        >
          {{ isExpanded ? t('menu.collapse') : t('menu.expand') }}
        </el-button>
        <el-button @click="onRefreshCache">
          {{ t('menu.refreshCache') }}
        </el-button>
      </template>
    </PageSearch>

    <!-- 树形表格 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="filteredTree"
      row-key="id"
      :tree-props="{ children: 'children' }"
      :default-expand-all="isExpanded"
      :key="tableKey"
      :max-height="tableMaxHeight"
      :indent="22"
      stripe
    >
      <!-- 菜单名称作为第一列：el-table 会把树形展开图标 + 层级缩进挂到第一列上，
           因此第一列必须是数据列（不能是序号列），层级关系才看得出来 -->
      <el-table-column
        prop="name"
        :label="t('menu.name')"
        min-width="260"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ (row as MenuNode).name }}
        </template>
      </el-table-column>
      <el-table-column
        prop="menuType"
        :label="t('menu.menuType')"
        width="90"
        align="center"
      >
        <template #default="{ row }">
          <el-tag
            :type="menuTypeTagType((row as MenuNode).menuType)"
            size="small"
          >
            {{ menuTypeLabel((row as MenuNode).menuType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="icon"
        :label="t('menu.icon')"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-icon v-if="(row as MenuNode).icon">
            <component :is="(row as MenuNode).icon" />
          </el-icon>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="menuSort"
        :label="t('menu.menuSort')"
        width="80"
        align="center"
      />
      <el-table-column
        prop="componentName"
        :label="t('menu.componentName')"
        min-width="160"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ (row as MenuNode).componentName || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="component"
        :label="t('menu.component')"
        min-width="200"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ (row as MenuNode).component || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        :label="t('menu.menuApiList')"
        min-width="240"
        align="left"
        class-name="menu-api-col"
      >
        <template #default="{ row }">
          <template v-if="(row as MenuNode).menuApiList?.length">
            <el-tooltip
              v-for="(api, idx) in (row as MenuNode).menuApiList"
              :key="api.id || idx"
              :content="(api.apiUrlMethod || '-') + ' ' + api.apiUrl"
              placement="top"
              :show-after="300"
            >
              <div class="menu-api-item">
                <el-tag
                  :type="methodTagType(api.apiUrlMethod)"
                  size="small"
                  class="menu-api-method"
                >
                  {{ api.apiUrlMethod || '-' }}
                </el-tag>
                <span class="menu-api-url">{{ api.apiUrl }}</span>
              </div>
            </el-tooltip>
          </template>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
      <el-table-column
        :label="t('common.status')"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-switch
            v-permission="['menu:editStatus']"
            :model-value="(row as MenuNode).status === 'NORMAL'"
            @change="onToggleStatus(row as MenuNode)"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="t('common.operation')"
        width="260"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            size="small"
            @click="onDetail(row as MenuNode)"
          >
            详情
          </el-button>
          <el-button
            v-permission="['menu:edit']"
            size="small"
            @click="onEdit(row as MenuNode)"
          >
            {{ t('common.edit') }}
          </el-button>
          <el-button
            v-permission="['menu:add']"
            size="small"
            @click="onAdd((row as MenuNode).id)"
          >
            + {{ t('common.add') }}
          </el-button>
          <el-button
            v-permission="['menu:delete']"
            size="small"
            type="danger"
            @click="onDelete(row as MenuNode)"
          >
            {{ t('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <PageDialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? t('common.add') : t('common.edit')"
      :loading="submitting"
      width="720px"
      @submit="onSubmit"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <!-- 第一行：父菜单（占满） -->
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item
              :label="t('menu.parentId')"
              prop="parentId"
            >
              <el-tree-select
                v-model="form.parentId"
                :data="parentMenuOptions"
                :props="{ label: 'name', children: 'children', value: 'id' }"
                check-strictly
                filterable
                clearable
                :disabled="parentLocked"
                :placeholder="t('menu.topMenu')"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 两列布局：基础属性 -->
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item
              :label="t('menu.name')"
              prop="name"
            >
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="t('menu.menuType')"
              prop="menuType"
            >
              <el-select
                v-model="form.menuType"
                style="width: 100%"
              >
                <el-option label="目录" value="DIR" />
                <el-option label="菜单" value="MENU" />
                <el-option label="按钮" value="BUTTON" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              :label="t('menu.icon')"
              prop="icon"
            >
              <el-input
                v-model="form.icon"
                :placeholder="t('menu.iconPlaceholder')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="t('menu.menuSort')"
              prop="menuSort"
            >
              <el-input-number
                v-model="form.menuSort"
                :min="0"
                :max="9999"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              :label="t('menu.component')"
              prop="component"
            >
              <el-input v-model="form.component" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="t('menu.componentName')"
              prop="componentName"
            >
              <el-input v-model="form.componentName" />
            </el-form-item>
          </el-col>

          <!-- 三个开关，两列展示 -->
          <el-col :span="12">
            <el-form-item :label="t('menu.visible')">
              <el-switch v-model="form.visible" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('menu.keepAlive')">
              <el-switch v-model="form.keepAlive" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('menu.alwaysShow')">
              <el-switch v-model="form.alwaysShow" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 请求接口列表（仅 MENU/BUTTON 类型显示，独占一行） -->
        <el-form-item
          v-if="form.menuType === 'MENU' || form.menuType === 'BUTTON'"
          :label="t('menu.menuApiList')"
        >
          <div style="width: 100%">
            <div
              v-for="(item, idx) in form.menuApiList"
              :key="idx"
              style="display: flex; gap: 8px; margin-bottom: 8px;"
            >
              <el-select
                v-model="item.apiUrlMethod"
                clearable
                :placeholder="t('menu.apiUrlMethod')"
                style="width: 110px; flex: none"
              >
                <el-option label="GET" value="GET" />
                <el-option label="POST" value="POST" />
                <el-option label="PUT" value="PUT" />
                <el-option label="DELETE" value="DELETE" />
              </el-select>
              <el-input
                v-model="item.apiUrl"
                :placeholder="t('menu.apiUrl')"
                style="flex: 1"
              />
              <el-button
                type="danger"
                link
                @click="removeApiRow(idx)"
              >
                {{ t('menu.removeApi') }}
              </el-button>
            </div>
            <el-button
              type="primary"
              link
              @click="addApiRow"
            >
              + {{ t('menu.addApi') }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </PageDialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="菜单详情"
      width="720px"
      :close-on-click-modal="false"
      @closed="detailData = null"
    >
      <template v-if="detailData">
        <el-descriptions
          :column="2"
          border
          :label-width="120"
        >
          <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
          <el-descriptions-item :label="t('menu.name')">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item :label="t('menu.menuType')">
            <el-tag
              :type="menuTypeTagType(detailData.menuType)"
              size="small"
            >
              {{ menuTypeLabel(detailData.menuType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('menu.menuSort')">{{ detailData.menuSort ?? '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('menu.parentId')">{{ detailData.parentId || '顶级菜单' }}</el-descriptions-item>
          <el-descriptions-item :label="t('common.status')">
            <el-tag :type="detailData.status === 'NORMAL' ? 'success' : 'info'">
              {{ detailData.status === 'NORMAL' ? t('common.enabled') : t('common.disabled') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('menu.icon')">
            <el-icon v-if="detailData.icon">
              <component :is="detailData.icon" />
            </el-icon>
            <span v-if="detailData.icon">&nbsp;{{ detailData.icon }}</span>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item :label="t('menu.componentName')">{{ detailData.componentName || '-' }}</el-descriptions-item>
          <el-descriptions-item
            :label="t('menu.component')"
            :span="2"
          >
            {{ detailData.component || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('menu.visible')">
            <el-tag
              :type="detailData.visible ? 'success' : 'info'"
              size="small"
            >
              {{ detailData.visible ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('menu.keepAlive')">
            <el-tag
              :type="detailData.keepAlive ? 'success' : 'info'"
              size="small"
            >
              {{ detailData.keepAlive ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('menu.alwaysShow')">
            <el-tag
              :type="detailData.alwaysShow ? 'success' : 'info'"
              size="small"
            >
              {{ detailData.alwaysShow ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="树形路径">{{ detailData.treePath || '-' }}</el-descriptions-item>
          <el-descriptions-item
            :label="t('menu.menuApiList')"
            :span="2"
          >
            <template v-if="detailData.menuApiList?.length">
              <div
                v-for="(api, idx) in detailData.menuApiList"
                :key="api.id || idx"
                class="menu-api-item"
                style="margin-bottom: 4px"
              >
                <el-tag
                  :type="methodTagType(api.apiUrlMethod)"
                  size="small"
                  class="menu-api-method"
                >
                  {{ api.apiUrlMethod || '-' }}
                </el-tag>
                <span>{{ api.apiUrl }}</span>
              </div>
            </template>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ detailData.creator || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detailData.updateTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新人">{{ detailData.updater || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import PageSearch from '@/components/PageSearch.vue'
import PageDialog from '@/components/PageDialog.vue'
import {
  getMenuTree,
  getMenuById,
  addMenu,
  editMenu,
  editMenuStatus,
  deleteMenu,
  refreshMenuCache
} from '@/api/auth/menu'
import type { MenuNode } from '@/utils/menu'

const { t } = useI18n()

// ==================== 列表 ====================
const tree = ref<MenuNode[]>([])
const loading = ref(false)
const isExpanded = ref(false)
const tableKey = ref(0)
/** el-table 实例引用，用于按容器位置动态计算 max-height */
const tableRef = ref<any>(null)
/** 表格最大高度：随 viewport 变化重算，避免菜单全展开后撑破页面把搜索区顶走 */
const tableMaxHeight = ref(500)

/** 根据表格距 viewport 顶部的距离，反推可用最大高度（留 24px 给 page 底部 padding + 安全余量） */
function calcTableMaxHeight() {
  const el = tableRef.value?.$el as HTMLElement | undefined
  if (!el) return
  const top = el.getBoundingClientRect().top
  tableMaxHeight.value = Math.max(240, window.innerHeight - top - 24)
}

/** 递归过滤树 */
function filterTree(nodes: MenuNode[], name?: string, status?: string): MenuNode[] {
  if (!name && !status) return nodes
  return nodes
    .map(node => {
      const matchName = !name || node.name.includes(name)
      const matchStatus = !status || node.status === status
      const filteredChildren = node.children ? filterTree(node.children, name, status) : []
      if (matchName && matchStatus) {
        return { ...node, children: filteredChildren.length ? filteredChildren : node.children }
      }
      if (filteredChildren.length) {
        return { ...node, children: filteredChildren }
      }
      return null
    })
    .filter(Boolean) as MenuNode[]
}

// ==================== 搜索 ====================
// state.query 绑定到搜索框输入；appliedQuery 才是真正应用到表格过滤的条件
// 这样输入框变化不会触发自动搜索，必须点击「搜索」按钮才生效
const state = reactive({
  query: { name: '', status: '' }
})
const appliedQuery = reactive({ name: '', status: '' })

const filteredTree = computed(() => {
  const { name, status } = appliedQuery
  return filterTree(tree.value, name || undefined, status || undefined)
})

function search() {
  // 把当前输入框的值快照到 appliedQuery，触发 filteredTree 重新计算
  appliedQuery.name = state.query.name
  appliedQuery.status = state.query.status
}

function reset() {
  state.query.name = ''
  state.query.status = ''
  appliedQuery.name = ''
  appliedQuery.status = ''
}

async function load() {
  loading.value = true
  try {
    tree.value = await getMenuTree()
  } finally {
    loading.value = false
  }
}

/** 展开/折叠切换 */
function toggleExpand() {
  isExpanded.value = !isExpanded.value
  tableKey.value++
}

// ==================== 状态开关 ====================
async function onToggleStatus(row: MenuNode) {
  const next = row.status === 'NORMAL' ? 'DISABLED' : 'NORMAL'
  const action = next === 'DISABLED' ? t('common.disabled') : t('common.enabled')
  await ElMessageBox.confirm(
    `确定要${action}菜单「${row.name}」吗？`,
    t('common.confirm'),
    { confirmButtonText: t('common.confirm'), cancelButtonText: t('common.cancel'), type: 'warning' }
  )
  await editMenuStatus({ id: row.id, status: next as any })
  ElMessage.success(t('common.success'))
  load()
}

// ==================== 删除 ====================
async function onDelete(row: MenuNode) {
  await ElMessageBox.confirm(
    `确定要删除菜单「${row.name}」吗？`,
    t('common.confirm'),
    { confirmButtonText: t('common.confirm'), cancelButtonText: t('common.cancel'), type: 'warning' }
  )
  try {
    await deleteMenu(row.id)
    ElMessage.success(t('common.success'))
    load()
  } catch (e: any) {
    ElMessage.error(e?.message || t('common.fail'))
  }
}

// ==================== 刷新缓存 ====================
async function onRefreshCache() {
  try {
    await refreshMenuCache()
    ElMessage.success(t('menu.refreshCacheSuccess'))
  } catch (e: any) {
    ElMessage.error(e?.message || t('common.fail'))
  }
}

// ==================== 新增/编辑对话框 ====================
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const formRef = ref<FormInstance>()
/** 行内 + 新增 时父菜单锁定不可改；顶部 + 新增 / 编辑 不锁定 */
const parentLocked = ref(false)

const form = reactive({
  id: '',
  parentId: '',
  name: '',
  menuType: 'MENU' as string,
  icon: '',
  menuSort: 0,
  component: '',
  componentName: '',
  menuApiList: [] as Array<{ id?: string; apiUrl: string; apiUrlMethod: string }>,
  visible: true,
  keepAlive: false,
  alwaysShow: false
})

/** 接口请求方法对应的 Tag 颜色 */
function methodTagType(method?: string): 'success' | 'primary' | 'warning' | 'danger' | 'info' {
  switch ((method || '').toUpperCase()) {
    case 'GET':
      return 'success'
    case 'POST':
      return 'primary'
    case 'PUT':
      return 'warning'
    case 'DELETE':
      return 'danger'
    default:
      return 'info'
  }
}

/** 菜单类型 → 中文标签 */
function menuTypeLabel(type?: string): string {
  switch (type) {
    case 'DIR': return '目录'
    case 'MENU': return '菜单'
    case 'BUTTON': return '按钮'
    default: return type ?? '-'
  }
}

/** 菜单类型 → Tag 颜色 */
function menuTypeTagType(type?: string): 'primary' | 'success' | 'warning' | 'info' {
  switch (type) {
    case 'DIR': return 'info'
    case 'MENU': return 'primary'
    case 'BUTTON': return 'warning'
    default: return 'info'
  }
}

/** 表单中接口列表行操作 */
function addApiRow() {
  form.menuApiList.push({ apiUrl: '', apiUrlMethod: 'GET' })
}

function removeApiRow(idx: number) {
  form.menuApiList.splice(idx, 1)
}

const formRules = computed<FormRules>(() => ({
  name: [{ required: true, message: () => t('menu.name'), trigger: 'blur' }],
  menuType: [{ required: true, message: () => t('menu.menuType'), trigger: 'change' }],
  menuSort: [{ required: true, message: () => t('menu.menuSort'), trigger: 'blur' }]
}))

/** 父级菜单选项：从已有菜单树构建 */
const parentMenuOptions = computed(() => {
  return [{ id: '', name: t('menu.topMenu'), children: tree.value }]
})

// ==================== 详情对话框 ====================
const detailVisible = ref(false)
const detailData = ref<MenuNode | null>(null)

async function onDetail(row: MenuNode) {
  // 优先取后端最新数据，失败时 fallback 到当前行（按钮等情况后端 detail 可能不存在）
  try {
    const detail = await getMenuById(row.id)
    detailData.value = detail as any
  } catch {
    detailData.value = { ...row } as MenuNode
  }
  detailVisible.value = true
}

function onAdd(parentId = '') {
  dialogMode.value = 'add'
  // 行内 + 新增（传入 parentId）锁定父菜单；顶部 + 新增（无 parentId）允许选择
  parentLocked.value = !!parentId
  Object.assign(form, {
    id: '',
    parentId: parentId || '',
    name: '',
    menuType: 'MENU',
    icon: '',
    menuSort: 0,
    component: '',
    componentName: '',
    menuApiList: [],
    visible: true,
    keepAlive: false,
    alwaysShow: false
  })
  dialogVisible.value = true
}

async function onEdit(row: MenuNode) {
  dialogMode.value = 'edit'
  // 编辑场景父菜单可改（用于移动菜单层级）
  parentLocked.value = false
  try {
    const detail = await getMenuById(row.id)
    Object.assign(form, {
      id: detail.id || '',
      parentId: detail.parentId || '',
      name: detail.name || '',
      menuType: detail.menuType || 'MENU',
      icon: detail.icon || '',
      menuSort: detail.menuSort ?? 0,
      component: detail.component || '',
      componentName: detail.componentName || '',
      menuApiList: (detail.menuApiList || []).map((api: any) => ({
        id: api.id,
        apiUrl: api.apiUrl || '',
        apiUrlMethod: api.apiUrlMethod || ''
      })),
      visible: detail.visible ?? true,
      keepAlive: detail.keepAlive ?? false,
      alwaysShow: detail.alwaysShow ?? false
    })
  } catch {
    Object.assign(form, {
      id: row.id,
      parentId: row.parentId || '',
      name: row.name,
      menuType: row.menuType || 'MENU',
      icon: row.icon || '',
      menuSort: row.menuSort ?? 0,
      component: row.component || '',
      componentName: row.componentName || '',
      menuApiList: (row.menuApiList || []).map((api: any) => ({
        id: api.id,
        apiUrl: api.apiUrl || '',
        apiUrlMethod: api.apiUrlMethod || ''
      })),
      visible: row.visible ?? true,
      keepAlive: row.keepAlive ?? false,
      alwaysShow: row.alwaysShow ?? false
    })
  }
  dialogVisible.value = true
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    const body = {
      id: dialogMode.value === 'edit' ? form.id : undefined,
      parentId: form.parentId || undefined,
      name: form.name,
      menuType: form.menuType,
      icon: form.icon || undefined,
      menuSort: form.menuSort,
      component: form.component || undefined,
      componentName: form.componentName || undefined,
      // 目录(DIR)不提交接口列表；菜单/按钮只取非空行
      menuApiList: form.menuType === 'DIR'
        ? []
        : form.menuApiList
            .filter(item => item.apiUrl && item.apiUrl.trim())
            .map(item => ({
              id: item.id,
              apiUrl: item.apiUrl.trim(),
              apiUrlMethod: item.apiUrlMethod || undefined
            })),
      visible: form.visible,
      keepAlive: form.keepAlive,
      alwaysShow: form.alwaysShow
    }
    if (dialogMode.value === 'add') {
      await addMenu(body)
    } else {
      await editMenu(body)
    }
    ElMessage.success(t('common.success'))
    dialogVisible.value = false
    load()
  } catch (e: any) {
    ElMessage.error(e?.message || t('common.fail'))
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  formRef.value?.resetFields()
}

onMounted(() => {
  load()
  // 等表格挂载后再算一次（首次渲染 ref 就绪）
  nextTick(calcTableMaxHeight)
  window.addEventListener('resize', calcTableMaxHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', calcTableMaxHeight)
})
</script>

<style scoped>
/* 树形展开图标 + 层级缩进自动挂在「菜单名称」列（第一列）上。
   indent prop 由 el-table 设为 22；EP 通过 .el-table__indent 的 padding-left 实现缩进，
   一定不要 override 它的 padding-left。 */
:deep(.el-table .cell .el-table__placeholder) {
  /* 叶子节点占位宽度，与有展开图标的行左对齐 */
  width: 22px;
}
:deep(.el-table__expand-icon) {
  margin-right: 4px;
  color: var(--el-color-primary);
}

/* 请求接口列：单元格不换行、单行展示，溢出由 el-tooltip 兜底 */
:deep(.menu-api-col) .cell {
  text-align: left;
}
.menu-api-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  max-width: 100%;
  min-width: 0;
}
.menu-api-item:last-child {
  margin-bottom: 0;
}
.menu-api-method {
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
}
.menu-api-url {
  flex: 1 1 auto;
  /* flex item 默认 min-width:auto，会被内容撑开不被压缩；
     必须显式置 0 才能让 overflow ellipsis 生效 */
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-regular);
  font-size: 12px;
}
</style>
