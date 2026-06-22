<template>
  <div class="dashboard">
    <el-card>
      <h2>{{ t('dashboard.welcome') }}</h2>
      <p>{{ t('dashboard.hint') }}</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
console.log('dashboard i18n ready', t)
</script>
