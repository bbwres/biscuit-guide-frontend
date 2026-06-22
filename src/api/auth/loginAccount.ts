import { useHttp } from '@/utils/request'
import type {
  LoginAccount,
  LoginAccountAddOrUpdate,
  LoginAccountPageResp,
  LoginAccountStatus,
  Role
} from '@/types/auth'

export interface LoginAccountPageQuery {
  current: number
  size: number
  query: Partial<LoginAccount>
}

/** 分页查询登录账户 */
export function pageLoginAccount(q: LoginAccountPageQuery): Promise<LoginAccountPageResp> {
  return useHttp().post('/auth/loginAccount/page', q)
}

/** 根据id获取登录账户详情 */
export function getLoginAccountById(id: string): Promise<LoginAccount> {
  return useHttp().get('/auth/loginAccount/getById', { params: { id } })
}

/** 获取指定账户拥有的角色列表 */
export function getAccountRoles(id: string): Promise<Role[]> {
  return useHttp().get('/auth/loginAccount/getRoles', { params: { id } })
}

/** 新增登录账户 */
export function addLoginAccount(body: LoginAccountAddOrUpdate): Promise<void> {
  return useHttp().post('/auth/loginAccount/addAccount', body)
}

/** 编辑账户信息（姓名、手机号） */
export function editLoginAccount(body: { id: string; name: string; phone?: string }): Promise<void> {
  return useHttp().post('/auth/loginAccount/editAccount', body)
}

/** 启用/停用账户（仅修改状态） */
export function editAccountStatus(body: { id: string; status: LoginAccountStatus }): Promise<void> {
  return useHttp().post('/auth/loginAccount/editAccountStatus', body)
}

/** 修改账户密码（需旧密码） */
export function editAccountPassword(body: { id: string; oldPassword: string; newPassword: string }): Promise<void> {
  return useHttp().post('/auth/loginAccount/editAccountPassword', body)
}

/** 重置账户密码（管理员重置） */
export function resetAccountPassword(body: { id: string; newPassword: string }): Promise<void> {
  return useHttp().post('/auth/loginAccount/resetAccountPassword', body)
}

/** 账户分配角色 */
export function accountRoleConfig(body: { id: string; roleIds: string[] }): Promise<void> {
  return useHttp().post('/auth/loginAccount/accountRoleConfig', body)
}
