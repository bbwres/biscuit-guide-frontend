import axios from 'axios'
import { useHttp } from '@/utils/request'
import type { LoginResp } from '@/types/auth'

export interface LoginParams {
  username: string
  password: string
  clientId?: string
  clientSecret?: string
  /** 多租户 ID（必填，按运维提供） */
  tenantId?: string
  /** OAuth2 scope，约定 `openid,dd` */
  scope?: string
  /** 验证码 id（后端参数名 captcha_verification，值如 "SLIDER_xxxx"） */
  captchaVerification?: string
}

export function login(params: LoginParams): Promise<LoginResp> {
  return useHttp().postForm<LoginResp>('/auth/oauth2/token', {
    grant_type: 'password',
    username: params.username,
    password: params.password,
    client_id: params.clientId || '1-mp',
    client_secret: params.clientSecret || 'zlf',
    tenant_id: params.tenantId || 'zgip',
    scope: params.scope || 'openid,dd',
    captcha_verification: params.captchaVerification || undefined
  }) as unknown as Promise<LoginResp>
}

/**
 * 使用 refresh_token 刷新 access_token
 * 注意：直接用裸 axios 调用（不经过 useHttp 拦截器），避免 401 死循环
 */
export function refreshTokenRequest(refreshToken: string): Promise<LoginResp> {
  const baseURL = import.meta.env.VITE_API_BASE_URL || ''
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: '1-mp',
    client_secret: 'zlf'
  }).toString()
  return axios.post<LoginResp>(`${baseURL}/auth/oauth2/token`, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }).then(res => res.data)
}

export function logout(): Promise<void> {
  // _skipRefresh: logout 请求不触发 401 自动刷新，避免 刷新→重放→再401 的死循环
  return useHttp().post('/auth/oauth2/revoke', null, { _skipRefresh: true } as any)
}

// ==================== 验证码 ====================

/** 创建滑块验证码（返回渲染数据） */
export function createCaptcha(type = 'SLIDER'): Promise<any> {
  return useHttp().get('/auth/captcha/create', { params: { type } })
}

/** 校验滑块验证码 */
export function checkCaptcha(data: { id: string; imageCaptchaTrack: any }): Promise<any> {
  return useHttp().post('/auth/captcha/checkCaptcha', data)
}
