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

设计文档：`docs/superpowers/specs/2026-06-10-biscuit-guide-admin-console-design.md`

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
- 业务页面路由注册（目前仅 Login + Dashboard 在静态路由；其他页面通过后端 `userMenu/tree` 动态注入）

## 许可

内部项目。
