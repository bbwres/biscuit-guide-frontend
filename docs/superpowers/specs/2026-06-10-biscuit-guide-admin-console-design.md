# biscuit-guide 前端工程 — 设计规格

- **日期**：2026-06-10
- **作者**：通过 brainstorming 流程生成
- **状态**：待用户确认

## 1. 背景与目标

为 `biscuit-guide` 后端工程（Spring Cloud 微服务）构建一套**完整的管理控制台前端**。后端包含两个业务服务（`auth`、`basic`）和一个网关（端口 `28000`），使用 Knife4j 在 `/doc.html` 聚合所有 OpenAPI 文档。本次前端首期即对接**全部 controller**，做到端到端可用。

## 2. 范围与非目标

### 范围内
- 登录 / 登出 / 用户信息拉取
- Auth 服务全部 5 个 controller：登录账户、角色、菜单、用户菜单、OAuth 客户端
- Basic 服务全部 3 个 controller：文件管理、文件业务、临时文件
- 后端约定的标准 CRUD 操作（page / getById / add / edit / editStatus / delete 等）
- 经典 admin 布局：侧边栏 + 顶栏 + 多页签 + 面包屑
- 中英双语切换
- 按钮级权限（基于后端下发的 `permissions`）
- dev / sit / prod 三套环境

### 非目标（明确不做）
- E2E 测试（Playwright / Cypress）— 后续阶段引入
- Husky / lint-staged / commitlint
- 暗色主题
- 字典中心（dict）— 留 composable 位点
- openapi 自动生成类型 — 留接入点（`scripts/generate-types.ts` 占位）
- 微前端 / 多包管理
- Docker 镜像构建脚本（仅产出 `dist/`，由运维侧打包）

## 3. 技术选型

| 类别 | 选型 | 理由 |
|---|---|---|
| 框架 | Vue 3 + `<script setup>` | SFC 简洁、组合式 API、官方主推 |
| 语言 | TypeScript 5.x | 后端有 VO 类型，前端类型对齐减少返工 |
| 构建 | Vite 6 | 启动快、原生 ESM、Vue 官方推荐 |
| 路由 | Vue Router 4 | 动态路由必需 |
| 状态 | Pinia 2 + `pinia-plugin-persistedstate` | Vue 3 官方推荐；按 store 粒度选择持久化 |
| UI | Element Plus 2 + `@element-plus/icons-vue` | 用户指定；组件齐全 |
| HTTP | Axios | 生态主流；拦截器可定制度高 |
| i18n | vue-i18n 9 | Element Plus locale 联动 |
| 时间 | dayjs | 体积小、API 友好 |
| 进度条 | nprogress | 路由切换反馈 |
| Token | js-cookie | 比 localStorage 抗 XSS 略强 |
| 类型检查 | `vue-tsc` | 入口级类型校验 |
| 代码规范 | ESLint 9 + Prettier 3 | 不接 husky，手动 `pnpm lint` / `pnpm format` |
| 自动引入 | `unplugin-auto-import` + `unplugin-vue-components` | Vue/Element Plus/工具函数按需 |
| 测试 | Vitest + @vue/test-utils | 单元 + 组件 |
| 包管理 | pnpm | 默认；可在 `package.json` 替换为 npm/yarn |

**Node 要求**：≥ 20.x。

## 4. 架构

### 4.1 目录组织（方案 A：经典分层 + 按业务模块聚合）

