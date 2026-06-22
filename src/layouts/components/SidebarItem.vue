<template>
  <template v-if="item.children && item.children.length > 0 && item.children[0].menuType !== 'BUTTON'">
    <el-sub-menu :index="parentIndex(item)">
      <template #title>
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.name }}</span>
      </template>
      <SidebarItem
        v-for="c in item.children"
        :key="c.id"
        :item="c"
      />
    </el-sub-menu>
  </template>
  <template v-else>
    <el-menu-item :index="leafIndex(item)">
      <el-icon v-if="item.icon">
        <component :is="item.icon" />
      </el-icon>
      <template #title>
        {{ item.name }}
      </template>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import type { MenuNode } from '@/utils/menu'
import { componentNameToPath } from '@/router/menuComponentMap'

// `item` 由父组件传，递归渲染自己
defineProps<{ item: MenuNode }>()

// 父菜单（DIR）index：保留 id（父菜单没有 URL，仅作 el-sub-menu 的标识）
const parentIndex = (n: MenuNode) => `p-${n.id}`

// 叶子菜单 index：kebab-case componentName（如 /login-account），缺失时 fallback 到 id
const leafIndex = (n: MenuNode) => `/${componentNameToPath(n.componentName, n.id)}`
</script>
