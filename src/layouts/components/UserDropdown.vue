<template>
  <el-dropdown @command="onCommand">
    <span class="user-trigger">
      <el-icon><UserFilled /></el-icon>
      {{ userStore.userInfo?.userName || 'user' }}
      <el-icon><ArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="profile">
          {{ t('layout.profile') }}
        </el-dropdown-item>
        <el-dropdown-item command="lang">
          {{ t('layout.switchLanguage') }}
        </el-dropdown-item>
        <el-dropdown-item
          command="logout"
          divided
        >
          {{ t('layout.logout') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useTagsViewStore } from '@/stores/tagsView'
import { logout } from '@/api/system/login'

const { t, locale } = useI18n()
console.log('user-dropdown i18n ready', t)
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const tagsStore = useTagsViewStore()

async function onCommand(cmd: string) {
  if (cmd === 'profile') {
    ElMessage.info(t('layout.profile'))
  } else if (cmd === 'lang') {
    const next = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
    locale.value = next
    appStore.setLocale(next as any)
  } else if (cmd === 'logout') {
    // 先调后端 revoke（带 token 告诉后端作废），再清本地
    try { await logout() } catch { /* noop */ }
    userStore.reset()
    tagsStore.reset()
    router.push('/login')
  }
}
</script>

<style scoped>
.user-trigger { display: flex; align-items: center; gap: 4px; cursor: pointer; }
</style>