```
biscuit-guide-frontend/
├── .env / .env.development / .env.sit / .env.production
├── .eslintrc / .prettierrc / .editorconfig / .gitignore
├── index.html
├── package.json
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts
├── README.md
├── public/
│   └── favicon.ico
└── src/
    ├── main.ts
    ├── App.vue
    ├── api/
    │   ├── auth/
    │   │   ├── loginAccount.ts
    │   │   ├── role.ts
    │   │   ├── menu.ts
    │   │   ├── userMenu.ts
    │   │   └── oauthClient.ts
    │   ├── basic/
    │   │   ├── fileInfo.ts
    │   │   ├── fileBusiness.ts
    │   │   └── tempFile.ts
    │   └── system/
    │       ├── login.ts
    │       └── user.ts
    ├── views/
    │   ├── login/index.vue
    │   ├── error/404.vue、403.vue
    │   ├── auth/
    │   │   ├── loginAccount/
    │   │   │   ├── index.vue
    │   │   │   └── AssignRoleDialog.vue
    │   │   ├── role/
    │   │   │   ├── index.vue
    │   │   │   └── AssignMenuDialog.vue
    │   │   ├── menu/index.vue
    │   │   └── oauthClient/index.vue
    │   └── basic/
    │       ├── fileInfo/index.vue
    │       ├── fileBusiness/index.vue
    │       └── tempFile/index.vue
    ├── router/
    │   ├── index.ts
    │   ├── routes.ts        # 静态路由
    │   └── dynamic.ts       # 动态路由生成
    ├── stores/
    │   ├── user.ts
    │   ├── permission.ts
    │   ├── app.ts
    │   └── tagsView.ts
    ├── layouts/
    │   ├── index.vue
    │   └── components/
    │       ├── Sidebar.vue
    │       ├── Navbar.vue
    │       ├── AppMain.vue
    │       ├── TagsView.vue
    │       ├── Breadcrumb.vue
    │       └── UserDropdown.vue
    ├── components/
    │   ├── PageSearch.vue
    │   ├── PageTable.vue
    │   ├── PageDialog.vue
    │   └── SvgIcon.vue
    ├── composables/
    │   ├── usePage.ts
    │   ├── useCrud.ts
    │   └── useDict.ts
    ├── directives/
    │   ├── permission.ts
    │   └── copy.ts
    ├── utils/
    │   ├── request.ts
    │   ├── auth.ts
    │   ├── menu.ts
    │   ├── i18n.ts
    │   └── validate.ts
    ├── i18n/
    │   ├── index.ts
    │   ├── lang/
    │   │   ├── zh-CN.ts
    │   │   └── en-US.ts
    │   └── modules/
    │       ├── auth.ts
    │       ├── common.ts
    │       └── ...
    ├── types/
    │   ├── api.d.ts
    │   ├── auth.d.ts
    │   └── basic.d.ts
    ├── styles/
    │   ├── index.scss
    │   ├── variables.scss
    │   ├── element.scss
    │   └── transition.scss
    └── assets/
        ├── logo.svg
        └── icons/
```

**模块边界原则**：
- 一个后端 controller 对应一个 `api/<service>/<entity>.ts` + 一个 `views/<service>/<entity>/index.vue`（必要时含子组件）
- 后端新增模块时，新增对应文件夹，不动其它
- 通用业务组件（PageTable / PageDialog / PageSearch）只放在 `components/`，不复制到业务目录下

### 4.2 路由

**静态路由**（无需登录）：
- `/login` → `views/login/index.vue`
- `/403` → `views/error/403.vue`
- `/404` → `views/error/404.vue`
- `/` → 重定向到 `/dashboard`（dashboard 是个简单欢迎页）
- 通配 `/:pathMatch(.*)*` → 404

**动态路由**（登录后注入）：
- 用户登录后调用 `/auth/userMenu` 拉取菜单树
- `permissionStore` 将菜单转为 Vue Router 路由树，调用 `router.addRoute()` 注入
- 同步生成侧边栏菜单（i18n 标题 + 图标）
- `beforeEach` 守卫：
  - 有 token 但无 userInfo → 拉一次 userInfo
  - 无 token → 白名单（login/403/404）放行，其余 → `/login?redirect=...`
  - 有 token 但访问 `/login` → 重定向到 `/`

### 4.3 状态管理

| Store | 关键 state | 持久化 |
|---|---|---|
| `useUserStore` | `token`、`userInfo`、`roles`、`permissions` | token 用 cookie；userInfo sessionStorage |
| `usePermissionStore` | `dynamicRoutes`、`sidebarMenus` | 否 |
| `useAppStore` | `sidebarCollapsed`、`locale`、`size` | localStorage（persistedstate） |
| `useTagsViewStore` | `visitedViews`、`cachedViews` | 否 |

