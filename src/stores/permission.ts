import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import type { MenuNode } from '@/utils/menu'
import { filterMenuTree, toRouteRecordRaw } from '@/utils/menu'
import { resolveComponentByPath } from '@/router/menuComponentMap'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    dynamicRoutes: [] as RouteRecordRaw[],
    sidebarMenus: [] as MenuNode[]
  }),
  actions: {
    setRoutes(routes: RouteRecordRaw[], menus: MenuNode[]) {
      this.dynamicRoutes = routes
      this.sidebarMenus = menus
    },
    reset() {
      this.dynamicRoutes = []
      this.sidebarMenus = []
    }
  }
})

/** 工具函数：把后端菜单转路由 + 侧边栏 */
export function transformMenus(menus: MenuNode[], layoutComponent: any) {
  const tree = filterMenuTree(menus)
  const routes = toRouteRecordRaw(tree, layoutComponent, resolveComponentByPath)
  return { tree, routes }
}
