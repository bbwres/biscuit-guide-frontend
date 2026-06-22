<template>
  <div class="placeholder">
    <el-card>
      <el-empty :description="`「${title}」页面正在开发中`">
        <template #image>
          <el-icon
            :size="64"
            color="#909399"
          >
            <Tools />
          </el-icon>
        </template>
        <div class="hint">
          <p>componentName: <code>{{ name || '—' }}</code></p>
          <p>apiUrl: <code>{{ apiUrl || '—' }}</code></p>
        </div>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => (route.meta?.title as string) || (route.name as string) || route.path)
const name = computed(() => route.meta?.componentName as string | undefined)
const apiUrl = computed(() => route.meta?.apiUrl as string | undefined)
</script>

<style scoped>
.placeholder { padding: 24px; }
.hint { color: #909399; font-size: 13px; }
.hint code { background: #f5f7fa; padding: 2px 6px; border-radius: 3px; }
</style>
