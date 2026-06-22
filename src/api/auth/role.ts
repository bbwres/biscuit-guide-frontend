import { useHttp } from '@/utils/request'
import type { Role, RolePageResp } from '@/types/auth'

export interface RolePageQuery {
  current: number
  size: number
  query: Partial<Role>
}

/** 分页查询角色 */
export function pageRole(q: RolePageQuery): Promise<RolePageResp> {
  return useHttp().post('/auth/role/page', q)
}

/** 根据id获取角色详情，withMenus=true 时同时返回关联菜单树 */
export function getRoleById(id: string, withMenus = false): Promise<Role> {
  return useHttp().get('/auth/role/getById', { params: { id, withMenus } })
}

/** 新增角色 */
export function addRole(body: Partial<Role>): Promise<void> {
  return useHttp().post('/auth/role/addRole', body)
}

/** 修改角色 */
export function editRole(body: Partial<Role>): Promise<void> {
  return useHttp().post('/auth/role/editRole', body)
}

/** 修改角色状态 */
export function editRoleStatus(body: Partial<Role>): Promise<void> {
  return useHttp().post('/auth/role/editRoleStatus', body)
}

/** 角色菜单配置 */
export function roleMenuConfig(body: { id: string; menuIds: string[] }): Promise<void> {
  return useHttp().post('/auth/role/roleMenuConfig', body)
}
