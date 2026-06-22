# biscuit-guide Admin Console — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full Vue 3 + Element Plus admin console that integrates every controller in the biscuit-guide backend, end-to-end runnable via `pnpm dev`.

**Architecture:** Vite + Vue 3 + TypeScript SPA. Classic admin layout (sidebar + topbar + tags view) with dynamic routes generated from the backend `userMenu` API. Per-controller `api/` and `views/` modules aligned with backend modules (`auth`, `basic`). Pinia for state, Axios with interceptors for HTTP, vue-i18n for zh-CN / en-US.

**Tech Stack:** Vue 3.4, Vite 6, TypeScript 5, Pinia 2, Vue Router 4, Element Plus 2, Axios, vue-i18n 9, dayjs, js-cookie, nprogress, unplugin-auto-import, unplugin-vue-components, ESLint 9, Prettier 3, Vitest.

**Notes on execution style:**
- This project is **not a git repository**, so this plan uses **no `git commit` steps**. Verification uses `pnpm` commands; the plan's checkbox state is the source of truth for progress.
- All commands assume `pnpm`. If you switch to `npm` or `yarn`, substitute accordingly.
- Each business page (Tasks 16-22) shows its **complete** file content. The earlier composables (`usePage`, `useCrud`) and components (`PageTable`, `PageSearch`, `PageDialog`) are defined in Task 15 and reused; pages that do not need them (e.g., Menu tree) use plain `el-table` directly.

---

## Phase A — Scaffolding & Configuration

### Task 1: Initialize project skeleton

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `src/main.ts` (placeholder)
- Create: `src/App.vue` (placeholder)
- Create: `src/env.d.ts`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "biscuit-guide-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build:sit": "vite build --mode sit",
    "build:prod": "vite build --mode production",
    "preview": "vite preview",
    "typecheck": "vue-tsc --noEmit",
    "lint": "eslint . --ext .ts,.vue --fix",
    "format": "prettier --write \"src/**/*.{ts,vue,scss,json}\"",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@element-plus/icons-vue": "^2.3.1",
    "axios": "^1.7.7",
    "dayjs": "^1.11.13",
    "element-plus": "^2.8.4",
    "js-cookie": "^3.0.5",
    "nprogress": "^0.2.0",
    "pinia": "^2.2.4",
    "pinia-plugin-persistedstate": "^4.1.1",
    "vue": "^3.5.10",
    "vue-i18n": "^9.14.1",
    "vue-router": "^4.4.5"
  },
  "devDependencies": {
    "@types/js-cookie": "^3.0.6",
    "@types/node": "^22.7.4",
    "@types/nprogress": "^0.2.3",
    "@vitejs/plugin-vue": "^5.1.4",
    "@vue/test-utils": "^2.4.6",
    "@vue/tsconfig": "^0.5.1",
    "eslint": "^9.11.1",
    "eslint-plugin-vue": "^9.28.0",
    "prettier": "^3.3.3",
    "sass": "^1.79.4",
    "typescript": "^5.6.2",
    "unplugin-auto-import": "^0.18.3",
    "unplugin-vue-components": "^0.27.4",
    "vite": "^5.4.8",
    "vitest": "^2.1.2",
    "vue-tsc": "^2.1.6"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "useDefineForClassFields": true,
    "allowImportingTsExtensions": false,
    "noEmit": true,
    "types": ["node", "vite/client", "element-plus/global"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "auto-imports.d.ts",
    "components.d.ts"
  ],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create `index.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>biscuit-guide</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `src/env.d.ts`**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

- [ ] **Step 6: Create placeholder `src/main.ts`**

```ts
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

- [ ] **Step 7: Create placeholder `src/App.vue`**

```vue
<template>
  <div>biscuit-guide placeholder</div>
</template>
```

- [ ] **Step 8: Create `.gitignore`**

```
node_modules
dist
dist-ssr
*.local
.DS_Store
.vscode/*
!.vscode/extensions.json
.idea
*.log
coverage
auto-imports.d.ts
components.d.ts
.env.local
```

- [ ] **Step 9: Install dependencies**

Run: `pnpm install`
Expected: dependencies installed, no fatal errors. Peer-dep warnings OK.

- [ ] **Step 10: Verify TypeScript compiles**

Run: `pnpm typecheck`
Expected: `vue-tsc --noEmit` exits 0 (placeholder content is valid).

---

### Task 2: Vite config (proxy, env, auto-import, Element Plus, alias, SCSS)

**Files:**
- Create: `vite.config.ts`

- [ ] **Step 1: Write `vite.config.ts`**

```ts
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_BASE_URL?.startsWith('http')
    ? env.VITE_API_BASE_URL
    : 'http://localhost:28000'

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [ElementPlusResolver()],
        dts: 'auto-imports.d.ts',
        eslintrc: { enabled: false }
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'components.d.ts'
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;`
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      open: false,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, '')
        }
      }
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            element: ['element-plus', '@element-plus/icons-vue']
          }
        }
      }
    }
  }
})
```

- [ ] **Step 2: Verify dev server starts**

Run: `pnpm dev` (in background, then `Ctrl+C` after seeing output)
Expected: `Local: http://localhost:5173/` and no errors.

- [ ] **Step 3: Re-verify typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

---

### Task 3: Environment files (4)

**Files:**
- Create: `.env`
- Create: `.env.development`
- Create: `.env.sit`
- Create: `.env.production`

- [ ] **Step 1: Create `.env`**

```
VITE_APP_TITLE=biscuit-guide
```

- [ ] **Step 2: Create `.env.development`**

```
VITE_API_BASE_URL=/api
```

- [ ] **Step 3: Create `.env.sit`**

```
VITE_API_BASE_URL=https://sit-gateway.example.com
```

- [ ] **Step 4: Create `.env.production`**

```
VITE_API_BASE_URL=https://api.example.com
```

- [ ] **Step 5: Verify env loading**

Run: `pnpm dev` (briefly)
Expected: no error, dev server uses `/api` base URL.

---

### Task 4: ESLint + Prettier configs

**Files:**
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `.prettierignore`

- [ ] **Step 1: Create `eslint.config.js` (flat config)**

```js
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        ElMessage: 'readonly',
        ElMessageBox: 'readonly',
        ElNotification: 'readonly'
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
      'no-debugger': 'warn'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'auto-imports.d.ts', 'components.d.ts', 'coverage/**']
  }
]
```

> Note: you may need to add `typescript-eslint` to devDependencies. The flat-config preset is shipped as `typescript-eslint`. If `pnpm install` after adding this file complains, run: `pnpm add -D typescript-eslint @eslint/js`.

- [ ] **Step 2: Create `.prettierrc.json`**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "arrowParens": "always",
  "vueIndentScriptAndStyle": false,
  "endOfLine": "lf"
}
```

- [ ] **Step 3: Create `.prettierignore`**

```
node_modules
dist
coverage
auto-imports.d.ts
components.d.ts
pnpm-lock.yaml
```

- [ ] **Step 4: Verify lint runs**

Run: `pnpm lint`
Expected: exits 0 (placeholder files are clean).

---

## Phase B — Core Infrastructure

### Task 5: Common TypeScript types

**Files:**
- Create: `src/types/api.d.ts`
- Create: `src/types/auth.d.ts`
- Create: `src/types/basic.d.ts`

- [ ] **Step 1: Create `src/types/api.d.ts`**

```ts
// 后端标准响应
export interface Result<T> {
  resultCode: string
  resultMsg: string
  data: T
}

// 分页响应（按后端 Page 实际结构为准；如有出入改这一处）
export interface PageResp<E, R = unknown> {
  records: E[]
  total: number
  size: number
  current: number
  search?: R
}

// 分页请求体（POST /page 形式）
export interface PageReq<E, R> {
  entity: E
  search: R
  current: number
  size: number
  orders?: OrderItem[]
}

export interface OrderItem {
  column: string
  asc: boolean
}

// 通用状态
export type CommonStatus = 'NORMAL' | 'DISABLED'

// 分页常量
export const PAGE_SIZES = [10, 20, 50, 100]
export const DEFAULT_PAGE_SIZE = 20
```

- [ ] **Step 2: Create `src/types/auth.d.ts`**

```ts
import type { CommonStatus, PageReq, PageResp } from './api'

export interface LoginAccount {
  id?: string
  loginName: string
  loginPwd?: string
  userName: string
  email?: string
  phone?: string
  status: CommonStatus
  tenantId?: string
  remark?: string
  createTime?: string
  updateTime?: string
}

export type LoginAccountPageReq = PageReq<LoginAccount, LoginAccount>

export type LoginAccountPageResp = PageResp<LoginAccount>

export interface LoginAccountAddOrUpdate {
  id?: string
  loginName: string
  userName: string
  email?: string
  phone?: string
  password?: string
  status: CommonStatus
  remark?: string
}

export interface Role {
  id?: string
  roleCode: string
  roleName: string
  clientId: string
  status: CommonStatus
  remark?: string
}

export type RolePageResp = PageResp<Role>

export interface Menu {
  id?: string
  parentId: string
  menuName: string
  menuCode: string
  menuType: 'MENU' | 'BUTTON' | 'DIR'
  path?: string
  component?: string
  icon?: string
  sort: number
  status: CommonStatus
  permission?: string
  children?: Menu[]
}

export interface OauthClient {
  id?: string
  clientId: string
  clientSecret?: string
  clientName: string
  status: CommonStatus
  accessTokenValidity?: number
  refreshTokenValidity?: number
  authorizedGrantTypes?: string
  webServerRedirectUri?: string
  remark?: string
}

export interface UserInfo {
  id: string
  loginName: string
  userName: string
  email?: string
  phone?: string
  roles: string[]
  permissions: string[]
  tenantId?: string
}

export interface LoginResp {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in: number
  scope?: string
}
```

- [ ] **Step 3: Create `src/types/basic.d.ts`**

```ts
import type { CommonStatus, PageResp } from './api'

export interface FileInfo {
  id?: string
  fileName: string
  originalName: string
  filePath: string
  fileSize: number
  contentType?: string
  bucket?: string
  status: CommonStatus
  businessId?: string
  businessType?: string
  createTime?: string
}

export type FileInfoPageResp = PageResp<FileInfo>

export interface FileBusiness {
  id?: string
  businessCode: string
  businessName: string
  description?: string
  status: CommonStatus
}

export interface TempFile {
  id?: string
  fileName: string
  originalName: string
  fileSize: number
  expireTime?: string
  createTime?: string
}
```

- [ ] **Step 4: Verify types compile**

Run: `pnpm typecheck`
Expected: 0 errors.

---

### Task 6: Request wrapper (axios + interceptors) — TDD

**Files:**
- Create: `src/utils/request.ts`
- Create: `src/utils/__tests__/request.spec.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install axios (already in deps from Task 1) and vitest config deps**

