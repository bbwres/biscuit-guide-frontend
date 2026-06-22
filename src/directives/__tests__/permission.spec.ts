import { describe, it, expect } from 'vitest'
import { checkPermission } from '../permission'

describe('checkPermission', () => {
  const codes = ['role:add', 'role:edit', 'user:list']

  it('OR — any match passes', () => {
    expect(checkPermission(['role:add', 'menu:del'], codes, 'or')).toBe(true)
    expect(checkPermission(['none'], codes, 'or')).toBe(false)
  })

  it('AND — all must match', () => {
    expect(checkPermission(['role:add', 'role:edit'], codes, 'and')).toBe(true)
    expect(checkPermission(['role:add', 'none'], codes, 'and')).toBe(false)
  })

  it('default (no mode) is OR', () => {
    expect(checkPermission(['role:add'], codes)).toBe(true)
  })
})
