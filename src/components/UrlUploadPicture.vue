<template>
  <div class="url-picture-upload">
    <a-input-group compact style="margin-bottom: 16px">
      <a-input
        v-model:value="fileUrl"
        style="width: calc(100% - 120px)"
        placeholder="请输入图片 URL"
      />
      <a-button type="primary" :loading="loading" @click="handleAction" style="width: 120px">
        {{ mode === 'parse' ? '解析' : '提交' }}
      </a-button>
    </a-input-group>
    <!-- 移除这里的图片显示，让父组件处理 -->
  </div>
</template>

<script setup lang="ts">
import { uploadPictureByUrlUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { ref } from 'vue'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (newPicture: API.PictureVO) => void
  mode?: 'upload' | 'parse' // 新增mode属性，用于区分是上传还是解析
}
const props = defineProps<Props>()
const loading = ref<boolean>(false)
const fileUrl = ref<string>()
const previewUrl = ref<string>()

/**
 * 根据模式执行不同操作
 */
const handleAction = () => {
  if (props.mode === 'parse') {
    handleParse()
  } else {
    handleUpload()
  }
}

/**
 * 解析图片URL（仅预览）
 */
const handleParse = () => {
  if (!fileUrl.value) {
    message.warning('请输入图片URL')
    return
  }
  
  // 简单验证URL格式
  try {
    new URL(fileUrl.value)
  } catch (e) {
    message.warning('请输入有效的URL')
    return
  }
  
  // 设置预览URL
  previewUrl.value = fileUrl.value
  
  // 创建临时图片对象用于预览
  const tempPicture: API.PictureVO = {
    url: fileUrl.value
  }
  
  // 将图片信息传递给父组件
  props.onSuccess?.(tempPicture)
  
  message.success('图片解析成功')
}

/**
 * 上传图片（保存到服务器）
 */
const handleUpload = async () => {
  if (!fileUrl.value) {
    message.warning('请输入图片URL')
    return
  }
  
  loading.value = true
  try {
    const params: API.PictureUploadRequest = { fileUrl: fileUrl.value }
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>