Run: `pnpm install` (if not yet done)
Expected: success.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/__tests__/**/*.spec.ts']
  }
})
```

- [ ] **Step 3: Add test deps to `package.json` devDependencies**

```json
"jsdom": "^25.0.1"
```

Run: `pnpm install`

- [ ] **Step 4: Write failing test `src/utils/__tests__/request.spec.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { setupRequest } from '../request'

vi.mock('axios')

describe('request wrapper', () => {
  let mockInstance: any

  beforeEach(() => {
    mockInstance = {
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
      post: vi.fn(),
      postForm: undefined, // will be attached by setupRequest
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
})
```

- [ ] **Step 5: Run test to confirm it fails**

Run: `pnpm test src/utils/__tests__/request.spec.ts`
Expected: FAIL — `setupRequest` not exported.

- [ ] **Step 6: Implement `src/utils/request.ts`**

```ts
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, clearAuth } from './auth'

const SUCCESS_CODE = '000000' // 与后端 Result 实际成功码一致

export interface RequestOptions {
  baseURL?: string
  timeout?: number
}

export function setupRequest(baseURL: string, options: RequestOptions = {}): AxiosInstance & {
  postForm: <T = any>(url: string, data: Record<string, string>) => Promise<T>
  upload: <T = any>(url: string, formData: FormData, onProgress?: (p: number) => void) => Promise<T>
  download: (url: string, params?: Record<string, any>) => Promise<Blob>
} {
  const instance = axios.create({
    baseURL,
    timeout: options.timeout ?? 15000,
    headers: { 'Content-Type': 'application/json' }
  }) as any

  // 请求拦截：注入 token
  instance.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) cfg.headers.set('Authorization', `Bearer ${token}`)
    return cfg
  })

  // 响应拦截：解包 + 业务码处理
  instance.interceptors.response.use(
    (resp: any) => {
      const data = resp.data
      // 文件下载直接返回 blob
      if (resp.config.responseType === 'blob') return resp

      if (data && typeof data === 'object' && 'resultCode' in data) {
        if (data.resultCode === SUCCESS_CODE) return data.data
        if (String(data.resultCode).startsWith('401')) {
          clearAuth()
          window.location.href = '/login'
          return Promise.reject(new Error(data.resultMsg || '未登录'))
        }
        ElMessage.error(data.resultMsg || '请求失败')
        return Promise.reject(new Error(data.resultMsg))
      }
      return data
    },
    (err: any) => {
      ElMessage.error(err?.message || '网络异常')
      return Promise.reject(err)
    }
  )

  // postForm: x-www-form-urlencoded (OAuth2 password grant)
  instance.postForm = function <T = any>(url: string, data: Record<string, string>): Promise<T> {
    const body = new URLSearchParams(data).toString()
    return instance.post(url, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  }

  // upload: multipart/form-data, browser auto boundary
  instance.upload = function <T = any>(url: string, formData: FormData): Promise<T> {
    return instance.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
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
```

- [ ] **Step 7: Run tests to confirm they pass**

Run: `pnpm test src/utils/__tests__/request.spec.ts`
Expected: 3 tests PASS.

- [ ] **Step 8: Re-verify typecheck**

Run: `pnpm typecheck`
Expected: 0 errors (the import of `setupRequest` from test is now satisfied).

---

### Task 7: Auth utils (token) + cookie helpers

**Files:**
- Create: `src/utils/auth.ts`
- Create: `src/utils/__tests__/auth.spec.ts`

- [ ] **Step 1: Write failing test `src/utils/__tests__/auth.spec.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import Cookies from 'js-cookie'
import { getToken, setToken, removeToken, clearAuth } from '../auth'

describe('auth utils', () => {
  beforeEach(() => {
    Cookies.remove('biscuit-token')
    Cookies.remove('biscuit-refresh')
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

  it('clearAuth removes token and refresh', () => {
    setToken('abc')
    Cookies.set('biscuit-refresh', 'xyz')
    clearAuth()
    expect(getToken()).toBe('')
    expect(Cookies.get('biscuit-refresh')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to confirm fail**

Run: `pnpm test src/utils/__tests__/auth.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/utils/auth.ts`**

```ts
import Cookies from 'js-cookie'

const TOKEN_KEY = 'biscuit-token'
const REFRESH_KEY = 'biscuit-refresh'

export function getToken(): string {
  return Cookies.get(TOKEN_KEY) || ''
}

export function setToken(token: string, expires = 7) {
  Cookies.set(TOKEN_KEY, token, { expires, path: '/' })
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY, { path: '/' })
}

export function getRefreshToken(): string {
  return Cookies.get(REFRESH_KEY) || ''
}

export function setRefreshToken(token: string, expires = 30) {
  Cookies.set(REFRESH_KEY, token, { expires, path: '/' })
}

export function clearAuth() {
  removeToken()
  Cookies.remove(REFRESH_KEY, { path: '/' })
}
```

- [ ] **Step 4: Run tests to confirm pass**

Run: `pnpm test src/utils/__tests__/auth.spec.ts`
Expected: 4 tests PASS.

---

### Task 8: Menu transform util + permission directive (TDD)

**Files:**
- Create: `src/utils/menu.ts`
- Create: `src/utils/__tests__/menu.spec.ts`
- Create: `src/directives/permission.ts`
- Create: `src/directives/__tests__/permission.spec.ts`
- Modify: `src/main.ts` (register directive)

- [ ] **Step 1: Write failing test `src/utils/__tests__/menu.spec.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { buildSidebarTree, toRouteRecordRaw, type MenuNode } from '../menu'

const sample: MenuNode[] = [
  { id: '1', parentId: '0', menuCode: 'dashboard', menuName: '工作台', menuType: 'MENU', path: '/dashboard', icon: 'House', sort: 1, status: 'NORMAL' },
  { id: '2', parentId: '0', menuCode: 'auth', menuName: '权限管理', menuType: 'DIR', path: '/auth', icon: 'UserFilled', sort: 2, status: 'NORMAL' },
  { id: '3', parentId: '2', menuCode: 'loginAccount', menuName: '登录账户', menuType: 'MENU', path: 'loginAccount', component: 'views/auth/loginAccount/index.vue', sort: 1, status: 'NORMAL' }
]

describe('menu transform', () => {
  it('builds a sidebar tree with one root + one parent + one child', () => {
    const tree = buildSidebarTree(sample)
    expect(tree.length).toBe(2)
    expect(tree[1].children?.length).toBe(1)
    expect(tree[1].children![0].menuCode).toBe('loginAccount')
  })

  it('converts to Vue Router records with full paths', () => {
    const tree = buildSidebarTree(sample)
    const routes = toRouteRecordRaw(tree, 'Layout')
    const authRoute = routes[0]
    expect(authRoute.path).toBe('/auth')
    expect(authRoute.children![0].path).toBe('loginAccount')
    expect(authRoute.children![0].component).toBe('views/auth/loginAccount/index.vue')
  })
})
```

- [ ] **Step 2: Run test to confirm fail**

Run: `pnpm test src/utils/__tests__/menu.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/utils/menu.ts`**

```ts
export interface MenuNode {
  id: string
  parentId: string
  menuCode: string
  menuName: string
  menuType: 'MENU' | 'BUTTON' | 'DIR'
  path?: string
  component?: string
  icon?: string
  sort: number
  status: string
  permission?: string
  children?: MenuNode[]
  titleKey?: string
}

export function buildSidebarTree(menus: MenuNode[]): MenuNode[] {
  const valid = menus.filter((m) => m.menuType !== 'BUTTON' && m.status === 'NORMAL')
  const map = new Map<string, MenuNode>()
  valid.forEach((m) => map.set(m.id, { ...m, children: [] }))
  const roots: MenuNode[] = []
  map.forEach((m) => {
    if (m.parentId && map.has(m.parentId)) {
      map.get(m.parentId)!.children!.push(m)
    } else {
      roots.push(m)
    }
  })
  const sortRec = (arr: MenuNode[]) => {
    arr.sort((a, b) => a.sort - b.sort)
    arr.forEach((n) => n.children && sortRec(n.children))
  }
  sortRec(roots)
  return roots
}

interface RouteLike {
  path: string
  name?: string
  component?: any
  redirect?: string
  meta?: Record<string, any>
  children?: RouteLike[]
}

export function toRouteRecordRaw(tree: MenuNode[], layoutComponent: any): RouteLike[] {
  return tree.map((node) => {
    if (node.menuType === 'DIR' && node.children && node.children.length > 0) {
      return {
        path: node.path || node.menuCode,
        component: layoutComponent,
        redirect: node.children[0].path,
        meta: { title: node.menuName, icon: node.icon, menuCode: node.menuCode },
        children: node.children.map((c) => ({
          path: c.path || c.menuCode,
          name: c.menuCode,
          component: c.component,
          meta: { title: c.menuName, icon: c.icon, menuCode: c.menuCode }
        }))
      }
    }
    return {
      path: node.path || node.menuCode,
      name: node.menuCode,
      component: node.component || layoutComponent,
      meta: { title: node.menuName, icon: node.icon, menuCode: node.menuCode }
    }
  })
}
```

- [ ] **Step 4: Run test to confirm pass**

Run: `pnpm test src/utils/__tests__/menu.spec.ts`
Expected: 2 tests PASS.

- [ ] **Step 5: Write failing test for permission directive**

Create `src/directives/__tests__/permission.spec.ts`:

```ts
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
```

- [ ] **Step 6: Run test to confirm fail**

Run: `pnpm test src/directives/__tests__/permission.spec.ts`
Expected: FAIL.

- [ ] **Step 7: Implement `src/directives/permission.ts`**

```ts
import type { Directive, DirectiveBinding } from 'vue'

type Mode = 'or' | 'and'

/** 纯函数：判定权限码数组是否满足用户拥有的权限码集合 */
export function checkPermission(
  required: string[],
  owned: string[],
  mode: Mode = 'or'
): boolean {
  if (!required || required.length === 0) return true
  return mode === 'and'
    ? required.every((r) => owned.includes(r))
    : required.some((r) => owned.includes(r))
}

function mounted(el: HTMLElement, binding: DirectiveBinding<string[]>) {
  const owned = (window as any).__PERMISSIONS__ || []
  const mode: Mode = (binding.arg as Mode) || 'or'
  if (!checkPermission(binding.value || [], owned, mode)) {
    el.parentNode?.removeChild(el)
  }
}

export const permission: Directive = { mounted }
```

- [ ] **Step 8: Run directive test to confirm pass**

Run: `pnpm test src/directives/__tests__/permission.spec.ts`
Expected: 3 tests PASS.

- [ ] **Step 9: Wire `window.__PERMISSIONS__` in `src/main.ts`**

(Will be expanded in later tasks; for now leave a stub.)

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { permission } from './directives/permission'

const app = createApp(App)
app.directive('permission', permission)
app.mount('#app')
```

- [ ] **Step 10: Verify typecheck and full test suite**

Run: `pnpm typecheck && pnpm test`
Expected: typecheck 0 errors; all tests PASS.

---

## Phase C — State, Router, Layout

### Task 9: Pinia stores (user, app, permission, tagsView)

**Files:**
- Create: `src/stores/user.ts`
- Create: `src/stores/app.ts`
- Create: `src/stores/permission.ts`
- Create: `src/stores/tagsView.ts`
- Create: `src/stores/__tests__/user.spec.ts`

- [ ] **Step 1: Write failing test `src/stores/__tests__/user.spec.ts`**

```ts
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
```

- [ ] **Step 2: Run test to confirm fail**

Run: `pnpm test src/stores/__tests__/user.spec.ts`
Expected: FAIL — store not found.

- [ ] **Step 3: Implement `src/stores/user.ts`**

```ts
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
      ;(window as any).__PERMISSIONS__ = info.permissions
    },
    reset() {
      this.token = ''
      this.userInfo = null
      ;(window as any).__PERMISSIONS__ = []
      clearAuth()
    }
  }
})
```

- [ ] **Step 4: Implement `src/stores/app.ts`**

```ts
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
```

- [ ] **Step 5: Implement `src/stores/permission.ts`**

```ts
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import type { MenuNode } from '@/utils/menu'
import { buildSidebarTree, toRouteRecordRaw } from '@/utils/menu'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    dynamicRoutes: [] as RouteRecordRaw[],
    sidebarMenus: [] as MenuNode[]
  }),
  actions: {
    setRoutes(routes: RouteRecordRaw[], menus: MenuNode[]) {
      this.dynamicRoutes = routes
      this.sidebarMenus = menus
    },
    reset() {
      this.dynamicRoutes = []
      this.sidebarMenus = []
    }
  }
})

/** 工具函数：把后端菜单转路由 + 侧边栏 */
export function transformMenus(menus: MenuNode[], layoutComponent: any) {
  const tree = buildSidebarTree(menus)
  const routes = toRouteRecordRaw(tree, layoutComponent)
  return { tree, routes }
}
```

- [ ] **Step 6: Implement `src/stores/tagsView.ts`**

```ts
import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'

interface TagItem {
  path: string
  fullPath: string
  name?: string
  title: string
  affix?: boolean
}

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [] as TagItem[],
    cachedViews: [] as string[]
  }),
  actions: {
    addView(route: RouteLocationNormalized) {
      if (this.visitedViews.some((v) => v.path === route.path)) return
      const title = (route.meta?.title as string) || (route.name as string) || route.path
      this.visitedViews.push({
        path: route.path,
        fullPath: route.fullPath,
        name: route.name as string,
        title
      })
      if (route.meta?.keepAlive !== false && route.name) {
        this.cachedViews.push(route.name as string)
      }
    },
    removeView(path: string) {
      const idx = this.visitedViews.findIndex((v) => v.path === path)
      if (idx >= 0) this.visitedViews.splice(idx, 1)
      const ci = this.cachedViews.findIndex((n) => {
        const v = this.visitedViews.find((x) => x.path === path)
        return v && n === v.name
      })
      if (ci >= 0) this.cachedViews.splice(ci, 1)
    },
    removeOthers(path: string) {
      this.visitedViews = this.visitedViews.filter((v) => v.path === path || v.affix)
    },
    removeAll() {
      this.visitedViews = this.visitedViews.filter((v) => v.affix)
    }
  }
})
```

- [ ] **Step 7: Run tests**

Run: `pnpm test`
Expected: all tests PASS; user-store 3 tests, request 3 tests, auth 4 tests, menu 2 tests, permission 3 tests.

- [ ] **Step 8: Verify typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

---

### Task 10: Vue Router (static + dynamic + guards)

**Files:**
- Create: `src/router/routes.ts`
- Create: `src/router/dynamic.ts`
- Create: `src/router/index.ts`
- Create: `src/views/error/404.vue`
- Create: `src/views/error/403.vue`
- Create: `src/views/dashboard/index.vue`

- [ ] **Step 1: Create `src/views/error/404.vue`**

```vue
<template>
  <div class="error-page">
    <el-result icon="warning" title="404" sub-title="页面不存在">
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.error-page { display: flex; align-items: center; justify-content: center; height: 60vh; }
</style>
```

- [ ] **Step 2: Create `src/views/error/403.vue`**

```vue
<template>
  <div class="error-page">
    <el-result icon="error" title="403" sub-title="无权访问">
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.error-page { display: flex; align-items: center; justify-content: center; height: 60vh; }
</style>
```

- [ ] **Step 3: Create `src/views/dashboard/index.vue`**

```vue
<template>
  <div class="dashboard">
    <el-card>
      <h2>{{ t('dashboard.welcome') }}</h2>
      <p>{{ t('dashboard.hint') }}</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
