import { defineStore } from 'pinia'
import { getToken, setToken as setCookieToken, clearAuth } from '@/utils/auth'
import type { UserInfo } from '@/types/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: null as UserInfo | null
  }),
  getters: {
    roles: (s) => s.userInfo?.roles ?? [],
    permissions: (s) => s.userInfo?.permissions ?? []
  },
  actions: {
    setToken(token: string) {
      this.token = token
      setCookieToken(token)
    },
    setUserInfo(info: UserInfo) {
      this.userInfo = info
    },
    reset() {
      this.token = ''
      this.userInfo = null
      clearAuth()
    }
  },
  persist: {
    pick: ['userInfo']
  }
})
