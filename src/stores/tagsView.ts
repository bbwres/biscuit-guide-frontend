import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'
import { staticRoutes } from '@/router/routes'

interface TagItem {
  path: string
  fullPath: string
  name?: string
  title: string
  affix?: boolean
}

/** 从静态路由中提取 affix=true 的标签，作为固定标签初始化 */
function initAffixTags(): TagItem[] {
  const tags: TagItem[] = []
  for (const route of staticRoutes) {
    if (route.children) {
      for (const child of route.children) {
        if (child.meta?.affix) {
          tags.push({
            path: `/${child.path}`,
            fullPath: `/${child.path}`,
            name: child.name as string,
            title: (child.meta?.title as string) || (child.name as string),
            affix: true
          })
        }
      }
    }
  }
  return tags
}

/** 合并 affix 标签：保证持久化后的 visitedViews 仍包含所有 affix（防止 affix 配置变更后老缓存把它丢了） */
function mergeAffixTags(persisted: TagItem[]): TagItem[] {
  const affix = initAffixTags()
  const merged = [...affix]
  for (const tag of persisted) {
    if (tag.affix) continue // affix 已加入
    if (merged.some((v) => v.path === tag.path)) continue // 去重
    merged.push(tag)
  }
  return merged
}

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: initAffixTags(),
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
        title,
        affix: route.meta?.affix as boolean
      })
      // cachedViews 必须去重，否则同一路由多次访问会被重复 push
      if (route.meta?.keepAlive !== false && route.name) {
        const name = route.name as string
        if (!this.cachedViews.includes(name)) {
          this.cachedViews.push(name)
        }
      }
    },
    removeView(path: string) {
      // 先取出 view 再 splice，避免删除后再查找导致 cachedViews 永不清理
      const view = this.visitedViews.find((v) => v.path === path)
      const idx = this.visitedViews.findIndex((v) => v.path === path)
      if (idx >= 0) this.visitedViews.splice(idx, 1)
      if (view?.name) {
        const ci = this.cachedViews.indexOf(view.name)
        if (ci >= 0) this.cachedViews.splice(ci, 1)
      }
    },
    removeOthers(path: string) {
      const keep = this.visitedViews.find((v) => v.path === path)
      this.visitedViews = this.visitedViews.filter((v) => v.path === path || v.affix)
      // cachedViews 同步收敛：仅保留 affix + 当前被保留的那一个
      this.cachedViews = this.visitedViews
        .filter((v) => v.name)
        .map((v) => v.name as string)
        .filter((n) => keep?.name === n || this.visitedViews.find((v) => v.affix && v.name === n))
    },
    removeAll() {
      this.visitedViews = this.visitedViews.filter((v) => v.affix)
      this.cachedViews = this.visitedViews.filter((v) => v.name).map((v) => v.name as string)
    },
    /** 用户登出时清空 */
    reset() {
      this.visitedViews = initAffixTags()
      this.cachedViews = []
    }
  },
  persist: {
    pick: ['visitedViews'],
    // cachedViews 故意不持久化：组件实例随刷新重建，缓存 name 留在 store 里也命不中，反而误导
    afterHydrate(ctx) {
      const store = ctx.store as ReturnType<typeof useTagsViewStore>
      // 持久化恢复后，把 affix 标签合并进来（防止 affix 配置改了但老 storage 里没有）
      store.visitedViews = mergeAffixTags(store.visitedViews)
    }
  }
})
