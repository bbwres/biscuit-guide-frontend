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
