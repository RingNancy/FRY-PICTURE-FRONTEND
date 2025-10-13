<template>
  <div id="pictureInfoLayout">
    <a-layout style="min-height: 100vh">
      <!-- 顶部导航栏 -->
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <!-- 主体内容区域 -->
      <a-layout class="main-layout">
        <!-- 左侧侧边栏 -->
        <a-layout-sider
          class="sidebar"
          :width="240"
          :collapsed="sidebarCollapsed"
          :trigger="null"
          collapsible
        >
          <div class="sidebar-content">
            <!-- 侧边栏内容插槽 -->
            <slot name="sidebar">
              <SidebarInfo
                :picture-id="sidebarPictureId"
                @edit="handleSidebarEdit"
                @download="handleSidebarDownload"
                @delete="handleSidebarDelete"
                @update:collapsed="handleSidebarCollapse"
              />
            </slot>
          </div>
        </a-layout-sider>

        <!-- 右侧内容区域 -->
        <a-layout-content class="content">
          <!-- 页面内容插槽 -->
          <slot>
            <RouterView />
          </slot>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import GlobalHeader from '@/components/GlobalHeader.vue'
import SidebarInfo from '@/components/SidebarInfo.vue'
import { message } from 'ant-design-vue'
import { editPictureUsingPost } from '@/api/pictureController'

// 侧边栏状态
const sidebarCollapsed = ref(false)

// 侧边栏图片ID
const sidebarPictureId = ref<string | null>(null)

// 获取路由实例
const route = useRoute()

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      // 直接使用字符串类型的ID，避免数字转换导致的精度丢失
      const id = typeof newId === 'string' ? newId : String(newId)
      sidebarPictureId.value = id
    } else {
      sidebarPictureId.value = null
    }
  },
  { immediate: true },
)

// 处理侧边栏编辑操作
const handleSidebarEdit = () => {
  message.info('编辑图片信息')
  // 这里可以添加编辑逻辑
}

// 处理侧边栏下载操作
const handleSidebarDownload = () => {
  message.success('开始下载图片')
  // 这里可以添加下载逻辑
}

// 处理侧边栏删除操作
const handleSidebarDelete = () => {
  message.warning('确认删除图片？')
  // 这里可以添加删除确认逻辑
}

// 处理侧边栏完全折叠状态
const handleSidebarCollapse = (collapsed: boolean) => {
  sidebarCollapsed.value = collapsed
}
</script>

<style scoped>
#pictureInfoLayout {
  min-height: 100vh;
}

/* 顶部导航栏样式 */
#pictureInfoLayout .header {
  padding-inline: 0px;
  color: unset;
  background: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #f0f0f0;
}

/* 主体布局 */
#pictureInfoLayout .main-layout {
  margin-top: 64px; /* 为固定头部留出空间 */
  min-height: calc(100vh - 64px);
}

/* 左侧侧边栏样式 */
#pictureInfoLayout .sidebar {
  background: #fafafa;
  border-right: 1px solid #e8e8e8;
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 0;
  z-index: 998;
  transition: all 0.2s ease;
}

#pictureInfoLayout .sidebar-content {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

#pictureInfoLayout .sidebar-placeholder {
  text-align: center;
  color: #666;
  padding: 20px 0;
}

#pictureInfoLayout .sidebar-placeholder h3 {
  margin-bottom: 8px;
  color: #333;
}

#pictureInfoLayout .sidebar-placeholder p {
  font-size: 12px;
  line-height: 1.5;
}

/* 右侧内容区域样式 */
#pictureInfoLayout .content {
  margin-left: 240px;
  /* background: #f0f2f5; */
  min-height: calc(100vh - 64px);
  transition: margin-left 0.2s ease;
  padding: 24px;
}

/* 侧边栏折叠时的样式调整 */
#pictureInfoLayout .sidebar.ant-layout-sider-collapsed {
  width: 80px !important;
}

#pictureInfoLayout .sidebar.ant-layout-sider-collapsed + .content {
  margin-left: 80px;
}

#pictureInfoLayout .sidebar.ant-layout-sider-collapsed .sidebar-content {
  padding: 8px;
}

#pictureInfoLayout .sidebar.ant-layout-sider-collapsed .sidebar-placeholder {
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #pictureInfoLayout .sidebar {
    position: fixed;
    top: 64px;
    bottom: 0;
    z-index: 1000;
  }

  #pictureInfoLayout .content {
    margin-left: 0;
    padding: 16px;
  }
}
</style>
