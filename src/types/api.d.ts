// 后端标准响应
export interface Result<T> {
  resultCode: string
  resultMsg: string
  data: T
}

// 分页响应（与后端 cn.bbwres.biscuit.dto.Page<R, Q> 对齐）
export interface PageResp<E> {
  records: E[]
  total: number
  size: number
  current: number
}

// 分页请求体（POST /page 形式）
// 与后端 cn.bbwres.biscuit.dto.Page<R, Q> 对齐：查询条件字段叫 `query`，
// 字段名一旦改成 `entity` Jackson 会丢字段、后端 reqVO.getQuery() 为 null。
export interface PageReq<Q> {
  query: Q
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
