import type { Router, RouteRecordRaw } from 'vue-router'
import type { MenuNode } from '@/utils/menu'
import { usePermissionStore, transformMenus } from '@/stores/permission'
import { ROOT_ROUTE_NAME } from './routes'

const Layout = () => import('@/layouts/index.vue')

/**
 * 登录后把后端菜单转成 vue-router 路由，挂在静态 Root 路由下。
 * 这样叶子菜单的 URL 是 `/<id>`（不带父前缀），与侧边栏 `:index="`/${id}`"` 直接对得上。
 *
 * 关键：catch-all 路由必须**最后**注册，否则它会抢先匹配所有动态路由，导致刷新 404。
 */
export async function loadDynamicRoutes(router: Router, menus: MenuNode[]) {
  const permStore = usePermissionStore()
  const { routes, tree } = transformMenus(menus, Layout)
  permStore.setRoutes(routes, tree)

  // 1) 先把所有动态叶子挂到 Root 下
  routes.forEach((leaf) => router.addRoute(ROOT_ROUTE_NAME, leaf))

  // 2) 最后才挂 catch-all —— 避免它抢匹配
  const catchAll: RouteRecordRaw = {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/404'
  }
  router.addRoute(catchAll)
}
