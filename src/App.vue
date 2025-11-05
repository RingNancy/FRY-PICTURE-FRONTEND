<template>
  <a-config-provider :locale="appLocale">
    <div id="app">
      <component :is="currentLayout">
        <RouterView />
      </component>
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BasicLayout from './layouts/BasicLayout.vue'
import PictureInfoLayout from './layouts/PictureInfoLayout.vue'
import { healthUsingGet } from './api/mainController'
import zhCN from 'ant-design-vue/es/locale/zh_CN' // 引入 ant-design-vue 的中文语言包
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 引入 dayjs 的中文语言包

// 设置 dayjs 默认语言为中文
dayjs.locale('zh-cn')

// 使用 Composition API 和 setup 函数定义响应式数据
const appLocale = zhCN // 设置当前应用的语言环境
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
