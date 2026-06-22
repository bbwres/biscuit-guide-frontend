import { useHttp } from '@/utils/request'
import type { MenuNode } from '@/utils/menu'

/** 获取当前登录用户的菜单树（按 token 解析）。网关路由 `Path=/auth/**` + `StripPrefix=1`，所以前端必须带 `/auth` 前缀 */
export function getUserMenus(): Promise<MenuNode[]> {
  return useHttp().get('/auth/userMenu/menuTree')
}

export interface RoleInfo {
  id: string
  roleCode: string
  roleName: string
  status: string
  tenantId?: string
  clientId?: string
  createTime?: string
  creator?: string
}

/** 获取当前登录用户的角色信息。注：后端返 `Role[]`，不是 `string[]` */
export function getUserRoles(): Promise<RoleInfo[]> {
  return useHttp().get('/auth/userMenu/roleInfo')
}
