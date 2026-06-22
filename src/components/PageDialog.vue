<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width || '560px'"
    :close-on-click-modal="false"
    @closed="emit('closed')"
  >
    <slot />
    <template #footer>
      <el-button @click="visible = false">
        {{ t('common.cancel') }}
      </el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="emit('submit')"
      >
        {{ t('common.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
console.log('page-dialog i18n ready', t)
const props = defineProps<{ modelValue: boolean; title: string; loading?: boolean; width?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'submit'): void; (e: 'closed'): void }>()
const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
</script>
