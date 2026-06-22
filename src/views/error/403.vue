<template>
  <div class="error-page">
    <el-result
      icon="error"
      title="403"
      sub-title="无权访问"
    >
      <template #extra>
        <el-button
          type="primary"
          @click="$router.push('/')"
        >
          返回首页
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.error-page { display: flex; align-items: center; justify-content: center; height: 60vh; }
</style>
