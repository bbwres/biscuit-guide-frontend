# 已知未做事项

首版交付时**未完成**的功能 / 风险点，留给后续迭代。

## 高优先级

- [x] **`response 形态不统一（已修复）`**：`src/utils/request.ts` 响应拦截器现在兼容 3 种形态 — 详见下方"实测响应契约"。
- [x] **`OAuth2 login 完整参数（已修复）`**：`src/api/system/login.ts` 加了 `tenant_id=zgip` 和 `scope=openid,dd` 两个必填项。`client_id=1-mp`，`client_secret=zlf`。
- [x] **成功码改为 `"0"`（已修复）**：实测 `resultCode: "0"` 表示成功（1 个字符），不是规格里猜的 `"000000"`。已改。
- [x] **`LoginResp` 加 custom_* claim（已修复）**：`src/types/auth.d.ts` 扩展了 `custom_user_id / custom_tenant_id / custom_zh_name / custom_roles / custom_grant_type`。
- [x] **`getUserInfo` 改用 token claim 拼（已修复）**：原方案是调 `/auth/loginAccount/getById`，但该接口是 admin 端点，传普通用户 id 会返空。改为从 `LoginResp.custom_*` 直接构造 `UserInfo`。
- [x] **`/userMenu/menuTree` 路径修正（已修复）**：原方案写的是 `/auth/userMenu/tree`（双前缀 + 错 action），正确是 `/userMenu/menuTree`。`/userMenu/roleInfo` 也加上了。
- [x] **`getUserRoles` 加 fallback（已修复）**：优先用 `LoginResp.custom_roles`，没有再调 `/userMenu/roleInfo`。

## 中优先级

- [x] **`MenuNode` 字段对齐 `MenuRespVO`（已完成）**：
  - `src/utils/menu.ts` 的 `MenuNode` 现在 1:1 对齐后端 `MenuRespVO`（`id / parentId / name / menuType / menuSort / icon / component / componentName / visible / keepAlive / alwaysShow / apiUrl / apiUrlMethod / status / treePath`）
  - `buildSidebarTree` 用 `name` / `menuSort` 排序
  - `toRouteRecordRaw` 的 path/name 都用 `id` 兜底（snowflake，丑但能跑；后续可加 componentName → component 字典再换可读 URL）
  - `SidebarItem.vue` 同步用 `item.name` / `/${item.id}`
  - 单测扩到 6 个（新增 sort/filter/redirect/meta 三个分支）
- [ ] **`componentName` → 前端 component 映射表（待补）**：
  - 后端 `componentName` 字段是 `"LoginAccount"` 这种字符串名
  - 当前 `toRouteRecordRaw` 把 `node.component`（string）当组件用，**没真用 `componentName`**
  - 下一步：在 `src/router/menuComponentMap.ts` 维护 `Map<componentName, () => import(...)>`，让 `toRouteRecordRaw` 查表
  - 或者干脆把 path 也从 `componentName` 推（`/loginAccount`），URL 会漂亮很多
- [ ] **测试用户没有菜单权限**：`zlf` 用户调 `/userMenu/menuTree` 返回 `100000403 Access Denied`（因为角色 `["1"]` 没分配任何菜单）。需要后端同学在 `t_role_menu` 表里给角色 1 分配菜单才能看到侧边栏。
- [ ] `Page` 响应字段 — 实测后端 page 接口返 `{ records, total, size, current, pages }`，**多了个 `pages` 字段**，**没 `search` 字段**。`src/types/api.d.ts` 的 `PageResp` 假设有 `search` 是错的，目前是 optional 所以不会报错，但前端没用到 search。
- [ ] 分配角色 / 分配菜单的对话框：UI 占位提示，待补完
- [ ] 文件下载功能：仅上传 + 删除 + 列表，待补
- [ ] 业务页面路由：当前 LoginAccount / Role / Menu / OauthClient / FileInfo / FileBusiness / TempFile 等待后端通过 `/userMenu/menuTree` 动态注入；如需本地静态预览，在 `src/router/routes.ts` 手动添加
- [ ] **测试用户没有菜单权限**：`zlf` 用户调 `/userMenu/menuTree` 返回 `100000403 Access Denied`（因为角色 `["1"]` 没分配任何菜单）。需要后端同学在 `t_role_menu` 表里给角色 1 分配菜单才能看到侧边栏。
- [ ] `Page` 响应字段 — 实测后端 page 接口返 `{ records, total, size, current, pages }`，**多了个 `pages` 字段**，**没 `search` 字段**。`src/types/api.d.ts` 的 `PageResp` 假设有 `search` 是错的，目前是 optional 所以不会报错，但前端没用到 search。
- [ ] `code: 500, msg: "fail"` 错误没 data 字段：response 拦截器需要 `data` 字段同时存在才认为是包裹响应。**已加测试**。
- [ ] 分配角色 / 分配菜单的对话框：UI 占位提示，待补完
- [ ] 文件下载功能：仅上传 + 删除 + 列表，待补
- [ ] 业务页面路由：当前 LoginAccount / Role / Menu / OauthClient / FileInfo / FileBusiness / TempFile 等待后端通过 `/userMenu/menuTree` 动态注入；如需本地静态预览，在 `src/router/routes.ts` 手动添加

