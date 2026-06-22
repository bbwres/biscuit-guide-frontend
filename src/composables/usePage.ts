import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination'

export interface PageState<T, Q> {
  query: Q
  data: T[]
  total: number
  current: number
  size: number
  loading: boolean
}

/**
 * 把搜索条件里的"空值"剔掉，避免给后端拼出 `name = ''` 这种永远不命中的条件。
 *
 * 空值判定：
 *   - `null` / `undefined`
 *   - 空字符串、纯空白字符串（用户清空输入框留下的）
 *   - 长度为 0 的数组（multiple 选择器清空后）
 * 注意：`0` / `false` 是合法值，不剔除。
 */
function stripEmpty<Q extends Record<string, any>>(query: Q): Partial<Q> {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(query)) {
    if (v === null || v === undefined) continue
    if (typeof v === 'string' && v.trim() === '') continue
    if (Array.isArray(v) && v.length === 0) continue
    out[k] = v
  }
  return out as Partial<Q>
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
      // 后端 Page<R, Q> 的查询条件字段名叫 `query`（见 cn.bbwres.biscuit.dto.Page），
      // 不是 `entity`；这里 key 必须与之对齐，否则 Jackson 会丢字段、后端 mapper
      // 拿到的 reqVO.getQuery() 永远为 null，所有搜索条件失效。
      const resp = await fetchApi({
        current: state.current,
        size: state.size,
        query: stripEmpty(state.query as Record<string, any>)
      })
      state.data = resp.records as any
      state.total = resp.total
    } catch (e: any) {
      ElMessage.error(e?.message || '查询失败')
    } finally {
      state.loading = false
    }
  }

  function reset() {
    state.query = defaultQuery() as any
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
