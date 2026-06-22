<template>
  <el-card class="page-search">
    <el-form
      :model="model"
      inline
      @submit.prevent="onSearch"
    >
      <slot />
      <el-form-item>
        <el-button
          type="primary"
          @click="onSearch"
        >
          {{ t('common.search') }}
        </el-button>
        <el-button @click="onReset">
          {{ t('common.reset') }}
        </el-button>
        <slot name="actions" />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
console.log('page-search i18n ready', t)
const emit = defineEmits<{ (e: 'search'): void; (e: 'reset'): void }>()
const model = defineModel<Record<string, any>>({ required: true })
function onSearch() { emit('search') }
function onReset() { emit('reset') }
</script>

<style scoped>
.page-search { margin-bottom: 12px; }
</style>