```

- [ ] **Step 4: Create `src/router/routes.ts` (static)**

```ts
import type { RouteRecordRaw } from 'vue-router'

const Layout = () => import('@/layouts/index.vue')

export const staticRoutes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: () => import('@/views/login/index.vue'), meta: { title: '登录' } },
  { path: '/403', name: '403', component: () => import('@/views/error/403.vue'), meta: { title: '无权限' } },
  { path: '/404', name: '404', component: () => import('@/views/error/404.vue'), meta: { title: '未找到' } },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{ path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/index.vue'), meta: { title: '工作台', icon: 'House', affix: true } }]
  },
  { path: '/:pathMatch(.*)*', redirect: '/404' }
]
```

- [ ] **Step 5: Create `src/router/dynamic.ts` (helper to add dynamic routes)**

```ts
import type { Router, RouteRecordRaw } from 'vue-router'
import type { MenuNode } from '@/utils/menu'
import { usePermissionStore, transformMenus } from '@/stores/permission'

const Layout = () => import('@/layouts/index.vue')

export async function loadDynamicRoutes(router: Router, menus: MenuNode[]) {
  const permStore = usePermissionStore()
  const { routes, tree } = transformMenus(menus, Layout)
  permStore.setRoutes(routes, tree)
  routes.forEach((r) => router.addRoute(r))
}
```

- [ ] **Step 6: Create `src/router/index.ts`**

```ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { staticRoutes } from './routes'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { getUserMenus } from '@/api/system/user'
import { loadDynamicRoutes } from './dynamic'

NProgress.configure({ showSpinner: false })

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes as RouteRecordRaw[]
})

