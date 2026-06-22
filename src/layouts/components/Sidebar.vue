<template>
  <el-aside
    :width="appStore.sidebarCollapsed ? '64px' : '220px'"
    class="sidebar"
  >
    <div class="logo">
      {{ appStore.sidebarCollapsed ? 'BG' : t('layout.dashboard') }}
    </div>
    <el-menu
      :default-active="route.path"
      :collapse="appStore.sidebarCollapsed"
      :unique-opened="true"
      background-color="#001529"
      text-color="#cfd3dc"
      active-text-color="#409eff"
      router
    >
      <template
        v-for="m in permStore.sidebarMenus"
        :key="m.id"
      >
        <SidebarItem :item="m" />
      </template>
    </el-menu>
  </el-aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const { t } = useI18n()
console.log('sidebar i18n ready', t)
const appStore = useAppStore()
const permStore = usePermissionStore()
</script>

<style scoped>
.sidebar { background: #001529; transition: width 0.2s; height: 100vh; overflow: auto; }
.sidebar :deep(.el-menu) { border: 0; }
.logo { height: 56px; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; background: #002140; }
</style>
