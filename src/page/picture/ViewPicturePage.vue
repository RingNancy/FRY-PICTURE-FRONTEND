<template>
  <div class="image-container">
    <img :src="picture.url" alt="图片预览" class="image-preview" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getPictureVoByIdUsingGet } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'

const props = defineProps<{
  id: string | number
}>()

const picture = ref<API.PictureVO>({})

// 获取图片详情
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败：' + e.message)
  }
}

onMounted(() => {
  fetchPictureDetail()
})
</script>

<style scoped>
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 500px;
  background-color: #f5f5f5;
  padding: 20px;
  box-sizing: border-box;
}

.image-preview {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background-color: white;
  padding: 10px;
}
</style>
