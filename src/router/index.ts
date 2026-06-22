import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { staticRoutes } from './routes'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useTagsViewStore } from '@/stores/tagsView'
import { getUserMenus } from '@/api/system/user'
import { loadDynamicRoutes } from './dynamic'
import { collectButtonPermissions } from '@/utils/menu'

NProgress.configure({ showSpinner: false })

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes as RouteRecordRaw[]
})

const WHITE_LIST = ['/login', '/403', '/404']

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  const hasToken = !!userStore.token

  if (!hasToken) {
    if (WHITE_LIST.includes(to.path)) return next()
    return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (to.path === '/login') return next('/')

  const permStore = usePermissionStore()
  if (permStore.dynamicRoutes.length === 0) {
    try {
      const menus = await getUserMenus()
      await loadDynamicRoutes(router, menus)
      // 刷新页面时，pinia-persist 会从 localStorage 恢复 userInfo，但其中的
      // permissions 是上次登录时的旧快照。趁着这次已经拉到了最新菜单树，
      // 顺手刷新一下按钮权限，避免后台改了角色/菜单后必须重新登录才生效。
      if (userStore.userInfo) {
        const freshPerms = collectButtonPermissions(menus ?? [])
        userStore.setUserInfo({ ...userStore.userInfo, permissions: freshPerms })
      }
      // 用 path 导航，避免 spread to 时 name: undefined 干扰路由解析导致刷新 404
      return next({ path: to.fullPath, replace: true })
    } catch (e) {
      userStore.reset()
      return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
  next()
})

router.afterEach((to) => {
  NProgress.done()
  // 添加标签页（排除白名单路由）
  if (!WHITE_LIST.includes(to.path)) {
    const tagsStore = useTagsViewStore()
    tagsStore.addView(to)
  }
})

export default router
