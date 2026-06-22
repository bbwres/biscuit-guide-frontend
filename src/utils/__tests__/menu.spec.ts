import { describe, it, expect, vi } from 'vitest'
import {
  filterMenuTree,
  toRouteRecordRaw,
  collectButtonPermissions,
  findFirstLeafPath,
  type MenuNode
} from '../menu'

// 对齐后端实测：嵌套树、camelCase、大写枚举、parentId 可空
// menuType 取值 DIR/MENU/BUTTON；BUTTON 的 component 字段即权限码
const nestedSample: MenuNode[] = [
  { id: '1', name: '工作台', menuType: 'MENU', icon: 'House', menuSort: 1, status: 'NORMAL', componentName: 'Dashboard', component: '@/views/dashboard/index.vue' },
  {
    id: '2', parentId: '', name: '权限管理', menuType: 'DIR', icon: 'UserFilled', menuSort: 2, status: 'NORMAL',
    children: [
      { id: '3', parentId: '2', name: '登录账户', menuType: 'MENU', componentName: 'LoginAccount', component: '@/views/auth/loginAccount/index.vue', menuSort: 1, status: 'NORMAL' },
      { id: '4', parentId: '2', name: '文件管理', menuType: 'MENU', componentName: 'FileInfo', component: '@/views/basic/fileInfo/index.vue', menuSort: 2, status: 'NORMAL' },
      { id: '5', parentId: '2', name: '编辑账户', menuType: 'BUTTON', component: 'loginAccount:edit', menuSort: 1, status: 'NORMAL' }
    ]
  }
]

const fakeResolver = vi.fn((path?: string | null) => `resolved(${path})`)

describe('filterMenuTree', () => {
  it('preserves the backend-provided nested structure', () => {
    const tree = filterMenuTree(nestedSample)
    expect(tree.length).toBe(2)
    expect(tree[1].children?.length).toBe(2)
    expect(tree[1].children![0].id).toBe('3')
  })

  it('strips BUTTON entries', () => {
    const tree = filterMenuTree(nestedSample)
    expect(tree[1].children?.find((c) => c.id === '5')).toBeUndefined()
  })

  it('strips non-NORMAL status entries', () => {
    const tree = filterMenuTree([
      ...nestedSample,
      { id: '9', name: 'disabled', menuType: 'MENU', menuSort: 99, status: 'DISABLED' }
    ])
    expect(tree.find((m) => m.id === '9')).toBeUndefined()
  })

  it('case-insensitive status check', () => {
    const tree = filterMenuTree([
      { id: '1', name: 'lower', menuType: 'MENU', menuSort: 1, status: 'normal' }
    ])
    expect(tree.length).toBe(1)
  })
})

describe('collectButtonPermissions', () => {
  it('collects component (used as permission code) from BUTTON entries', () => {
    const perms = collectButtonPermissions(nestedSample)
    expect(perms).toEqual(['loginAccount:edit'])
  })

  it('skips BUTTON entries without component', () => {
    const perms = collectButtonPermissions([
      { id: 'b', name: 'no perm code', menuType: 'BUTTON', menuSort: 1, status: 'NORMAL' }
    ])
    expect(perms).toEqual([])
  })

  it('returns empty array when no buttons', () => {
    expect(
      collectButtonPermissions([
        { id: '1', name: '页面', menuType: 'MENU', menuSort: 1, status: 'NORMAL' }
      ])
    ).toEqual([])
  })
})

describe('toRouteRecordRaw (URL = componentName kebab-case)', () => {
  it('returns leaf routes with kebab-case componentName paths', () => {
    const tree = filterMenuTree(nestedSample)
    const routes = toRouteRecordRaw(tree, 'Layout', fakeResolver as any)
    // 3 个叶子（id 1/3/4），父菜单（id 2）和按钮（id 5）不出独立路由
    expect(routes.length).toBe(3)
    expect(routes.map((r) => r.path).sort()).toEqual(['dashboard', 'file-info', 'login-account'])
  })

  it('falls back to id when componentName is missing', () => {
    const tree = filterMenuTree([
      { id: 'fallback-id', name: 'no name', menuType: 'MENU', menuSort: 1, status: 'NORMAL' }
    ])
    const routes = toRouteRecordRaw(tree, 'Layout', fakeResolver as any)
    expect(routes[0].path).toBe('fallback-id')
  })

  it('PascalCase: FileInfo → file-info, LoginAccount → login-account', () => {
    expect(nestedSample[1].children?.[0].componentName).toBe('LoginAccount')
    expect(nestedSample[1].children?.[1].componentName).toBe('FileInfo')
  })

  it('leaf with component: passes through resolver', () => {
    const tree = filterMenuTree(nestedSample)
    const routes = toRouteRecordRaw(tree, 'Layout', fakeResolver as any)
    const leaf = routes.find((r) => r.path === 'dashboard')
    expect(leaf.component).toBe('resolved(@/views/dashboard/index.vue)')
    expect(leaf.name).toBe('dashboard')
  })

  it('leaf without component: falls back to layoutComponent', () => {
    const tree = filterMenuTree([
      { id: 'p', name: 'parent', menuType: 'MENU', menuSort: 1, status: 'NORMAL', children: [
        { id: 'c1', parentId: 'p', name: 'leaf no comp', menuType: 'MENU', menuSort: 1, status: 'NORMAL' }
      ]}
    ])
    const routes = toRouteRecordRaw(tree, 'Layout', fakeResolver as any)
    expect(routes[0].component).toBe('Layout')
  })

  it('meta includes title, icon, menuId, componentName', () => {
    const tree = filterMenuTree(nestedSample)
    const routes = toRouteRecordRaw(tree, 'Layout', fakeResolver as any)
    const leaf = routes.find((r) => r.path === 'login-account')
    expect(leaf.meta).toEqual({
      title: '登录账户',
      icon: undefined,
      menuId: '3',
      componentName: 'LoginAccount',
      keepAlive: undefined
    })
  })
})

describe('findFirstLeafPath', () => {
  it('returns first leaf path in depth-first order (skips parents)', () => {
    expect(findFirstLeafPath(nestedSample)).toBe('dashboard')
  })

  it('returns first leaf when tree is a single leaf', () => {
    expect(findFirstLeafPath([
      { id: 'x', name: 'only', menuType: 'MENU', componentName: 'Only', menuSort: 1, status: 'NORMAL' }
    ])).toBe('only')
  })
})