const WHITE_LIST = ['/login', '/403', '/404']

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  const hasToken = !!userStore.token

  if (!hasToken) {
    if (WHITE_LIST.includes(to.path)) return next()
    return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (to.path === '/login') return next('/')

  const permStore = usePermissionStore()
  if (permStore.dynamicRoutes.length === 0) {
    try {
      const menus = await getUserMenus()
      await loadDynamicRoutes(router, menus)
      return next({ ...to, replace: true })
    } catch (e) {
      userStore.reset()
      return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
  next()
})

router.afterEach(() => NProgress.done())

export default router
```

- [ ] **Step 7: Verify typecheck**

Run: `pnpm typecheck`
Expected: errors for `@/api/system/user` and `@/views/login/index.vue` (will be created next). **This is expected** — proceed.

---

### Task 11: API layer — system (login, user) and auth modules

**Files:**
- Create: `src/api/system/login.ts`
- Create: `src/api/system/user.ts`
- Create: `src/api/auth/loginAccount.ts`
- Create: `src/api/auth/role.ts`
- Create: `src/api/auth/menu.ts`
- Create: `src/api/auth/oauthClient.ts`
- Create: `src/api/basic/fileInfo.ts`
- Create: `src/api/basic/fileBusiness.ts`
- Create: `src/api/basic/tempFile.ts`

- [ ] **Step 1: Create `src/api/system/login.ts`**

```ts
import { useHttp } from '@/utils/request'
import type { LoginResp } from '@/types/auth'

export interface LoginParams {
  username: string
  password: string
  clientId?: string
  clientSecret?: string
}

export function login(params: LoginParams): Promise<LoginResp> {
  return useHttp().postForm<LoginResp>('/auth/oauth2/token', {
    grant_type: 'password',
    username: params.username,
    password: params.password,
    client_id: params.clientId || 'biscuit-guide-admin',
    client_secret: params.clientSecret || 'biscuit-guide-admin-secret'
  })
}

export function logout(): Promise<void> {
  return useHttp().post('/auth/oauth2/revoke')
}
```

- [ ] **Step 2: Create `src/api/system/user.ts`**

```ts
import { useHttp } from '@/utils/request'
import type { UserInfo, MenuNode } from '@/types/auth'

export function getUserInfo(id: string): Promise<UserInfo> {
  return useHttp().get('/auth/loginAccount/getById', { params: { id } })
}

export function getUserMenus(): Promise<MenuNode[]> {
  return useHttp().get('/auth/userMenu/tree')
}
```

- [ ] **Step 3: Create `src/api/auth/loginAccount.ts`**

```ts
import { useHttp } from '@/utils/request'
import type { Result } from '@/types/api'
import type {
  LoginAccount,
  LoginAccountAddOrUpdate,
  LoginAccountPageResp
} from '@/types/auth'

export interface LoginAccountPageQuery {
  current: number
  size: number
  entity: Partial<LoginAccount>
}

export function pageLoginAccount(q: LoginAccountPageQuery): Promise<LoginAccountPageResp> {
  return useHttp().post('/auth/loginAccount/page', q)
}

export function addLoginAccount(body: LoginAccountAddOrUpdate): Promise<void> {
  return useHttp().post('/auth/loginAccount/addAccount', body)
}

export function editLoginAccountStatus(body: LoginAccountAddOrUpdate): Promise<void> {
  return useHttp().post('/auth/loginAccount/editAccountStatus', body)
}

export function editLoginAccountPassword(body: { id: string; oldPassword: string; newPassword: string }): Promise<void> {
  return useHttp().post('/auth/loginAccount/editAccountPassword', body)
}

export function resetLoginAccountPassword(body: { id: string; newPassword: string }): Promise<void> {
  return useHttp().post('/auth/loginAccount/resetAccountPassword', body)
}

export function assignRoles(body: { id: string; roleIds: string[] }): Promise<void> {
  return useHttp().post('/auth/loginAccount/accountRoleConfig', body)
}
```

- [ ] **Step 4: Create `src/api/auth/role.ts`**

```ts
import { useHttp } from '@/utils/request'
import type { Role, RolePageResp } from '@/types/auth'

export interface RolePageQuery {
  current: number
  size: number
  entity: Partial<Role>
}

export function pageRole(q: RolePageQuery): Promise<RolePageResp> {
  return useHttp().post('/auth/role/page', q)
}

export function addRole(body: Partial<Role>): Promise<void> {
  return useHttp().post('/auth/role/addRole', body)
}

export function editRole(body: Partial<Role>): Promise<void> {
  return useHttp().post('/auth/role/editRole', body)
}

export function editRoleStatus(body: Partial<Role>): Promise<void> {
  return useHttp().post('/auth/role/editRoleStatus', body)
}

export function assignMenus(body: { id: string; menuIds: string[] }): Promise<void> {
  return useHttp().post('/auth/role/roleMenuConfig', body)
}
```

- [ ] **Step 5: Create `src/api/auth/menu.ts`**

```ts
import { useHttp } from '@/utils/request'
import type { Menu } from '@/types/auth'

export function listMenus(): Promise<Menu[]> {
  return useHttp().get('/auth/menu/list')
}

export function addMenu(body: Partial<Menu>): Promise<void> {
  return useHttp().post('/auth/menu/add', body)
}

export function editMenu(body: Partial<Menu>): Promise<void> {
  return useHttp().post('/auth/menu/edit', body)
}

export function deleteMenu(id: string): Promise<void> {
  return useHttp().get('/auth/menu/delete', { params: { id } })
}
```

- [ ] **Step 6: Create `src/api/auth/oauthClient.ts`**

```ts
import { useHttp } from '@/utils/request'
import type { OauthClient } from '@/types/auth'
import type { PageReq, PageResp } from '@/types/api'

export function pageOauthClient(q: PageReq<Partial<OauthClient>, any>): Promise<PageResp<OauthClient>> {
  return useHttp().post('/auth/oauthClient/page', q)
}

export function addOauthClient(body: Partial<OauthClient>): Promise<void> {
  return useHttp().post('/auth/oauthClient/add', body)
}

export function editOauthClient(body: Partial<OauthClient>): Promise<void> {
  return useHttp().post('/auth/oauthClient/edit', body)
}

export function deleteOauthClient(id: string): Promise<void> {
  return useHttp().get('/auth/oauthClient/delete', { params: { id } })
}
```

- [ ] **Step 7: Create `src/api/basic/fileInfo.ts`**

```ts
import { useHttp } from '@/utils/request'
import type { FileInfo } from '@/types/basic'
import type { PageReq, PageResp } from '@/types/api'

export function pageFileInfo(q: PageReq<Partial<FileInfo>, any>): Promise<PageResp<FileInfo>> {
  return useHttp().post('/basic/fileInfo/page', q)
}

export function uploadFile(formData: FormData): Promise<FileInfo> {
  return useHttp().upload('/basic/fileInfo/upload', formData)
}

export function deleteFile(id: string): Promise<void> {
  return useHttp().get('/basic/fileInfo/delete', { params: { id } })
}
```

- [ ] **Step 8: Create `src/api/basic/fileBusiness.ts`**

```ts
import { useHttp } from '@/utils/request'
import type { FileBusiness } from '@/types/basic'

export function listFileBusiness(): Promise<FileBusiness[]> {
  return useHttp().get('/basic/fileBusiness/list')
}

export function addFileBusiness(body: Partial<FileBusiness>): Promise<void> {
  return useHttp().post('/basic/fileBusiness/add', body)
}

export function editFileBusiness(body: Partial<FileBusiness>): Promise<void> {
  return useHttp().post('/basic/fileBusiness/edit', body)
}

export function deleteFileBusiness(id: string): Promise<void> {
  return useHttp().get('/basic/fileBusiness/delete', { params: { id } })
}
```

- [ ] **Step 9: Create `src/api/basic/tempFile.ts`**

```ts
import { useHttp } from '@/utils/request'
import type { TempFile } from '@/types/basic'
import type { PageReq, PageResp } from '@/types/api'

export function pageTempFile(q: PageReq<Partial<TempFile>, any>): Promise<PageResp<TempFile>> {
  return useHttp().post('/basic/tempFile/page', q)
}

export function cleanupTempFile(): Promise<void> {
  return useHttp().post('/basic/tempFile/cleanup')
}
```

- [ ] **Step 10: Verify typecheck**

Run: `pnpm typecheck`
Expected: errors only for `@/views/login/index.vue` (next task).

---

## Phase D — Login & Layout

### Task 12: Login page

**Files:**
- Create: `src/views/login/index.vue`

- [ ] **Step 1: Implement `src/views/login/index.vue`**

```vue
<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="title">{{ t('login.title') }}</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" :placeholder="t('login.username')" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" show-password :placeholder="t('login.password')" prefix-icon="Lock" @keyup.enter="onSubmit" />
        </el-form-item>
        <el-button type="primary" :loading="loading" class="submit" @click="onSubmit">
          {{ t('login.submit') }}
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { login } from '@/api/system/login'
import { getUserInfo } from '@/api/system/user'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: '', password: '' })
const rules = reactive<FormRules>({
  username: [{ required: true, message: () => t('login.usernameRequired'), trigger: 'blur' }],
  password: [{ required: true, message: () => t('login.passwordRequired'), trigger: 'blur' }]
})

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  loading.value = true
  try {
    const resp = await login({ username: form.username, password: form.password })
    userStore.setToken(resp.access_token)
    // 后端约定：账号 ID 即用户名（fallback）。若你的 userInfo 需要独立 ID，调整这里。
    const info = await getUserInfo(form.username)
    userStore.setUserInfo(info)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e: any) {
    ElMessage.error(e?.message || t('login.failed'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%); }
.login-card { width: 380px; padding: 24px 8px; }
.title { text-align: center; margin: 0 0 24px; }
.submit { width: 100%; }
</style>
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: errors for `@/layouts/index.vue` and `@/i18n` (next tasks).

---

### Task 13: i18n (zh-CN, en-US) + Element Plus locale sync

**Files:**
- Create: `src/i18n/lang/zh-CN.ts`
- Create: `src/i18n/lang/en-US.ts`
- Create: `src/i18n/modules/common.ts`
- Create: `src/i18n/modules/auth.ts`
- Create: `src/i18n/modules/basic.ts`
- Create: `src/i18n/modules/layout.ts`
- Create: `src/i18n/index.ts`
- Modify: `src/main.ts` (install i18n + Element Plus)

- [ ] **Step 1: Create `src/i18n/modules/common.ts`**

```ts
export const common = {
  zh: {
    common: {
      confirm: '确定',
      cancel: '取消',
      add: '新增',
      edit: '编辑',
      delete: '删除',
      search: '搜索',
      reset: '重置',
      refresh: '刷新',
      export: '导出',
      status: '状态',
      enabled: '启用',
      disabled: '停用',
      operation: '操作',
      submit: '提交',
      pleaseInput: '请输入',
      pleaseSelect: '请选择'
    }
  },
  en: {
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      reset: 'Reset',
      refresh: 'Refresh',
      export: 'Export',
      status: 'Status',
      enabled: 'Enabled',
      disabled: 'Disabled',
      operation: 'Actions',
      submit: 'Submit',
      pleaseInput: 'Please input',
      pleaseSelect: 'Please select'
    }
  }
}
```

- [ ] **Step 2: Create `src/i18n/modules/layout.ts`**

```ts
export const layout = {
  zh: {
    layout: {
      toggleSidebar: '折叠侧边栏',
      fullscreen: '全屏',
      exitFullscreen: '退出全屏',
      refresh: '刷新',
      profile: '个人中心',
      logout: '退出登录',
      switchLanguage: '切换语言',
      dashboard: '工作台',
      auth: '权限管理',
      basic: '基础管理'
    }
  },
  en: {
    layout: {
      toggleSidebar: 'Toggle Sidebar',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit Fullscreen',
      refresh: 'Refresh',
      profile: 'Profile',
      logout: 'Logout',
      switchLanguage: 'Language',
      dashboard: 'Dashboard',
      auth: 'Authorization',
      basic: 'Basics'
    }
  }
}
```

- [ ] **Step 3: Create `src/i18n/modules/auth.ts`**

```ts
export const auth = {
  zh: {
    login: {
      title: 'biscuit-guide 登录',
      username: '账号',
      password: '密码',
      usernameRequired: '请输入账号',
      passwordRequired: '请输入密码',
      submit: '登录',
      failed: '登录失败'
    },
    loginAccount: {
      title: '登录账户',
      loginName: '登录名',
      userName: '用户姓名',
      email: '邮箱',
      phone: '电话',
      password: '密码',
      newPassword: '新密码',
      oldPassword: '原密码',
      roleAssign: '分配角色',
      passwordReset: '重置密码',
      passwordEdit: '修改密码'
    },
    role: {
      title: '角色管理',
      roleCode: '角色编码',
      roleName: '角色名称',
      clientId: '客户端',
      menuAssign: '分配菜单'
    },
    menu: {
      title: '菜单管理',
      menuName: '菜单名称',
      menuCode: '菜单编码',
      menuType: '类型',
      path: '路径',
      component: '组件',
      icon: '图标',
      sort: '排序',
      permission: '权限码'
    },
    oauthClient: {
      title: 'OAuth 客户端',
      clientId: '客户端 ID',
      clientSecret: '客户端密钥',
      clientName: '客户端名称',
      accessTokenValidity: 'Access Token 有效期',
      refreshTokenValidity: 'Refresh Token 有效期',
      authorizedGrantTypes: '授权类型',
      webServerRedirectUri: '回调地址'
    }
  },
  en: {
    login: {
      title: 'biscuit-guide Login',
      username: 'Username',
      password: 'Password',
      usernameRequired: 'Username is required',
      passwordRequired: 'Password is required',
      submit: 'Sign in',
      failed: 'Login failed'
    },
    loginAccount: {
      title: 'Login Accounts',
      loginName: 'Login Name',
      userName: 'User Name',
      email: 'Email',
      phone: 'Phone',
      password: 'Password',
      newPassword: 'New Password',
      oldPassword: 'Old Password',
      roleAssign: 'Assign Roles',
      passwordReset: 'Reset Password',
      passwordEdit: 'Change Password'
    },
    role: {
      title: 'Roles',
      roleCode: 'Role Code',
      roleName: 'Role Name',
      clientId: 'Client',
      menuAssign: 'Assign Menus'
    },
    menu: {
      title: 'Menus',
      menuName: 'Menu Name',
      menuCode: 'Menu Code',
      menuType: 'Type',
      path: 'Path',
      component: 'Component',
      icon: 'Icon',
      sort: 'Sort',
      permission: 'Permission'
    },
    oauthClient: {
      title: 'OAuth Clients',
      clientId: 'Client ID',
      clientSecret: 'Client Secret',
      clientName: 'Client Name',
      accessTokenValidity: 'Access Token TTL',
      refreshTokenValidity: 'Refresh Token TTL',
      authorizedGrantTypes: 'Grant Types',
      webServerRedirectUri: 'Redirect URI'
    }
  }
}
```

- [ ] **Step 4: Create `src/i18n/modules/basic.ts`**

```ts
export const basic = {
  zh: {
    fileInfo: { title: '文件管理', fileName: '文件名', originalName: '原始名', fileSize: '大小', businessId: '业务 ID', businessType: '业务类型' },
    fileBusiness: { title: '文件业务', businessCode: '业务编码', businessName: '业务名称', description: '描述' },
    tempFile: { title: '临时文件', expireTime: '过期时间' }
  },
  en: {
    fileInfo: { title: 'Files', fileName: 'File Name', originalName: 'Original Name', fileSize: 'Size', businessId: 'Business ID', businessType: 'Business Type' },
    fileBusiness: { title: 'File Business', businessCode: 'Business Code', businessName: 'Business Name', description: 'Description' },
    tempFile: { title: 'Temp Files', expireTime: 'Expire At' }
  }
}
```

- [ ] **Step 5: Create `src/i18n/lang/zh-CN.ts`**

```ts
import { common } from '../modules/common'
import { layout } from '../modules/layout'
import { auth } from '../modules/auth'
import { basic } from '../modules/basic'

export default {
  ...common.zh,
  ...layout.zh,
  ...auth.zh,
  ...basic.zh,
  dashboard: {
    welcome: '欢迎使用 biscuit-guide 管理控制台',
    hint: '左侧菜单将根据您的权限动态生成'
  }
}
```

- [ ] **Step 6: Create `src/i18n/lang/en-US.ts`**

```ts
import { common } from '../modules/common'
import { layout } from '../modules/layout'
import { auth } from '../modules/auth'
import { basic } from '../modules/basic'

export default {
  ...common.en,
  ...layout.en,
  ...auth.en,
  ...basic.en,
  dashboard: {
    welcome: 'Welcome to biscuit-guide Admin Console',
    hint: 'The sidebar is generated based on your permissions'
  }
}
```

- [ ] **Step 7: Create `src/i18n/index.ts`**

```ts
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
```

- [ ] **Step 8: Update `src/main.ts` to install i18n + Element Plus + Pinia + Router**

```ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { i18n, elementLocaleMap } from './i18n'
import { initHttp } from './utils/request'
import { permission } from './directives/permission'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(router)
app.use(ElementPlus)
app.use(i18n)
app.use({ install: (a: any) => a.provide('elLocale', elementLocaleMap[(i18n.global.locale as unknown) as 'zh-CN']) })

for (const [key, comp] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, comp as any)
}
app.directive('permission', permission)

initHttp(import.meta.env.VITE_API_BASE_URL)

app.mount('#app')
```

- [ ] **Step 9: Verify typecheck**

Run: `pnpm typecheck`
Expected: errors for `@/layouts/index.vue` (next task).

---

### Task 14: Classic Layout (Sidebar + Navbar + AppMain + TagsView + Breadcrumb + UserDropdown)

**Files:**
- Create: `src/layouts/index.vue`
- Create: `src/layouts/components/Sidebar.vue`
- Create: `src/layouts/components/Navbar.vue`
- Create: `src/layouts/components/AppMain.vue`
- Create: `src/layouts/components/TagsView.vue`
- Create: `src/layouts/components/Breadcrumb.vue`
- Create: `src/layouts/components/UserDropdown.vue`

- [ ] **Step 1: Create `src/layouts/components/Sidebar.vue`**

```vue
<template>
  <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="sidebar">
    <div class="logo">{{ appStore.sidebarCollapsed ? 'BG' : t('layout.dashboard') }}</div>
    <el-menu
      :default-active="route.path"
      :collapse="appStore.sidebarCollapsed"
      :unique-opened="true"
      background-color="#001529"
      text-color="#cfd3dc"
      active-text-color="#409eff"
      router
    >
      <template v-for="m in permStore.sidebarMenus" :key="m.id">
        <SidebarItem :item="m" />
      </template>
    </el-menu>
  </el-aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const { t } = useI18n()
const appStore = useAppStore()
const permStore = usePermissionStore()
</script>

<style scoped>
.sidebar { background: #001529; transition: width 0.2s; height: 100vh; overflow: auto; }
.sidebar :deep(.el-menu) { border: 0; }
.logo { height: 56px; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; background: #002140; }
</style>
```

- [ ] **Step 2: Create `src/layouts/components/SidebarItem.vue`**

```vue
<template>
  <template v-if="item.children && item.children.length > 0 && item.children[0].menuType !== 'BUTTON'">
    <el-sub-menu :index="item.path || item.menuCode">
      <template #title>
        <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
        <span>{{ item.menuName }}</span>
      </template>
      <SidebarItem v-for="c in item.children" :key="c.id" :item="c" />
    </el-sub-menu>
  </template>
  <template v-else>
    <el-menu-item :index="resolvePath(item)">
      <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
      <template #title>{{ item.menuName }}</template>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import type { MenuNode } from '@/utils/menu'
import { useRoute } from 'vue-router'

const props = defineProps<{ item: MenuNode }>()
const route = useRoute()

function resolvePath(item: MenuNode) {
  if (item.path?.startsWith('/')) return item.path
  // 简化：直接拼接到当前父路径
  return (route.path.replace(/\/[^/]*$/, '') || '') + '/' + (item.path || item.menuCode)
}
</script>
```

- [ ] **Step 3: Create `src/layouts/components/Navbar.vue`**

```vue
<template>
  <el-header class="navbar">
    <div class="left">
      <el-icon class="collapse-btn" @click="appStore.toggleSidebar()">
        <component :is="appStore.sidebarCollapsed ? 'Expand' : 'Fold'" />
      </el-icon>
      <Breadcrumb />
    </div>
    <div class="right">
      <el-dropdown @command="onCommand">
        <span class="user-trigger">
          <el-icon><UserFilled /></el-icon>
          {{ userStore.userInfo?.userName || 'user' }}
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">{{ t('layout.profile') }}</el-dropdown-item>
            <el-dropdown-item command="lang">{{ t('layout.switchLanguage') }}</el-dropdown-item>
            <el-dropdown-item command="logout" divided>{{ t('layout.logout') }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { i18n } from '@/i18n'
import { logout } from '@/api/system/login'
import Breadcrumb from './Breadcrumb.vue'

const { t, locale } = useI18n()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

async function onCommand(cmd: string) {
  if (cmd === 'profile') {
    ElMessage.info(t('layout.profile'))
  } else if (cmd === 'lang') {
    const next = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
    locale.value = next
    appStore.setLocale(next as any)
  } else if (cmd === 'logout') {
    try { await logout() } catch {}
    userStore.reset()
    router.push('/login')
  }
}
</script>

<style scoped>
.navbar { background: #fff; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
.left { display: flex; align-items: center; gap: 16px; }
.collapse-btn { font-size: 20px; cursor: pointer; }
.user-trigger { display: flex; align-items: center; gap: 4px; cursor: pointer; }
</style>
```

- [ ] **Step 4: Create `src/layouts/components/Breadcrumb.vue`**

```vue
<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="b in breadcrumbs" :key="b.path">{{ b.title }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const breadcrumbs = computed(() => {
  return route.matched.filter((m) => m.meta?.title).map((m) => ({ path: m.path, title: m.meta.title }))
})
</script>
```

- [ ] **Step 5: Create `src/layouts/components/AppMain.vue`**

```vue
<template>
  <el-main class="app-main">
    <TagsView />
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </transition>
    </router-view>
  </el-main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTagsViewStore } from '@/stores/tagsView'
import TagsView from './TagsView.vue'

const route = useRoute()
const tagsStore = useTagsViewStore()
const cachedViews = computed(() => tagsStore.cachedViews)
</script>

<style scoped>
.app-main { padding: 0; background: #f5f7fa; min-height: calc(100vh - 56px); }
.fade-transform-enter-active, .fade-transform-leave-active { transition: all 0.2s; }
.fade-transform-enter-from { opacity: 0; transform: translateY(8px); }
.fade-transform-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
```

- [ ] **Step 6: Create `src/layouts/components/TagsView.vue`**

```vue
<template>
  <div class="tags-view">
    <router-link
      v-for="tag in tagsStore.visitedViews"
      :key="tag.path"
      :to="tag.fullPath"
      class="tag-item"
      :class="{ active: isActive(tag) }"
      @contextmenu.prevent="openMenu(tag, $event)"
    >
      {{ tag.title }}
      <el-icon v-if="!tag.affix" class="close" @click.prevent.stop="closeTag(tag)"><Close /></el-icon>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/stores/tagsView'

const route = useRoute()
const router = useRouter()
const tagsStore = useTagsViewStore()

function isActive(tag: { path: string }) { return tag.path === route.path }
function closeTag(tag: { path: string }) {
  tagsStore.removeView(tag.path)
  if (isActive(tag)) {
    const last = tagsStore.visitedViews[tagsStore.visitedViews.length - 1]
    router.push(last ? last.fullPath : '/')
  }
}
function openMenu(tag: any, e: MouseEvent) {
  if (tag.affix) return
  // 简化：直接提供"关闭其他"
  const others = tagsStore.visitedViews.filter((v) => v.path !== tag.path && !v.affix)
  others.forEach((o) => tagsStore.removeView(o.path))
}
</script>

<style scoped>
.tags-view { background: #fff; border-bottom: 1px solid #f0f0f0; padding: 4px 8px; display: flex; gap: 4px; overflow-x: auto; }
.tag-item { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 2px; text-decoration: none; color: #666; font-size: 12px; white-space: nowrap; }
.tag-item.active { background: #409eff; color: #fff; border-color: #409eff; }
.close { font-size: 12px; }
</style>
```

- [ ] **Step 7: Create `src/layouts/index.vue`**

```vue
<template>
  <el-container class="layout">
    <Sidebar />
    <el-container>
      <Navbar />
      <AppMain />
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import AppMain from './components/AppMain.vue'
</script>

<style scoped>
.layout { height: 100vh; }
</style>
```

- [ ] **Step 8: Verify typecheck**

Run: `pnpm typecheck`
Expected: 0 errors (or warnings only).

- [ ] **Step 9: Run dev server**

Run: `pnpm dev`
Expected: opens on http://localhost:5173; redirected to `/login`; login page renders.

---

## Phase E — Generic Components (Template)

> **Read this whole task before Tasks 15-20.** All business pages follow the same template; Tasks 15-20 only show deltas (columns, form fields, API methods).

### Task 15: Generic components — PageTable + usePage + PageSearch + PageDialog + useCrud

**Files:**
- Create: `src/composables/usePage.ts`
- Create: `src/composables/useCrud.ts`
- Create: `src/components/PageTable.vue`
- Create: `src/components/PageSearch.vue`
- Create: `src/components/PageDialog.vue`

- [ ] **Step 1: Create `src/composables/usePage.ts`**

```ts
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { DEFAULT_PAGE_SIZE } from '@/types/api'

export interface PageState<T, Q> {
  query: Q
  data: T[]
  total: number
  current: number
  size: number
  loading: boolean
}

export function usePage<T, Q extends Record<string, any>>(
  fetchApi: (q: any) => Promise<{ records: T[]; total: number; current: number; size: number }>,
  defaultQuery: () => Q
) {
  const state = reactive<PageState<T, Q>>({
    query: defaultQuery(),
    data: [],
    total: 0,
    current: 1,
    size: DEFAULT_PAGE_SIZE,
    loading: false
  })

  async function search() {
    state.loading = true
    try {
      const resp = await fetchApi({
        current: state.current,
        size: state.size,
        entity: state.query
      })
      state.data = resp.records
      state.total = resp.total
    } catch (e: any) {
      ElMessage.error(e?.message || '查询失败')
    } finally {
      state.loading = false
    }
  }

  function reset() {
    state.query = defaultQuery()
    state.current = 1
    search()
  }

  function refresh() {
    return search()
  }

  function onPageChange(p: { current: number; size: number }) {
    state.current = p.current
    state.size = p.size
    search()
  }

  return { state, search, reset, refresh, onPageChange }
}
```

- [ ] **Step 2: Create `src/composables/useCrud.ts`**

```ts
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useCrud<TAdd, TUpdate extends { id: string }>(
  apis: {
    add: (body: TAdd) => Promise<void>
    update: (body: TUpdate) => Promise<void>
    remove: (id: string) => Promise<void>
  }
) {
  const dialogVisible = ref(false)
  const dialogMode = ref<'add' | 'edit'>('add')
  const editingId = ref<string | null>(null)
  const submitting = ref(false)

  function openAdd() {
    dialogMode.value = 'add'
    editingId.value = null
    dialogVisible.value = true
  }
  function openEdit(id: string) {
    dialogMode.value = 'edit'
    editingId.value = id
    dialogVisible.value = true
  }
  async function submit(form: TAdd | TUpdate) {
    submitting.value = true
    try {
      if (dialogMode.value === 'add') {
        await apis.add(form as TAdd)
        ElMessage.success('新增成功')
      } else {
        await apis.update({ ...(form as any), id: editingId.value } as TUpdate)
        ElMessage.success('修改成功')
      }
      dialogVisible.value = false
      return true
    } catch (e: any) {
      ElMessage.error(e?.message || '操作失败')
      return false
    } finally {
      submitting.value = false
    }
  }
  async function remove(id: string) {
    try {
      await apis.remove(id)
      ElMessage.success('删除成功')
      return true
    } catch (e: any) {
      ElMessage.error(e?.message || '删除失败')
      return false
    }
  }

  return { dialogVisible, dialogMode, editingId, submitting, openAdd, openEdit, submit, remove }
}
```

- [ ] **Step 3: Create `src/components/PageTable.vue`**

```vue
<template>
  <div class="page-table">
    <slot name="toolbar" />
    <el-table
      v-loading="state.loading"
      :data="state.data"
      :row-key="rowKey"
      border
      stripe
      style="width: 100%"
    >
      <slot />
    </el-table>
    <div class="pagination">
      <el-pagination
        v-model:current-page="state.current"
        v-model:page-size="state.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="state.total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="(p: number) => onPageChange({ current: p, size: state.size })"
        @size-change="(s: number) => onPageChange({ current: 1, size: s })"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T, Q extends Record<string, any>">
import type { PageState } from '@/composables/usePage'

defineProps<{
  state: PageState<T, Q>
  rowKey?: string
}>()

const emit = defineEmits<{
  (e: 'page-change', payload: { current: number; size: number }): void
}>()

function onPageChange(payload: { current: number; size: number }) {
  emit('page-change', payload)
}
</script>

<style scoped>
.page-table { display: flex; flex-direction: column; gap: 12px; }
.pagination { display: flex; justify-content: flex-end; }
</style>
```

- [ ] **Step 4: Create `src/components/PageSearch.vue`**

```vue
<template>
  <el-card class="page-search">
    <el-form :model="model" inline @submit.prevent="onSearch">
      <slot />
      <el-form-item>
        <el-button type="primary" @click="onSearch">{{ t('common.search') }}</el-button>
        <el-button @click="onReset">{{ t('common.reset') }}</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const emit = defineEmits<{ (e: 'search'): void; (e: 'reset'): void }>()
const model = defineModel<Record<string, any>>({ required: true })
function onSearch() { emit('search') }
function onReset() { emit('reset') }
</script>

<style scoped>
.page-search { margin-bottom: 12px; }
</style>
```

- [ ] **Step 5: Create `src/components/PageDialog.vue`**

```vue
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="560px"
    :close-on-click-modal="false"
    @closed="emit('closed')"
  >
    <slot />
    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="emit('submit')">{{ t('common.submit') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps<{ modelValue: boolean; title: string; loading?: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'submit'): void; (e: 'closed'): void }>()
const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
</script>
```

- [ ] **Step 6: Verify typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

---

## Phase F — Auth Business Pages (follow the LoginAccount template)

### Task 16: LoginAccount page (template example)

**Files:**
- Create: `src/views/auth/loginAccount/index.vue`

- [ ] **Step 1: Implement `src/views/auth/loginAccount/index.vue`**

```vue
<template>
  <div class="page">
    <PageSearch v-model="state.query" @search="search" @reset="reset">
      <el-form-item :label="t('loginAccount.loginName')">
        <el-input v-model="state.query.loginName" clearable />
      </el-form-item>
      <el-form-item :label="t('loginAccount.userName')">
        <el-input v-model="state.query.userName" clearable />
      </el-form-item>
      <el-form-item :label="t('common.status')">
        <el-select v-model="state.query.status" clearable>
          <el-option :label="t('common.enabled')" value="NORMAL" />
          <el-option :label="t('common.disabled')" value="DISABLED" />
        </el-select>
      </el-form-item>
    </PageSearch>

    <PageTable :state="state" row-key="id" @page-change="onPageChange">
      <template #toolbar>
        <el-button v-permission="['loginAccount:add']" type="primary" @click="crud.openAdd()">
          {{ t('common.add') }}
        </el-button>
      </template>
      <el-table-column prop="loginName" :label="t('loginAccount.loginName')" />
      <el-table-column prop="userName" :label="t('loginAccount.userName')" />
      <el-table-column prop="email" label="Email" />
      <el-table-column prop="phone" :label="t('loginAccount.phone')" />
      <el-table-column :label="t('common.status')">
        <template #default="{ row }">
          <el-tag :type="row.status === 'NORMAL' ? 'success' : 'info'">
            {{ row.status === 'NORMAL' ? t('common.enabled') : t('common.disabled') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('common.operation')" width="320">
        <template #default="{ row }">
          <el-button v-permission="['loginAccount:edit']" size="small" @click="crud.openEdit(row.id)">
            {{ t('common.edit') }}
          </el-button>
          <el-button v-permission="['loginAccount:editStatus']" size="small" @click="toggleStatus(row)">
            {{ row.status === 'NORMAL' ? t('common.disabled') : t('common.enabled') }}
          </el-button>
          <el-button v-permission="['loginAccount:resetPwd']" size="small" @click="onResetPwd(row)">
            {{ t('loginAccount.passwordReset') }}
          </el-button>
          <el-button v-permission="['loginAccount:assignRole']" size="small" type="primary" @click="onAssignRole(row)">
            {{ t('loginAccount.roleAssign') }}
          </el-button>
        </template>
      </el-table-column>
    </PageTable>

    <PageDialog
      v-model="crud.dialogVisible.value"
      :title="crud.dialogMode.value === 'add' ? t('common.add') : t('common.edit')"
      :loading="crud.submitting.value"
      @submit="onSubmit"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="t('loginAccount.loginName')" prop="loginName">
          <el-input v-model="form.loginName" :disabled="crud.dialogMode.value === 'edit'" />
        </el-form-item>
        <el-form-item :label="t('loginAccount.userName')" prop="userName">
          <el-input v-model="form.userName" />
        </el-form-item>
        <el-form-item v-if="crud.dialogMode.value === 'add'" :label="t('loginAccount.password')" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item :label="t('loginAccount.email')">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item :label="t('loginAccount.phone')">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item :label="t('common.status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="NORMAL">{{ t('common.enabled') }}</el-radio>
            <el-radio value="DISABLED">{{ t('common.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </PageDialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { usePage } from '@/composables/usePage'
import { useCrud } from '@/composables/useCrud'
import PageSearch from '@/components/PageSearch.vue'
import PageTable from '@/components/PageTable.vue'
import PageDialog from '@/components/PageDialog.vue'
import {
  pageLoginAccount,
  addLoginAccount,
  editLoginAccountStatus,
  resetLoginAccountPassword
} from '@/api/auth/loginAccount'
import type { LoginAccount, LoginAccountAddOrUpdate } from '@/types/auth'

const { t } = useI18n()
const { state, search, reset, onPageChange } = usePage<LoginAccount, Record<string, any>>(
  pageLoginAccount,
  () => ({ loginName: '', userName: '', status: '' })
)

const crud = useCrud<LoginAccountAddOrUpdate, LoginAccountAddOrUpdate & { id: string }>({
  add: addLoginAccount,
  update: editLoginAccountStatus as any,
  remove: async () => {}
})

const formRef = ref<FormInstance>()
const form = reactive<LoginAccountAddOrUpdate>({
  loginName: '',
  userName: '',
  password: '',
  email: '',
  phone: '',
  status: 'NORMAL'
})
const rules: FormRules = {
  loginName: [{ required: true, message: () => t('loginAccount.loginName'), trigger: 'blur' }],
  userName: [{ required: true, message: () => t('loginAccount.userName'), trigger: 'blur' }],
  password: [{ required: true, message: () => t('loginAccount.password'), trigger: 'blur' }],
  status: [{ required: true }]
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  const ok = await crud.submit({ ...form })
  if (ok) search()
}

async function toggleStatus(row: LoginAccount) {
  const next = row.status === 'NORMAL' ? 'DISABLED' : 'NORMAL'
  await editLoginAccountStatus({ ...row, status: next as any })
  ElMessage.success('操作成功')
  search()
}

async function onResetPwd(row: LoginAccount) {
  const { value } = await ElMessageBox.prompt(t('loginAccount.newPassword'), t('loginAccount.passwordReset'), {
    inputPattern: /.{6,}/,
    inputErrorMessage: 'Min 6 chars'
  })
  await resetLoginAccountPassword({ id: row.id!, newPassword: value })
  ElMessage.success('重置成功')
}

function onAssignRole(row: LoginAccount) {
  ElMessage.info(`分配角色：${row.loginName}（对话框请按需扩展）`)
}

onMounted(search)
</script>
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

---

### Task 17: Role page

**Files:**
- Create: `src/views/auth/role/index.vue`

- [ ] **Step 1: Implement `src/views/auth/role/index.vue`**

```vue
<template>
  <div class="page">
    <PageSearch v-model="state.query" @search="search" @reset="reset">
      <el-form-item :label="t('role.roleCode')">
        <el-input v-model="state.query.roleCode" clearable />
      </el-form-item>
      <el-form-item :label="t('role.roleName')">
        <el-input v-model="state.query.roleName" clearable />
      </el-form-item>
    </PageSearch>

    <PageTable :state="state" row-key="id" @page-change="onPageChange">
      <template #toolbar>
        <el-button v-permission="['role:add']" type="primary" @click="crud.openAdd()">
          {{ t('common.add') }}
        </el-button>
      </template>
      <el-table-column prop="roleCode" :label="t('role.roleCode')" />
      <el-table-column prop="roleName" :label="t('role.roleName')" />
      <el-table-column prop="clientId" :label="t('role.clientId')" />
      <el-table-column :label="t('common.status')">
        <template #default="{ row }">
          <el-tag :type="row.status === 'NORMAL' ? 'success' : 'info'">
            {{ row.status === 'NORMAL' ? t('common.enabled') : t('common.disabled') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('common.operation')" width="280">
        <template #default="{ row }">
          <el-button v-permission="['role:edit']" size="small" @click="crud.openEdit(row.id)">{{ t('common.edit') }}</el-button>
          <el-button v-permission="['role:assignMenu']" size="small" type="primary" @click="onAssignMenu(row)">
            {{ t('role.menuAssign') }}
          </el-button>
        </template>
      </el-table-column>
    </PageTable>

    <PageDialog
      v-model="crud.dialogVisible.value"
      :title="crud.dialogMode.value === 'add' ? t('common.add') : t('common.edit')"
      :loading="crud.submitting.value"
      @submit="onSubmit"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item :label="t('role.roleCode')">
          <el-input v-model="form.roleCode" :disabled="crud.dialogMode.value === 'edit'" />
        </el-form-item>
        <el-form-item :label="t('role.roleName')">
          <el-input v-model="form.roleName" />
        </el-form-item>
        <el-form-item :label="t('role.clientId')">
          <el-input v-model="form.clientId" />
        </el-form-item>
        <el-form-item :label="t('common.status')">
          <el-radio-group v-model="form.status">
            <el-radio value="NORMAL">{{ t('common.enabled') }}</el-radio>
            <el-radio value="DISABLED">{{ t('common.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </PageDialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { usePage } from '@/composables/usePage'
import { useCrud } from '@/composables/useCrud'
import PageSearch from '@/components/PageSearch.vue'
import PageTable from '@/components/PageTable.vue'
import PageDialog from '@/components/PageDialog.vue'
import { pageRole, addRole, editRole } from '@/api/auth/role'
import type { Role } from '@/types/auth'

const { t } = useI18n()
const { state, search, reset, onPageChange } = usePage<Role, Record<string, any>>(
  pageRole,
  () => ({ roleCode: '', roleName: '' })
)
const crud = useCrud<Partial<Role>, Partial<Role> & { id: string }>({
  add: addRole,
  update: editRole,
  remove: async () => {}
})

const formRef = ref<FormInstance>()
const form = reactive<Partial<Role>>({ roleCode: '', roleName: '', clientId: '', status: 'NORMAL' })

async function onSubmit() {
  const ok = await crud.submit({ ...form })
  if (ok) search()
}
function onAssignMenu(row: Role) {
  ElMessage.info(`分配菜单：${row.roleName}（对话框请按需扩展）`)
}
onMounted(search)
</script>
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

---

### Task 18: Menu page (tree table)

**Files:**
- Create: `src/views/auth/menu/index.vue`

- [ ] **Step 1: Implement `src/views/auth/menu/index.vue`**

```vue
<template>
  <div class="page">
    <div class="toolbar">
      <el-button v-permission="['menu:add']" type="primary" @click="onAdd()">
        {{ t('common.add') }}
      </el-button>
      <el-button v-permission="['menu:add']" @click="onAdd()">
        {{ t('common.refresh') }}
      </el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="tree"
      row-key="id"
      :tree-props="{ children: 'children' }"
      default-expand-all
      border
    >
      <el-table-column prop="menuName" :label="t('menu.menuName')" />
      <el-table-column prop="menuCode" :label="t('menu.menuCode')" />
      <el-table-column :label="t('menu.menuType')">
        <template #default="{ row }">
          <el-tag>{{ row.menuType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" :label="t('menu.path')" />
      <el-table-column prop="component" :label="t('menu.component')" />
      <el-table-column prop="sort" :label="t('menu.sort')" width="80" />
      <el-table-column :label="t('common.operation')" width="200">
        <template #default="{ row }">
          <el-button v-permission="['menu:add']" size="small" @click="onAdd(row.id)">+ {{ t('common.add') }}</el-button>
          <el-button v-permission="['menu:edit']" size="small" @click="onEdit(row)">{{ t('common.edit') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { listMenus, addMenu, editMenu } from '@/api/auth/menu'
import type { Menu } from '@/types/auth'

const { t } = useI18n()
const flat = ref<Menu[]>([])
const loading = ref(false)
const tree = computed(() => {
  const map = new Map<string, Menu>()
  flat.value.forEach((m) => map.set(m.id!, { ...m, children: [] }))
  const roots: Menu[] = []
  map.forEach((m) => {
    if (m.parentId && map.has(m.parentId)) map.get(m.parentId)!.children!.push(m)
    else roots.push(m)
  })
  return roots
})

async function load() {
  loading.value = true
  try {
    flat.value = await listMenus()
  } finally {
    loading.value = false
  }
}
function onAdd(parentId = '0') {
  ElMessage.info(`新增子菜单到 ${parentId}（对话框请按需扩展）`)
}
function onEdit(row: Menu) {
  ElMessage.info(`编辑 ${row.menuName}（对话框请按需扩展）`)
}
onMounted(load)
</script>

<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

---

### Task 19: OauthClient page

**Files:**
- Create: `src/views/auth/oauthClient/index.vue`

- [ ] **Step 1: Implement `src/views/auth/oauthClient/index.vue`**

```vue
<template>
  <div class="page">
    <PageSearch v-model="state.query" @search="search" @reset="reset">
      <el-form-item :label="t('oauthClient.clientId')">
        <el-input v-model="state.query.clientId" clearable />
      </el-form-item>
      <el-form-item :label="t('oauthClient.clientName')">
        <el-input v-model="state.query.clientName" clearable />
      </el-form-item>
    </PageSearch>

    <PageTable :state="state" row-key="id" @page-change="onPageChange">
      <template #toolbar>
        <el-button v-permission="['oauthClient:add']" type="primary" @click="crud.openAdd()">
          {{ t('common.add') }}
        </el-button>
      </template>
      <el-table-column prop="clientId" :label="t('oauthClient.clientId')" />
      <el-table-column prop="clientName" :label="t('oauthClient.clientName')" />
      <el-table-column :label="t('common.status')">
        <template #default="{ row }">
          <el-tag :type="row.status === 'NORMAL' ? 'success' : 'info'">
            {{ row.status === 'NORMAL' ? t('common.enabled') : t('common.disabled') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="accessTokenValidity" :label="t('oauthClient.accessTokenValidity')" />
      <el-table-column prop="authorizedGrantTypes" :label="t('oauthClient.authorizedGrantTypes')" />
      <el-table-column :label="t('common.operation')" width="120">
        <template #default="{ row }">
          <el-button v-permission="['oauthClient:edit']" size="small" @click="crud.openEdit(row.id)">{{ t('common.edit') }}</el-button>
        </template>
      </el-table-column>
    </PageTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePage } from '@/composables/usePage'
import { useCrud } from '@/composables/useCrud'
import PageSearch from '@/components/PageSearch.vue'
import PageTable from '@/components/PageTable.vue'
import { pageOauthClient, addOauthClient, editOauthClient } from '@/api/auth/oauthClient'
import type { OauthClient } from '@/types/auth'

const { t } = useI18n()
const { state, search, reset, onPageChange } = usePage<OauthClient, Record<string, any>>(
  pageOauthClient,
  () => ({ clientId: '', clientName: '' })
)
const crud = useCrud<Partial<OauthClient>, Partial<OauthClient> & { id: string }>({
  add: addOauthClient,
  update: editOauthClient,
  remove: async () => {}
})
onMounted(search)
</script>
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

---

## Phase G — Basic Business Pages

### Task 20: FileInfo page (with upload + download)

**Files:**
- Create: `src/views/basic/fileInfo/index.vue`

- [ ] **Step 1: Implement `src/views/basic/fileInfo/index.vue`**

```vue
<template>
  <div class="page">
    <PageSearch v-model="state.query" @search="search" @reset="reset">
      <el-form-item :label="t('fileInfo.fileName')">
        <el-input v-model="state.query.fileName" clearable />
      </el-form-item>
      <el-form-item :label="t('fileInfo.businessType')">
        <el-input v-model="state.query.businessType" clearable />
      </el-form-item>
    </PageSearch>

    <div class="toolbar">
      <el-upload :http-request="onUpload" :show-file-list="false" :before-upload="beforeUpload">
        <el-button v-permission="['fileInfo:upload']" type="primary">{{ t('common.add') }}</el-button>
      </el-upload>
    </div>

    <PageTable :state="state" row-key="id" @page-change="onPageChange">
      <el-table-column prop="fileName" :label="t('fileInfo.fileName')" />
      <el-table-column prop="originalName" :label="t('fileInfo.originalName')" />
      <el-table-column prop="fileSize" :label="t('fileInfo.fileSize')">
        <template #default="{ row }">{{ formatSize(row.fileSize) }}</template>
      </el-table-column>
      <el-table-column prop="businessType" :label="t('fileInfo.businessType')" />
      <el-table-column :label="t('common.operation')" width="160">
        <template #default="{ row }">
          <el-button v-permission="['fileInfo:delete']" size="small" type="danger" @click="onDelete(row)">{{ t('common.delete') }}</el-button>
        </template>
      </el-table-column>
    </PageTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ElMessage, ElMessageBox, type UploadRequestOptions } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { usePage } from '@/composables/usePage'
import PageSearch from '@/components/PageSearch.vue'
import PageTable from '@/components/PageTable.vue'
import { pageFileInfo, uploadFile, deleteFile } from '@/api/basic/fileInfo'
import type { FileInfo } from '@/types/basic'

const { t } = useI18n()
const { state, search, reset, onPageChange, refresh } = usePage<FileInfo, Record<string, any>>(
  pageFileInfo,
  () => ({ fileName: '', businessType: '' })
)

function formatSize(bytes: number) {
  if (!bytes) return '0 B'
  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`
}

async function onUpload(opts: UploadRequestOptions) {
  const fd = new FormData()
  fd.append('file', opts.file)
  await uploadFile(fd)
  ElMessage.success('上传成功')
  refresh()
}
function beforeUpload(file: File) {
  if (file.size > 500 * 1024 * 1024) {
    ElMessage.error('文件不能超过 500MB')
    return false
  }
  return true
}
async function onDelete(row: FileInfo) {
  await ElMessageBox.confirm(t('common.confirm') + '?', t('common.delete'), { type: 'warning' })
  await deleteFile(row.id!)
  ElMessage.success('删除成功')
  refresh()
}
onMounted(search)
</script>

<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

---

### Task 21: FileBusiness page

**Files:**
- Create: `src/views/basic/fileBusiness/index.vue`

- [ ] **Step 1: Implement `src/views/basic/fileBusiness/index.vue`**

```vue
<template>
  <div class="page">
    <div class="toolbar">
      <el-button v-permission="['fileBusiness:add']" type="primary" @click="onAdd()">{{ t('common.add') }}</el-button>
    </div>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="businessCode" :label="t('fileBusiness.businessCode')" />
      <el-table-column prop="businessName" :label="t('fileBusiness.businessName')" />
      <el-table-column prop="description" :label="t('fileBusiness.description')" />
      <el-table-column :label="t('common.status')">
        <template #default="{ row }">
          <el-tag :type="row.status === 'NORMAL' ? 'success' : 'info'">
            {{ row.status === 'NORMAL' ? t('common.enabled') : t('common.disabled') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('common.operation')" width="160">
        <template #default="{ row }">
          <el-button v-permission="['fileBusiness:edit']" size="small" @click="onEdit(row)">{{ t('common.edit') }}</el-button>
          <el-button v-permission="['fileBusiness:delete']" size="small" type="danger" @click="onDelete(row)">{{ t('common.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { listFileBusiness, addFileBusiness, editFileBusiness, deleteFileBusiness } from '@/api/basic/fileBusiness'
import type { FileBusiness } from '@/types/basic'

const { t } = useI18n()
const list = ref<FileBusiness[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try { list.value = await listFileBusiness() } finally { loading.value = false }
}
function onAdd() { ElMessage.info('新增对话框请按需扩展') }
function onEdit(row: FileBusiness) { ElMessage.info(`编辑 ${row.businessName}`) }
async function onDelete(row: FileBusiness) {
  await ElMessageBox.confirm(t('common.confirm') + '?', t('common.delete'), { type: 'warning' })
  await deleteFileBusiness(row.id!)
  ElMessage.success('删除成功')
  load()
}
onMounted(load)
</script>

<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

---

### Task 22: TempFile page

**Files:**
- Create: `src/views/basic/tempFile/index.vue`

- [ ] **Step 1: Implement `src/views/basic/tempFile/index.vue`**

```vue
<template>
  <div class="page">
    <div class="toolbar">
      <el-button v-permission="['tempFile:cleanup']" type="danger" @click="onCleanup()">清理</el-button>
    </div>
    <PageSearch v-model="state.query" @search="search" @reset="reset">
      <el-form-item :label="t('tempFile.expireTime')">
        <el-input v-model="state.query.expireTime" clearable />
      </el-form-item>
    </PageSearch>
    <PageTable :state="state" row-key="id" @page-change="onPageChange">
      <el-table-column prop="fileName" label="fileName" />
      <el-table-column prop="originalName" label="originalName" />
      <el-table-column prop="fileSize" label="fileSize" />
      <el-table-column prop="expireTime" :label="t('tempFile.expireTime')" />
    </PageTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { usePage } from '@/composables/usePage'
import PageSearch from '@/components/PageSearch.vue'
import PageTable from '@/components/PageTable.vue'
import { pageTempFile, cleanupTempFile } from '@/api/basic/tempFile'
import type { TempFile } from '@/types/basic'

const { t } = useI18n()
const { state, search, reset, onPageChange, refresh } = usePage<TempFile, Record<string, any>>(
  pageTempFile,
  () => ({ expireTime: '' })
)
async function onCleanup() {
  await ElMessageBox.confirm(t('common.confirm') + '?', t('common.delete'), { type: 'warning' })
  await cleanupTempFile()
  ElMessage.success('清理成功')
  refresh()
}
onMounted(search)
</script>

<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

---

## Phase H — Verification & Documentation

### Task 23: Final verification — full smoke checklist

- [ ] **Step 1: Run all unit tests**

Run: `pnpm test`
Expected: all tests PASS (request 3, auth 4, menu 2, permission 3, user-store 3 = 15 tests).

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: 0 errors (warnings OK).

- [ ] **Step 4: Run dev server and inspect login page**

Run: `pnpm dev` (background)
Then in browser: open http://localhost:5173
Expected: redirects to `/login`; login card renders; no console errors.

- [ ] **Step 5: Trigger backend error gracefully**

In login form, enter any username/password and submit.
Expected: ElMessage toast with "Request failed" or backend error text — NOT a white screen or uncaught exception.

- [ ] **Step 6: Switch language**

In language menu, switch to English.
Expected: top bar, sidebar, login page text all switch to English.

- [ ] **Step 7: Collapse sidebar**

Click the fold icon in the top bar.
Expected: sidebar collapses to icons only.

- [ ] **Step 8: Visit 404**

Navigate to http://localhost:5173/some/random/path
Expected: 404 page renders.

- [ ] **Step 9: Build for production**

Run: `pnpm build:prod`
Expected: `dist/` is produced, no errors.

- [ ] **Step 10: Capture dist artifact**

Verify `dist/index.html` and `dist/assets/*` exist.
Expected: yes.

- [ ] **Step 11: Stop dev server**

Ctrl+C the background `pnpm dev` process.

---

### Task 24: README + Known TODOs

**Files:**
- Create: `README.md`
- Create: `docs/KNOWN_TODOS.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# biscuit-guide-frontend

biscuit-guide 后端工程的 Vue 3 + Element Plus 管理控制台。

## 技术栈

Vue 3 · Vite 6 · TypeScript 5 · Pinia 2 · Vue Router 4 · Element Plus 2 · Axios · vue-i18n 9

## 本地启动

```bash
pnpm install
pnpm dev
# 打开 http://localhost:5173
```

要求：Node ≥ 20。本机 `biscuit-guide` 网关跑在 `http://localhost:28000`，Vite proxy 已配置 `/api` 转发到此地址。

## 环境变量

| 文件 | 用途 | VITE_API_BASE_URL |
|---|---|---|
| `.env.development` | dev | `/api`（走 vite proxy） |
| `.env.sit` | sit | `https://sit-gateway.example.com` |
| `.env.production` | prod | `https://api.example.com` |

## 目录结构

参见设计文档 `docs/superpowers/specs/2026-06-10-biscuit-guide-admin-console-design.md`。

核心目录：

- `src/api/` — 按后端服务（auth / basic / system）组织的请求层
- `src/views/` — 业务页面
- `src/router/` — 静态 + 动态路由
- `src/stores/` — Pinia（user / app / permission / tagsView）
- `src/layouts/` — 经典 admin 布局
- `src/components/` — 通用业务组件（PageTable / PageSearch / PageDialog）
- `src/composables/` — `usePage` / `useCrud`
- `src/directives/` — `v-permission`
- `src/i18n/` — 中英双语
- `src/types/` — 业务与 API 类型

## 命令

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 启动 dev server |
| `pnpm build:sit` | 构建 sit 包 |
| `pnpm build:prod` | 构建生产包 |
| `pnpm preview` | 预览构建产物 |
| `pnpm typecheck` | `vue-tsc` 类型检查 |
| `pnpm lint` | ESLint 修复 |
| `pnpm format` | Prettier 格式化 |
| `pnpm test` | 跑测试一次 |
| `pnpm test:watch` | 监听模式跑测试 |

## 对接后端

- 网关端口 28000；`/auth/**` → auth 服务；`/basic/**` → basic 服务（均 StripPrefix=1）
- OAuth2 password 模式：`/auth/oauth2/token` form-encoded；登录后从 cookie 读 token
- 响应统一为 `Result<T>`；`resultCode === '000000'` 表示成功（按后端实际定义调整 `src/utils/request.ts`）
- 分页请求体：`{ entity, search, current, size, orders? }`；响应：`{ records, total, size, current }`（如有出入调整 `src/types/api.d.ts`）
- 动态菜单：登录后调 `GET /auth/userMenu/tree` 返回 `MenuNode[]`，前端转路由 + 侧边栏

## 扩展点

- 字典中心（`useDict` composable 已留位）
- openapi 自动生成 TS 类型（`src/api` 当前为手写，后端跑起来后可接 `openapi-typescript-codegen`）
- 暗色主题（覆盖 Element Plus CSS 变量即可）
- E2E（Playwright）

## 许可

内部项目。
```

- [ ] **Step 2: Write `docs/KNOWN_TODOS.md`**

```markdown
# 已知未做事项

首版交付时**未完成**的功能 / 风险点，留给后续迭代。

## 高优先级

- [ ] `resultCode` 成功码确认：当前假设 `'000000'`，以 `cn.bbwres.biscuit.dto.Result` 实际定义为准
- [ ] `Page` 响应字段确认：当前假设 `records/total/size/current/search`，以 `cn.bbwres.biscuit.dto.Page` 实际定义为准
- [ ] `userMenu` 接口路径与响应确认：当前假设 `GET /auth/userMenu/tree` 返回 `MenuNode[]`，需以 `UserMenuController` 实际为准
- [ ] OAuth2 `client_id` / `client_secret` 默认值：当前硬编码 `biscuit-guide-admin` / `biscuit-guide-admin-secret`，需与运维对齐
- [ ] 分配角色 / 分配菜单的对话框：目前仅占位提示，UI 需补完
- [ ] 文件下载功能：当前仅上传 + 删除 + 列表；下载按钮需按 `FileInfoController` 实际接口补
- [ ] `getUserInfo` 入参：当前用 `username` 作为 ID；后端若严格用 `id`，需调整登录流程

## 中优先级

- [ ] 字典中心（useDict composable 留位，未实现）
- [ ] 暗色主题
- [ ] 全屏 / 刷新按钮（顶栏图标已放，逻辑未接）
- [ ] 个人中心页面（顶栏 dropdown 项已放，跳转未实现）
- [ ] 角色 / 用户的删除操作（部分 controller 未提供 delete 接口，按需补）

## 低优先级

- [ ] E2E（Playwright / Cypress）
- [ ] Husky + lint-staged + commitlint
- [ ] openapi 自动生成 TS 类型
- [ ] 微前端（qiankun / wujie）
- [ ] 权限矩阵可视化配置页
- [ ] 路由缓存策略细化（keep-alive 与 `noCache` 联动已基本完成，更多边界 case 可优化）

## 已发现的小问题

- SidebarItem 的 `resolvePath` 在深层嵌套时可能拼错路径；若菜单结构不规则，改成后端 `path` 直接使用
- 标签页右键菜单目前只有"关闭其他"；完整版需配合 `el-dropdown` 实现多选项
```

- [ ] **Step 3: Verify README renders**

Open `README.md` and visually inspect.
Expected: well-formatted, all sections present.

- [ ] **Step 4: Final pass — typecheck + test + build**

Run:
```bash
pnpm typecheck && pnpm test && pnpm build:prod
```
Expected: all green.

---

## Done

You have built and verified the biscuit-guide admin console end-to-end. The plan is complete. Any deviation (e.g., backend interface name mismatch) should be resolved by adjusting the file at the location called out in `docs/KNOWN_TODOS.md`.
