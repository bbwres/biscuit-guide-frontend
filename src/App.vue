<template>
  <el-config-provider :locale="elLocale">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useAppStore } from '@/stores/app'
import { computed } from 'vue'

// 跟随 i18n 切换 Element Plus 的语言；el-config-provider + ElConfigProvider 通过 unplugin 自动注册
const appStore = useAppStore()
const elLocale = computed(() => (appStore.locale === 'en-US' ? undefined : zhCn))
</script>
