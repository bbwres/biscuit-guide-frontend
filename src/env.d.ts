/// <reference types="vite/client" />

// tianai-captcha 官方 load.min.js 挂载到 window 上的方法
interface Window {
  loadTAC: (
    urlPrefix: string,
    config: Record<string, any>,
    style?: Record<string, any>
  ) => Promise<any>
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_LOGIN_PUBLIC_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  const component: DefineComponent<{}, {}, any>
  export default component
}