## 实测响应契约（2026-06-11）

| 端点 | 成功码 | 形态 |
|---|---|---|
| `POST /auth/oauth2/token` | (无包裹) | `{ access_token, refresh_token, custom_user_id, custom_tenant_id, custom_zh_name, custom_roles, custom_grant_type, token_type, expires_in, scope }` |
| `GET /auth/captcha/create` | `code: 200` | `{ code: 200, msg: "OK", data: { id, type, backgroundImage, ... } }` |
| `GET /auth/loginAccount/page` | `resultCode: "0"` | `{ resultCode: "0", resultMsg: "success", data: { records: [...], total, size, current, pages } }` |
| `GET /auth/loginAccount/getById?id=zlf` | `resultCode: "0"` | `{ resultCode: "0", resultMsg: "success" }` （**无 data**，admin 端点） |
| `GET /auth/userMenu/roleInfo` | `resultCode: "0"` | `{ resultCode: "0", resultMsg: "success", data: [{ id, roleCode, roleName, status, ... }] }` （**返 Role[]，不是 string[]**） |
| `GET /auth/userMenu/menuTree` | `resultCode: "0"` | `{ resultCode: "0", resultMsg: "success", data: [{ id, name, menuType: "MENU"\|"BUTTON"\|"API", menuSort, parentId, icon, component, componentName, apiUrl, apiUrlMethod, status: "NORMAL"\|"DISABLED", visible, keepAlive, alwaysShow, ... }] }` |
| 401 错误 | `resultCode: "100000401"` | `{ resultCode: "100000401", resultMsg: "Not Authenticated" }` |
| 403 错误 | `resultCode: "100000403"` | `{ resultCode: "100000403", resultMsg: "Access Denied" }` |
| OAuth2 错误（client 不对） | HTTP 400 | `{ error: "invalid_client" }`（标准 OAuth2 格式） |

**关键成功码是 `"0"`**，已被 `request.ts` 的 `RESULT_SUCCESS_CODES = new Set(['0'])` 识别。

## 关键契约点（实测后定稿）

| 字段 | 实测 |
|---|---|
| `menu_type` 枚举 | `"MENU"` / `"BUTTON"` / `"API"`（大写，**没有** `"dir"`、`"menu"` 小写） |
| 字段命名 | camelCase（`menuType` / `menuSort` / `componentName` / `apiUrl` / `treePath`） |
| `parentId` | 可空（顶级菜单没有父） |
| `status` 枚举 | `"NORMAL"` / `"DISABLED"`（大写） |
| `apiUrl` | 路径模式（如 `"/auth/**"`）或按钮权限码（如 `"loginAccount:add"`）— 视后端录入 |
| 网关路由 | 全部业务端点必须带 `/auth` 或 `/basic` 前缀（网关 `Path=/auth/**` + `StripPrefix=1`） |
| 权限码 | BUTTON 类型菜单的 `apiUrl` 即权限码；登录后前端递归收集后写入 `__PERMISSIONS__` |

**已完成**：
- ✅ `MenuNode.menuType` 改为 `'MENU' | 'BUTTON' | 'API'`
- ✅ `parentId` 可空
- ✅ `buildSidebarTree` status 比较 `String(m.status).toUpperCase() === 'NORMAL'`
- ✅ `getUserRoles` 改返 `RoleInfo[]`（登录页取 `roleCode` 数组）
- ✅ 登录流程调 `getUserMenus` + `collectButtonPermissions` 把按钮 apiUrl 写入 `permissions` → `__PERMISSIONS__`，v-permission 生效
- ✅ 单测 30 个（菜单测试从 6 个扩到 10 个，新增 collectButtonPermissions 3 个）

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
- `useHttp().postForm` 的返回类型在严格模式下需要 `as unknown as Promise<T>` 显式断言（已在 `api/system/login.ts` 处理）
- pnpm 11 严格模式：`pnpm-workspace.yaml` 需要在 `onlyBuiltDependencies` 中显式允许 esbuild / @parcel/watcher / vue-demi 的构建脚本
- ESLint flat config + `vue-eslint-parser` + TypeScript parser 三者组合是当前 Vue 3 项目类型检查 lint 的正确搭配（已配）
