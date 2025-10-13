<template>
  <div id="app">
    <component :is="currentLayout">
      <RouterView />
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BasicLayout from './layouts/BasicLayout.vue'
import PictureInfoLayout from './layouts/PictureInfoLayout.vue'
import { healthUsingGet } from './api/mainController'

// 健康检查
healthUsingGet().then((res) => {
  console.log(res)
})

// 获取当前路由
const route = useRoute()

// 根据路由动态选择布局
const currentLayout = computed(() => {
  // 如果路径包含 /picture，使用 PictureInfoLayout
  if (route.path.includes('/view_picture')) {
    return PictureInfoLayout
  }
  // 默认使用 BasicLayout
  return BasicLayout
})
</script>

<style scoped>
#app {
}
</style>
