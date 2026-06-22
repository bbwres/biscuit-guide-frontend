import { useHttp } from '@/utils/request'
import type { Menu } from '@/types/auth'
import type { MenuNode } from '@/utils/menu'
import type { CommonStatus } from '@/types/api'

/**
 * 后端 MenuController 实际端点（cn.bbwres.biscuit.module.auth.controller.MenuController）：
 *   POST /menu/page             分页
 *   GET  /menu/getById          详情
 *   GET  /menu/getMenuTreeById  按 id 取树（不传 id 返完整树）
 *   POST /menu/addMenu          新增
 *   POST /menu/editMenu         修改
 *   POST /menu/editMenuStatus   修改状态
 *   POST /menu/deleteMenu       删除
 *   POST /menu/refreshCache     刷新缓存
 */

/** 菜单管理：取完整菜单树（用于 admin 后台管理页） */
export function getMenuTree(): Promise<MenuNode[]> {
  return useHttp().get('/auth/menu/getMenuTreeById')
}

/** 菜单管理：分页（按 name 模糊搜索） */
export interface MenuPageQuery {
  current: number
  size: number
  query: Partial<Menu>
}

export function pageMenu(q: MenuPageQuery): Promise<{
  records: Menu[]
  total: number
  current: number
  size: number
}> {
  return useHttp().post('/auth/menu/page', q)
}

/** 菜单管理：按 id 取详情 */
export function getMenuById(id: string): Promise<Menu> {
  return useHttp().get('/auth/menu/getById', { params: { id } })
}

/** 菜单管理：新增 */
export function addMenu(body: Partial<Menu>): Promise<void> {
  return useHttp().post('/auth/menu/addMenu', body)
}

/** 菜单管理：编辑 */
export function editMenu(body: Partial<Menu>): Promise<void> {
  return useHttp().post('/auth/menu/editMenu', body)
}

/** 菜单管理：启停 */
export function editMenuStatus(body: { id: string; status: CommonStatus }): Promise<void> {
  return useHttp().post('/auth/menu/editMenuStatus', body)
}

/** 菜单管理：删除 */
export function deleteMenu(id: string): Promise<void> {
  return useHttp().post('/auth/menu/deleteMenu', null, { params: { id } })
}

/** 菜单管理：刷新缓存 */
export function refreshMenuCache(): Promise<void> {
  return useHttp().post('/auth/menu/refreshCache')
}