### 4.4 Layout 行为

- **侧边栏**：手风琴（同时只展开一个父菜单）；可折叠（折叠时仅图标）
- **顶栏**：面包屑 / 刷新当前页 / 全屏 / 用户下拉（个人中心、切换语言、退出登录）
- **TagsView**：右键菜单（关闭当前 / 关闭其他 / 关闭全部 / 刷新 / 固定）；keep-alive 与 `route.meta.noCache` 联动
- **菜单图标**：`meta.icon` 为 `el-icon-*` 字符串；本地 svg 走 `SvgIcon` 组件

### 4.5 通用组件 API

```vue
<PageTable
  :columns="columns"
  :fetch-api="listLoginAccount"
  :search-schema="searchSchema"
  v-model:query="query"
  row-key="id"
>
  <template #toolbar>
    <el-button v-permission="['loginAccount:add']" @click="onAdd">新增</el-button>
  </template>
  <template #actions="{ row }">
    <el-button v-permission="['loginAccount:edit']" @click="onEdit(row)">编辑</el-button>
  </template>
</PageTable>
```

`usePage` composable 提供 `{ query, data, total, loading, search, reset, refresh }`。
`useCrud` 组合 `usePage` + `add/edit/remove` 三个写操作。

### 4.6 权限指令

```ts
v-permission="['role:add']"            // 数组：任一命中即显示
v-permission:or="['role:add']"         // 同上，语义清晰版
v-permission:and="['role:add','role:edit']"  // 全部命中
```
- 命中：渲染；未命中：移除 DOM 节点
- 权限数据从 `userStore.permissions`（`userMenu` 返回的按钮码）取
- 页面级权限：路由 `meta.permission` 数组；守卫在 `beforeEach` 校验

## 5. HTTP 层

### 5.1 通用类型

```ts
// types/api.d.ts
export interface Result<T> {
  resultCode: string
  resultMsg: string
  data: T
}

export interface PageResp<E, R> {
  records: E[]
  total: number
  size: number
  current: number
  search?: R
}

export type CommonStatus = 'NORMAL' | 'DISABLED' | 'ENABLED'
```

> 分页响应字段会在写代码时以 `cn.bbwres.biscuit.dto.Page` 实际结构为准；如有出入会同步调整。

### 5.2 Axios 实例（utils/request.ts）

- `baseURL = import.meta.env.VITE_API_BASE_URL`
- `timeout = 15000`
- 请求拦截器：
  - 从 cookie 读 token → `Authorization: Bearer <token>`
  - POST 默认 `application/json`
  - 提供 `request.postForm(url, params)` 走 `application/x-www-form-urlencoded`（登录用）
  - 提供 `request.upload(url, formData)` 不设 `Content-Type`（让浏览器自动 boundary）
  - 提供 `request.download(url, params)` 走 `responseType: 'blob'`
- 响应拦截器：
  - HTTP 200 + `resultCode === '000000'` → 解包返回 `data`
  - `resultCode === '401xxx'` → 清 token + 跳 `/login`
  - 其它业务错误 → `ElMessage.error(resultMsg)`，返回 rejected Promise
  - HTTP 非 200 → `ElMessage.error('网络异常')`
- 业务成功码：先假设 `000000`，写代码前再确认 `cn.bbwres.biscuit.dto.Result` 的成功码定义

### 5.3 登录流程（OAuth2 password 模式，无验证码）

1. 用户在登录页输入 `username` + `password`
2. `POST /auth/oauth2/token`，body（form）：
   - `grant_type=password`
   - `username=<input>`
   - `password=<input>`
   - `client_id=<default>`（先固定 `biscuit-guide-admin`，需要时可从 .env 注入）
   - `client_secret=<default>`
3. 拿到 `access_token` → `setToken()` 写入 cookie（path=/, expires=7d）
4. 调 `/auth/loginAccount/getById` 拉用户基本信息
5. 调 `/auth/userMenu/...`（按后端实际接口）拉菜单与权限
6. 跳 `?redirect` 或 `/`

## 6. 环境与构建

### 6.1 环境变量

