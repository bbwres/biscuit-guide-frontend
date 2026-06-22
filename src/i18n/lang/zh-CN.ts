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
