import { createI18n } from 'vue-i18n'
import zhCN from './lang/zh-CN'
import enUS from './lang/en-US'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: localStorage.getItem('biscuit-app-locale') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: { 'zh-CN': zhCN, 'en-US': enUS }
})

export const elementLocaleMap = {
  'zh-CN': zhCn,
  'en-US': en
}
