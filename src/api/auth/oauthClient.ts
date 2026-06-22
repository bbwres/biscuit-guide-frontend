import { useHttp } from '@/utils/request'
import type { OauthClient } from '@/types/auth'
import type { PageResp } from '@/types/api'

export interface OauthClientPageQuery {
  current: number
  size: number
  query: Partial<OauthClient>
}

/** 分页查询客户端 */
export function pageOauthClient(q: OauthClientPageQuery): Promise<PageResp<OauthClient>> {
  return useHttp().post('/auth/oauthClientDetails/page', q)
}

/** 根据id获取客户端详情 */
export function getOauthClientById(id: string): Promise<OauthClient> {
  return useHttp().get('/auth/oauthClientDetails/getById', { params: { id } })
}

/** 新增客户端 */
export function addOauthClient(body: Partial<OauthClient>): Promise<void> {
  return useHttp().post('/auth/oauthClientDetails/add', body)
}

/** 修改客户端 */
export function editOauthClient(body: Partial<OauthClient>): Promise<void> {
  return useHttp().post('/auth/oauthClientDetails/edit', body)
}
