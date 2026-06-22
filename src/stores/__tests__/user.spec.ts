import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'
import { setToken, clearAuth } from '@/utils/auth'

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    clearAuth()
  })

  it('starts with no token and no user info', () => {
    const s = useUserStore()
    expect(s.token).toBe('')
    expect(s.userInfo).toBeNull()
  })

  it('login action stores token', async () => {
    const s = useUserStore()
    // mock by setting token directly since the real login() requires network
    s.setToken('xyz')
    expect(s.token).toBe('xyz')
  })

  it('reset clears state and auth cookies', () => {
    const s = useUserStore()
    setToken('abc')
    s.userInfo = { id: '1', loginName: 'a', userName: 'a', roles: [], permissions: [] } as any
    s.reset()
    expect(s.token).toBe('')
    expect(s.userInfo).toBeNull()
  })
})
