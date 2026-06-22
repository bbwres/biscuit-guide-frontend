import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarCollapsed: false,
    locale: 'zh-CN' as 'zh-CN' | 'en-US',
    size: 'default' as 'default' | 'small' | 'large'
  }),
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    setLocale(locale: 'zh-CN' | 'en-US') {
      this.locale = locale
    },
    setSize(size: 'default' | 'small' | 'large') {
      this.size = size
    }
  },
  persist: {
    key: 'biscuit-app',
    storage: localStorage,
    pick: ['sidebarCollapsed', 'locale', 'size']
  }
})