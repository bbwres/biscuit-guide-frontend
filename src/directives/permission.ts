import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

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

function evaluate(el: HTMLElement, binding: DirectiveBinding<string[]>) {
  // 直接从 store 读权限：用户登录时写入，刷新由 pinia-persist 自动恢复，
  // 不依赖任何 window 全局变量（之前的 __PERMISSIONS__ 方案在刷新后是空数组，
  // 兜底"空就放行"导致所有按钮全部显示出来 —— 这是一个权限绕过 bug）。
  const userStore = useUserStore()
  const owned = userStore.permissions || []
  const mode: Mode = (binding.arg as Mode) || 'or'
  if (!checkPermission(binding.value || [], owned, mode)) {
    // 用 display:none 而不是 removeChild：updated 钩子触发时元素还在 DOM 里，
    // 用户权限变化（切换租户/重新登录）时按钮能正确显隐。
    el.style.display = 'none'
  } else {
    el.style.display = ''
  }
}

export const permission: Directive = {
  mounted: evaluate,
  updated: evaluate
}
