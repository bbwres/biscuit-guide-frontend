import { describe, it, expect, beforeEach } from 'vitest'
import { getToken, setToken, removeToken, getRefreshToken, setRefreshToken, clearAuth } from '../auth'

describe('auth utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty string when no token', () => {
    expect(getToken()).toBe('')
  })

  it('stores and retrieves token', () => {
    setToken('abc')
    expect(getToken()).toBe('abc')
  })

  it('removes token', () => {
    setToken('abc')
    removeToken()
    expect(getToken()).toBe('')
  })

  it('stores and retrieves refresh token', () => {
    setRefreshToken('rt-xyz')
    expect(getRefreshToken()).toBe('rt-xyz')
  })

  it('clearAuth removes token and refresh', () => {
    setToken('abc')
    setRefreshToken('xyz')
    clearAuth()
    expect(getToken()).toBe('')
    expect(getRefreshToken()).toBe('')
  })
})
