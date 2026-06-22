import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { setupRequest } from '../request'

// mock element-plus ElMessage to avoid pulling in vue runtime
vi.mock('element-plus', () => ({
  ElMessage: { error: vi.fn() }
}))

vi.mock('axios')
vi.mock('../auth', () => ({
  getToken: vi.fn(() => 'mock-token'),
  // 无 refresh_token：doRefresh 直接 resolve(false)，走"刷新失败 → 清登录 → 跳 /login"分支
  getRefreshToken: vi.fn(() => ''),
  setToken: vi.fn(),
  setRefreshToken: vi.fn(),
  clearAuth: vi.fn()
}))
vi.mock('@/api/system/login', () => ({
  refreshTokenRequest: vi.fn()
}))

describe('request wrapper', () => {
  let mockInstance: any
  let onResponseFulfilled: any

  beforeEach(() => {
    onResponseFulfilled = undefined
    mockInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: {
          use: vi.fn((fulfilled: any) => {
            onResponseFulfilled = fulfilled
          })
        }
      },
      post: vi.fn(),
      get: vi.fn(),
      postForm: undefined,
      upload: undefined,
      download: undefined
    }
    ;(axios.create as any).mockReturnValue(mockInstance)
  })

  it('creates an axios instance with env baseURL', () => {
    setupRequest('/api')
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: '/api', timeout: 15000 })
    )
  })

  it('attaches postForm/upload/download helpers', () => {
    const instance = setupRequest('/api')
    expect(typeof instance.postForm).toBe('function')
    expect(typeof instance.upload).toBe('function')
    expect(typeof instance.download).toBe('function')
  })

  it('installs request and response interceptors', () => {
    setupRequest('/api')
    expect(mockInstance.interceptors.request.use).toHaveBeenCalled()
    expect(mockInstance.interceptors.response.use).toHaveBeenCalled()
  })

  describe('response interceptor — unwrapping', () => {
    beforeEach(() => {
      setupRequest('/api') // registers onResponseFulfilled
    })

    it('unwraps Result<T> on success (resultCode="0")', async () => {
      const out = await onResponseFulfilled({
        config: {},
        data: { resultCode: '0', resultMsg: 'success', data: { id: 1 } }
      })
      expect(out).toEqual({ id: 1 })
    })

    it('unwraps `{ code, msg, data }` shape on success (code=200)', async () => {
      const out = await onResponseFulfilled({
        config: {},
        data: { code: 200, msg: 'OK', data: { captchaId: 'abc' } }
      })
      expect(out).toEqual({ captchaId: 'abc' })
    })

    it('rejects on `{ code, msg, data }` error (code≠200)', async () => {
      await expect(
        onResponseFulfilled({
          config: {},
          data: { code: 500, msg: 'fail', data: null }
        })
      ).rejects.toThrow('fail')
    })

    it('passes through OAuth2 standard response (access_token etc.)', async () => {
      const out = await onResponseFulfilled({
        config: {},
        data: { access_token: 'abc', token_type: 'bearer', expires_in: 3600 }
      })
      expect(out).toEqual({ access_token: 'abc', token_type: 'bearer', expires_in: 3600 })
    })

    it('on 401-style resultCode: clears auth and redirects to /login when no refresh_token', async () => {
      // 关键回归：成功拦截器拿到 token 失效的业务码（既无 refresh_token 也无 config 上下文）
      // 必须直接清登录态 + 跳 /login，不能只 reject 出去等业务层处理（业务层不会处理）。
      const origLocation = window.location
      delete (window as any).location
      try {
        const cases = [
          { code: '401xxx', msg: '未登录' },
          { code: '101000101', msg: '无效的token' }, // GlobalErrorCodeConstants.INVALID_TOKEN
          { code: '101001007', msg: '无效的token' }, // Oauth2ErrorCodeConstants.OAUTH2_INVALID_TOKEN
          { code: '100000401', msg: '未授权' }       // GlobalErrorCodeConstants.UNAUTHORIZED
        ]
        for (const c of cases) {
          ;(window as any).location = { href: '' }
          await expect(
            onResponseFulfilled({
              // 传一个空 config（满足 resp.config.responseType 的解引用），
              // 但不带 _skipRefresh —— handleAuthFailure 拿到这个 config 后，
              // 因 isRefreshing=false 且没有 refresh_token，doRefresh 立即返回 false，
              // 走刷新失败分支：clearAuth + 跳 /login，最终透传原始 err 给业务层。
              config: {},
              data: { resultCode: c.code, resultMsg: c.msg }
            })
          ).rejects.toMatchObject({ is401: true, resultCode: c.code })
          expect((window as any).location.href).toBe('/login')
        }
      } finally {
        ;(window as any).location = origLocation
      }
    })

    it('rejects on non-success resultCode with error message', async () => {
      await expect(
        onResponseFulfilled({
          config: {},
          data: { resultCode: '999', resultMsg: '服务器开小差' }
        })
      ).rejects.toThrow('服务器开小差')
    })

    it('passes through blob responseType unchanged', async () => {
      const blobResp = { config: { responseType: 'blob' }, data: new Blob(['x']) }
      const out = await onResponseFulfilled(blobResp)
      expect((out as any).config.responseType).toBe('blob')
      expect((out as any).data).toBeInstanceOf(Blob)
    })
  })
})
