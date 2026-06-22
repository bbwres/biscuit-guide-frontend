/**
 * 与后端 `cn.bbwres.biscuit.module.auth.api.vo.MenuRespVO` 字段对齐。
 * 实测后端 Jackson 序列化为 camelCase + 大写枚举名（DIR / MENU / BUTTON，详见
 * 后端 `cn.bbwres.biscuit.module.auth.enums.MenuTypeEnum`）。
 * `parentId` 可空（顶级菜单没有父）。
 *
 * 类型语义：
 *   - DIR    目录，仅作侧边栏分组节点，不挂组件、不调接口
 *   - MENU   菜单，对应一个页面/路由
 *   - BUTTON 按钮，**复用 `component` 字段作为前端权限码**
 *            （菜单表当前没有独立权限码字段，故约定 BUTTON 的 component 即权限码，
 *            与 `v-permission="['xxx:yyy']"` 比对）
 */
export interface MenuApiItem {
  id?: string
  menuId?: string
  apiUrl: string
  apiUrlMethod?: string
}

export interface MenuNode {
  id: string
  parentId?: string | null
  name: string
  menuType: 'DIR' | 'MENU' | 'BUTTON'
  menuSort: number
  icon?: string
  /** MENU：组件路径；BUTTON：复用为权限码（如 loginAccount:add） */
  component?: string
  componentName?: string
  visible?: boolean
  keepAlive?: boolean
  alwaysShow?: boolean
  /** 菜单关联的接口列表（一对多，仅 MENU/BUTTON 可配） */
  menuApiList?: MenuApiItem[]
  status: string
  treePath?: string
  createTime?: string
  creator?: string
  updater?: string
  updateTime?: string
  tenantId?: string
  children?: MenuNode[]
  /** 前端可覆盖：若 i18n key 改了，外部组件可设置该字段以让 SidebarItem 优先用 key 渲染 */
  titleKey?: string
}

/**
 * 后端已返嵌套树，本函数做轻量过滤：
 *   - 剔除 BUTTON 与 DISABLED
 *   - 按 `menuSort` 升序排序（后端不保证返回顺序，前端需自己排）；同 sort 时按 id 兜底，结果稳定
 * **保留 children 结构**，不要再用 `parentId` 客户端拼树 ——
 * 后端的 `parentId` 可能是 `""` 空字符串，客户端拼树会错把父菜单判成顶级然后把子菜单错放顶级。
 */
export function filterMenuTree(tree: MenuNode[]): MenuNode[] {
  const sortNodes = (arr: MenuNode[]): MenuNode[] =>
    [...arr].sort((a, b) => {
      const sa = a.menuSort ?? 0
      const sb = b.menuSort ?? 0
      if (sa !== sb) return sa - sb
      return String(a.id).localeCompare(String(b.id))
    })

  const walk = (arr: MenuNode[]): MenuNode[] => {
    const filtered = arr
      .filter((m) => m.menuType !== 'BUTTON' && String(m.status).toUpperCase() === 'NORMAL')
      .map((m) => ({
        ...m,
        children: m.children?.length ? walk(m.children) : undefined
      }))
    return sortNodes(filtered)
  }
  return walk(tree)
}

/** 保留旧函数签名（兼容旧调用），内部走 filterMenuTree */
export function buildSidebarTree(menus: MenuNode[]): MenuNode[] {
  return filterMenuTree(menus)
}

/**
 * 递归收集所有 BUTTON 类型菜单的权限码（用于前端 `v-permission` 校验）。
 *
 * 当前菜单表没有独立的"权限码"字段，约定 BUTTON 的 `component` 字段即权限码
 * （形如 `loginAccount:add`、`role:menuAssign`）。仅收 `component` 不为空的项；
 * `menuApiList[].apiUrl` 是后端 RBAC 做接口鉴权用的，不参与前端按钮显隐。
 */
export function collectButtonPermissions(menus: MenuNode[]): string[] {
  const out: string[] = []
  const walk = (arr: MenuNode[]) => {
    for (const m of arr) {
      if (m.menuType === 'BUTTON' && m.component) {
        out.push(m.component)
      }
      if (m.children?.length) walk(m.children)
    }
  }
  walk(menus)
  return out
}

import { componentNameToPath } from '@/router/menuComponentMap'

/**
 * 把后端菜单树转成 vue-router 路由 + 侧边栏菜单。
 *
 * - 父菜单**不**生成独立路由（点击父菜单 = 跳到第一个子菜单）
 * - 叶子菜单作为顶级路由返回，调用方用 `router.addRoute('Root', leaf)` 挂到静态根路由下
 *   → URL 是叶子路径（kebab-case 的 componentName，缺失时 fallback 到 id）
 * - 叶子节点的 component 通过 `resolveComponentByPath(node.component)` 解析；找不到走 MenuPlaceholder
 * - 优先用 `componentName`（如 "LoginAccount" → URL `/login-account`），缺失时 fallback 到 `id`
 */
export function toRouteRecordRaw(
  tree: MenuNode[],
  layoutComponent: any,
  resolveComponentByPath: (path?: string | null) => any
): any[] {
  const leaves: any[] = []
  const walk = (nodes: MenuNode[]) => {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        walk(node.children)
        continue
      }
      // 叶子
      const routeKey = componentNameToPath(node.componentName, node.id)
      leaves.push({
        path: routeKey,
        name: routeKey,
        component: node.component ? resolveComponentByPath(node.component) : layoutComponent,
        meta: {
          title: node.name,
          icon: node.icon,
          menuId: node.id,
          componentName: node.componentName,
          keepAlive: node.keepAlive
        }
      })
    }
  }
  walk(tree)
  return leaves
}

/**
 * 找第一个叶子菜单的路由 path（kebab-case componentName 或 id 兜底）
 */
export function findFirstLeafPath(tree: MenuNode[]): string | undefined {
  for (const node of tree) {
    if (node.children && node.children.length > 0) {
      const p = findFirstLeafPath(node.children)
      if (p) return p
    } else {
      return componentNameToPath(node.componentName, node.id)
    }
  }
  return undefined
}
