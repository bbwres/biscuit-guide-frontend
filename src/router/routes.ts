import type { RouteRecordRaw } from 'vue-router'

const Layout = () => import('@/layouts/index.vue')

/** 静态根路由的 name；动态叶子菜单通过 `router.addRoute('Root', leaf)` 挂到这里 */
export const ROOT_ROUTE_NAME = 'Root'

export const staticRoutes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: () => import('@/views/login/index.vue'), meta: { title: '登录' } },
  { path: '/403', name: '403', component: () => import('@/views/error/403.vue'), meta: { title: '无权限' } },
  { path: '/404', name: '404', component: () => import('@/views/error/404.vue'), meta: { title: '未找到' } },
  {
    path: '/',
    name: ROOT_ROUTE_NAME,
    component: Layout,
    redirect: '/dashboard',
    children: [
      // affix=true 让 dashboard 在 tags view 永远保留
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/index.vue'), meta: { title: '首页', icon: 'House', affix: true } }
    ]
  }
  // 注意：catch-all `/:pathMatch(.*)*` 不在这里加。
  // 它会在 `loadDynamicRoutes` 之后**最后**注册，
  // 这样动态路由（addRoute 追加）才能抢先于 catch-all 匹配。
]
