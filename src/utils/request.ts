import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, getRefreshToken, setToken, setRefreshToken, clearAuth } from './auth'
import { refreshTokenRequest } from '@/api/system/login'

// 后端 Result 成功码：实测两种格式都存在
//   - 业务端点：`{ resultCode: "0", resultMsg: "success", data: ... }`（"0" 即成功）
//   - 部分端点（captcha 等）：`{ code: 200, msg: "OK", data: ... }`（HTTP 语义成功码）
//   - OAuth2 token：`{ access_token, token_type, expires_in, ... }`（OAuth2 标准，无包裹）
const RESULT_SUCCESS_CODES = new Set(['0'])
const CODE_SUCCESS = 200

export interface RequestOptions {
  baseURL?: string
  timeout?: number
}

export function setupRequest(
  baseURL: string,
  options: RequestOptions = {}
): AxiosInstance & {
  postForm: <T = any>(url: string, data: Record<string, string>) => Promise<T>
  upload: <T = any>(url: string, formData: FormData, onProgress?: (p: number) => void) => Promise<T>
  download: (url: string, params?: Record<string, any>) => Promise<Blob>
} {
  const instance = axios.create({
    baseURL,
    timeout: options.timeout ?? 15000,
    headers: { 'Content-Type': 'application/json' }
  }) as any

  // ==================== Token 自动刷新机制 ====================

  /**
   * 刷新锁：
   * - isRefreshing：是否正在刷新 token
   * - refreshPromise：正在刷新的 Promise（多个并发 401 共享同一个）
   * - pendingQueue：刷新期间被挂起的请求回调队列
   */
  let isRefreshing = false
  let refreshPromise: Promise<boolean> | null = null
  const pendingQueue: Array<{
    resolve: (token: string) => void
    reject: (err: any) => void
  }> = []

  /** 将挂起的请求排队，等刷新完成后用新 token 重放 */
  function enqueuePending(config: InternalAxiosRequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      pendingQueue.push({
        resolve: (newToken: string) => {
          config.headers.set('Authorization', `Bearer ${newToken}`)
          resolve(instance(config))
        },
        reject
      })
    })
  }

  /** 刷新成功后，重放所有挂起请求 */
  function replayPending(newToken: string) {
    const queue = pendingQueue.splice(0)
    queue.forEach(({ resolve }) => resolve(newToken))
  }

  /** 刷新失败后，拒绝所有挂起请求 */
  function rejectPending(err: any) {
    const queue = pendingQueue.splice(0)
    queue.forEach(({ reject }) => reject(err))
  }

  /** 执行 token 刷新，返回是否成功 */
  function doRefresh(): Promise<boolean> {
    const rt = getRefreshToken()
    if (!rt) {
      // 没有 refresh_token —— 没法刷新，但 isRefreshing 仍需复位，
      // 否则后续同类错误进入 enqueuePending 永久挂起。
      isRefreshing = false
      refreshPromise = null
      return Promise.resolve(false)
    }
    return refreshTokenRequest(rt)
      .then(resp => {
        if (resp.access_token) {
          setToken(resp.access_token)
          if (resp.refresh_token) {
            setRefreshToken(resp.refresh_token)
          }
          replayPending(resp.access_token)
          return true
        }
        // 刷新响应无 access_token，视为失败
        rejectPending(new Error('refresh response missing access_token'))
        return false
      })
      .catch(err => {
        rejectPending(err)
        return false
      })
      .finally(() => {
        isRefreshing = false
        refreshPromise = null
      })
  }

  /**
   * 统一处理 token 失效：尝试用 refresh_token 刷新后重放原请求。
   *
   * 关键：必须从 `onFulfilled` 内部 await 它，而不是 `Promise.reject(err)` 给同一个
   * use() 的 `onRejected`。原因：axios 同一对 (onFulfilled, onRejected) 中，
   * onFulfilled 拒绝的 promise 不会回到同 use 的 onRejected，而是直接冒泡到业务层 ——
   * 写在错误拦截里的刷新+跳转逻辑永远跑不到。
   *
   * @param config 原始请求 config（若为 null，表示当前错误没有 axios config 上下文，
   *               这种情况无法重放，直接清登录态跳走）
   * @param err   作为最终 reject 透传给业务层的错误对象
   */
  async function handleAuthFailure(
    config: InternalAxiosRequestConfig | undefined,
    err: any
  ): Promise<any> {
    if (!config || (config as any)._skipRefresh) {
      clearAuth()
      window.location.href = '/login'
      return Promise.reject(err)
    }

    // 已在刷新中，排队等待
    if (isRefreshing) {
      return enqueuePending(config)
    }

    // 开始刷新
    isRefreshing = true
    refreshPromise = doRefresh()

    const ok = await refreshPromise
    if (ok) {
      config.headers.set('Authorization', `Bearer ${getToken()}`)
      return instance(config)
    }

    // 刷新失败，跳登录
    clearAuth()
    window.location.href = '/login'
    return Promise.reject(err)
  }

  // ==================== 请求拦截：注入 token ====================
  instance.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) cfg.headers.set('Authorization', `Bearer ${token}`)
    return cfg
  })

  // ==================== 响应拦截：解包 + 业务码处理 + 401 自动刷新 ====================
  instance.interceptors.response.use(
    async (resp: any) => {
      const data = resp.data
      // 文件下载直接返回 blob
      if (resp.config.responseType === 'blob') return resp

      // 形态 1：业务 Result 包裹（`{ resultCode, resultMsg, data }`）
      if (data && typeof data === 'object' && 'resultCode' in data) {
        if (RESULT_SUCCESS_CODES.has(data.resultCode)) return data.data
        if (String(data.resultCode).startsWith('401') ||
            data.resultCode === '101000101' ||
            data.resultCode === '101001007' ||
            data.resultCode === '100000401') {
          // token 失效 / 未授权：直接在这里走刷新+重放，
          // 不要 reject 给同 use 的 onRejected —— axios 不会把它路由过去（详见
          // handleAuthFailure 注释）。
          //   101000101 — GlobalErrorCodeConstants.INVALID_TOKEN
          //   101001007 — Oauth2ErrorCodeConstants.OAUTH2_INVALID_TOKEN
          //   100000401 — GlobalErrorCodeConstants.UNAUTHORIZED
          const err = new Error(data.resultMsg || '未登录')
          ;(err as any).is401 = true
          ;(err as any).resultCode = data.resultCode
          return handleAuthFailure(resp.config as InternalAxiosRequestConfig | undefined, err)
        }
        ElMessage.error(data.resultMsg || '请求失败')
        const err = new Error(data.resultMsg)
        ;(err as any).resultCode = data.resultCode
        return Promise.reject(err)
      }

      // 形态 2：HTTP 风格包裹（`{ code, msg, data }`）
      if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
        if (data.code === CODE_SUCCESS) return data.data
        ElMessage.error(data.msg || '请求失败')
        const err = new Error(data.msg)
        ;(err as any).code = data.code
        return Promise.reject(err)
      }

      // 形态 3：OAuth2 标准（`{ access_token, token_type, ... }`）或任意非包裹响应 → 原样返回
      return data
    },
    async (err: any) => {
      const status = err?.response?.status

      // ===== HTTP 401：交给同一个刷新 handler =====
      if (status === 401) {
        return handleAuthFailure(err?.config as InternalAxiosRequestConfig | undefined, err)
      }

      // ===== 非 401 错误：原逻辑 =====
      // OAuth2 token 错误：`{ error, error_description }` 的 HTTP 200 也可能不通过这里，
      // 但 `error: invalid_client` 等会以 HTTP 400 返回，落入此处
      const oauthMsg =
        err?.response?.data?.error_description ||
        err?.response?.data?.error ||
        err?.message
      ElMessage.error(oauthMsg || '网络异常')
      return Promise.reject(err)
    }
  )

  // ==================== 便捷方法 ====================

  // postForm: x-www-form-urlencoded (OAuth2 password grant)
  instance.postForm = function <T = any>(url: string, data: Record<string, string>): Promise<T> {
    const body = new URLSearchParams(data).toString()
    return instance.post(url, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) as unknown as Promise<T>
  }

  // upload: multipart/form-data, browser auto boundary
  instance.upload = function <T = any>(url: string, formData: FormData): Promise<T> {
    return instance.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }) as unknown as Promise<T>
  }

  // download: blob response
  instance.download = function (url: string, params?: Record<string, any>): Promise<Blob> {
    return instance.get(url, { params, responseType: 'blob' })
  }

  return instance
}

// 单例（main.ts 启动时初始化）
let http: ReturnType<typeof setupRequest> | null = null

export function initHttp(baseURL: string) {
  http = setupRequest(baseURL)
  return http
}

export function useHttp() {
  if (!http) throw new Error('http not initialized — call initHttp() in main.ts first')
  return http
}
