<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item
      v-for="b in breadcrumbs"
      :key="b.path"
    >
      {{ b.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const breadcrumbs = computed(() => {
  return route.matched.filter((m) => m.meta?.title).map((m) => ({ path: m.path, title: m.meta.title }))
})
</script>
