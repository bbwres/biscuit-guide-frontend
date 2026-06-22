// 后端 MenuRespVO.component 字段（路径字符串）映射到前端 Vue 组件。
//
// 用 Vite 的 import.meta.glob 在构建时把 src/views 下所有 .vue 预注册，
// 运行时按路径查表。后端 SQL 写什么路径就用什么路径（不维护静态字典）。
//
// 关键点：Vite 的 import.meta.glob 不支持 @ 别名，必须是相对路径。
// 本文件位于 src/router/，所以用相对路径 ../views/(任何子目录)/*.vue。
// glob 返回的 key 是相对路径（如 ../views/auth/loginAccount/index.vue），
// 我们在加载时把它标准化成 @/views 形式方便和后端 component 字段直接对得上。
//
// 路径规范化：
//   - 后端写 @/views/auth/loginAccount/index.vue   -> 直接查
//   - 后端写 views/auth/loginAccount/index.vue     -> 自动补 @ 前缀
//   - 后端写空 / 找不到                            -> MenuPlaceholder 占位（不白屏）

import type { Component } from 'vue'

type AsyncCompLoader = () => Promise<{ default: Component }>

// Vite glob 必须是相对路径。从 src/router 出发，../views 指向 src/views
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rawModules = (import.meta as any).glob('../views/**/*.vue') as Record<string, AsyncCompLoader>

// 标准化成 @/views 形式以匹配后端
const viewModules: Record<string, AsyncCompLoader> = {}
for (const [key, loader] of Object.entries(rawModules)) {
  // '../views/auth/loginAccount/index.vue' -> '@/views/auth/loginAccount/index.vue'
  const normalized = key.startsWith('../') ? '@/' + key.slice(3) : key
  viewModules[normalized] = loader
}

// 找不到 componentName 时用的占位页（不空白、不 404）
const placeholderLoader: AsyncCompLoader = () => import('@/views/error/MenuPlaceholder.vue')

// 把后端的 component 字符串解析为 dynamic import loader；找不到走 placeholder
export function resolveComponentByPath(path?: string | null): AsyncCompLoader {
  if (!path) return placeholderLoader
  const normalized = path.startsWith('@/') ? path : `@/${path}`
  const loader = viewModules[normalized]
  if (loader) return loader
  return placeholderLoader
}

// 把 componentName 转为 URL 友好的 kebab-case（PascalCase -> lower-kebab）
export function componentNameToPath(name: string | undefined | null, fallback: string): string {
  if (!name) return fallback
  // LoginAccount -> login-account；FileInfo -> file-info；Role -> role
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}
