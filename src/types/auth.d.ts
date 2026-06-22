import type { CommonStatus, PageReq, PageResp } from './api'

/** 登录账号状态:正常 / 停用 / 锁定 / 未激活 */
export type LoginAccountStatus = 'NORMAL' | 'DISABLED' | 'LOCKED' | 'UNACTIVATED'

export interface LoginAccount {
  id?: string
  loginName: string
  name: string
  phone?: string
  status: LoginAccountStatus
  userId?: string
  tenantId?: string
  lockedTime?: string
  lastUpdatePasswordTime?: string
  createTime?: string
  creator?: string
  updater?: string
  updateTime?: string
}

export type LoginAccountPageReq = PageReq<LoginAccount>

export type LoginAccountPageResp = PageResp<LoginAccount>

export interface LoginAccountAddOrUpdate {
  id?: string
  loginName: string
  name: string
  loginPassword?: string
  phone?: string
  userId?: string
  status: LoginAccountStatus
}

export interface Role {
  id?: string
  roleCode: string
  roleName: string
  clientId: string
  status: CommonStatus
  remark?: string
  tenantId?: string
  createTime?: string
  creator?: string
  updater?: string
  updateTime?: string
}

export type RolePageResp = PageResp<Role>

export interface MenuApi {
  id?: string
  menuId?: string
  apiUrl: string
  apiUrlMethod?: string
}

export interface Menu {
  id?: string
  parentId?: string
  name: string
  menuType: 'MENU' | 'BUTTON' | 'DIR'
  menuSort: number
  icon?: string
  component?: string
  componentName?: string
  status: CommonStatus
  visible?: boolean
  keepAlive?: boolean
  alwaysShow?: boolean
  /** 菜单关联的接口列表（一对多） */
  menuApiList?: MenuApi[]
  treePath?: string
  tenantId?: string
  createTime?: string
  creator?: string
  updater?: string
  updateTime?: string
  children?: Menu[]
}

export interface OauthClient {
  id?: string
  clientSecret?: string
  clientAuthenticationMethods?: string
  scopes?: string
  authorizedGrantTypes?: string
  webServerRedirectUri?: string
  postLogoutRedirectUri?: string
  accessTokenValidity?: number
  refreshTokenValidity?: number
  accessTokenFormat?: string
  reuseRefreshToken?: boolean
  singleUserLogin?: boolean
  createTime?: string
  updateTime?: string
  creatorName?: string
  updaterName?: string
}

export interface UserInfo {
  id: string
  loginName: string
  userName: string
  email?: string
  phone?: string
  roles: string[]
  permissions: string[]
  tenantId?: string
}

export interface LoginResp {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in: number
  scope?: string
  // 后端 OAuth2 自定义 claim（从 token body 直接返回）
  custom_user_id?: string
  custom_tenant_id?: string
  custom_zh_name?: string
  custom_roles?: string[]
  custom_grant_type?: string
}
