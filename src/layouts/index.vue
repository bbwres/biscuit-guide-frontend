<template>
  <el-container class="layout">
    <Sidebar />
    <el-container
      class="layout-inner"
      direction="vertical"
    >
      <Navbar />
      <AppMain />
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import AppMain from './components/AppMain.vue'
</script>

<style scoped>
.layout { height: 100vh; }
.layout-inner { flex: 1; height: 100%; }
</style>