| 文件 | 关键变量 |
|---|---|
| `.env` | `VITE_APP_TITLE=biscuit-guide` |
| `.env.development` | `VITE_API_BASE_URL=/api`（vite proxy 转发到 `http://localhost:28000`） |
| `.env.sit` | `VITE_API_BASE_URL=https://sit-gateway.example.com` |
| `.env.production` | `VITE_API_BASE_URL=https://api.example.com` |

### 6.2 Vite Proxy（dev）

```ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:28000',
      changeOrigin: true,
      rewrite: (p) => p.replace(/^\/api/, '')
    }
  }
}
```

前端代码中所有接口都写相对路径 `/auth/...`、`/basic/...`，最终命中网关的 `Path=/auth/**`、`/basic/**` 规则。

### 6.3 构建脚本

```json
{
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
  }
}
```

## 7. 测试与验收

### 7.1 测试策略

| 层级 | 工具 | 范围 | 目标 |
|---|---|---|---|
| 单元 | Vitest | utils、stores、composables、directives、request 拦截器、菜单→路由转换 | 关键纯函数 ≥ 80% |
| 组件 | Vitest + @vue/test-utils | PageTable、PageDialog、PageSearch、useCrud | 关键组件 smoke |
| 类型 | `vue-tsc --noEmit` | 全量 | 0 error |
| E2E | — | 本期不引入 | — |

### 7.2 手动冒烟（必须全过）

1. `pnpm install` 成功，无致命警告
2. `pnpm dev` → `http://localhost:5173` 自动跳 `/login`
3. 输入账号密码 → 因后端未起，**预期看到友好错误提示**（非白屏 / 未捕获异常）
4. 控制台无 error 级别报错，无 404 资源
5. `pnpm typecheck` 0 error
6. `pnpm lint` 0 error
7. `pnpm build:prod` 成功，输出 `dist/`
8. 主要路由占位：登录、403、404、5 个 auth 页、3 个 basic 页、layout 主页
9. 切换 zh-CN / en-US 顶栏与侧边栏文案随之切换
10. 折叠/展开侧边栏正常、tags-view 增删正常
11. 后端启动后（用户提供），至少走通 `登录 → 拉用户信息 → 渲染菜单 → 访问账户列表 → 新增/编辑/启停/重置密码`

### 7.3 交付物

- 完整源码（含 `.env.*` 模板）
- `README.md`（项目说明、目录结构、本地启动、环境变量、构建命令、对接后端注意事项、扩展点）
- `dist/`（首次 build 产物）
- "已知未做事项"清单（E2E、字典、暗色主题、openapi 自动化等）

## 8. 风险与开放问题

| 风险 | 应对 |
|---|---|
| `Result` 成功码不是 `000000` | 写代码前到 `cn.bbwres.biscuit.dto.Result` 确认；不一致时改 `request.ts` 一处 |
| `Page` 响应字段与假设不符 | 同上，在 `types/api.d.ts` 调整；影响所有 `usePage` 调用方 |
| `userMenu` 接口具体路径 / 响应结构未知 | 写代码时以 `biscuit-auth-server` 中 `UserMenuController` 的 `swagger` 注解为准；先按 `List<MenuRespVO>` 处理，不对再调 |
| 文件上传 / 下载后端参数形式 | 写代码时按 `FileInfoController` 实际签名实现；不一致时调整 `request.upload` |
| 业务字段命名（中英下划线 vs 驼峰） | 假设后端响应已是驼峰（Java 默认），如发现下划线，统一在 axios `transformResponse` 转驼峰 |
| 后端 OAuth2 client_id / client_secret 默认值 | 写代码时在 `application.yaml` / `bootstrap.yaml` 找不到时在 README 标注"待运维提供默认值" |

## 9. 后续扩展点

- openapi 自动生成 TS 类型（`scripts/generate-types.ts` 占位 + `openapi-typescript-codegen`）
- 字典中心（useDict composable 已留位）
- 暗色主题（覆盖 Element Plus CSS 变量）
- E2E（Playwright）
- 微前端（qiankun / wujie）
- 权限矩阵可视化配置页
