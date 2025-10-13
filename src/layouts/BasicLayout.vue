<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <RouterView />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href=""> FRY | Crazy House </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
</script>

<style scoped>
#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  text-align: center;
}

#basicLayout .content {
  background: #f0f2f5;
  padding: 20px;
  margin-top: 80px; /* 为固定头部留出空间 */
  min-height: calc(100vh - 140px); /* 减去头部和页脚的高度 */
}

#basicLayout .header {
  padding-inline: 0px;
  color: unset;
  background: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  width: 100%;
}
</style>
