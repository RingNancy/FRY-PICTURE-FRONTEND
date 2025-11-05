<template>
  <div class="picture-upload">
    <a-upload
      list-type="picture-card"
      :show-upload-list="false"
      :custom-request="handleFileSelect"
      :before-upload="beforeUpload"
    >
      <img v-if="picture?.url || previewUrl" :src="picture?.url || previewUrl" alt="avatar" />
      <div v-else>
        <loading-outlined v-if="loading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击或拖拽上传图片</div>
      </div>
    </a-upload>
  </div>
</template>

<script setup lang="ts">
import { message, type UploadProps } from 'ant-design-vue'
import { ref } from 'vue'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (file: File, previewUrl: string) => void
}

const props = defineProps<Props>()
const previewUrl = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('不支持上传该格式的图片，推荐 jpg 或 png')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('不能上传超过 2M 的图片')
  }
  return isJpgOrPng && isLt2M
}

const loading = ref<boolean>(false)

/**
 * 处理文件选择，不立即上传，只在客户端临时存储
 * @param param0
 */
const handleFileSelect = ({ file }: any) => {
  // 清除之前的预览URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  loading.value = true
  try {
    // 创建本地预览URL
    const url = URL.createObjectURL(file)
    previewUrl.value = url
    selectedFile.value = file

    // 将文件和预览URL传递给父组件
    props.onSuccess?.(file, url)
  } catch (error) {
    message.error('文件处理失败')
  } finally {
    loading.value = false
  }
}

// 暴露方法给父组件，用于获取选中的文件
defineExpose({
  getSelectedFile: () => selectedFile.value,
})
</script>

<style scoped>
.picture-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
}

.picture-upload img {
  max-width: 100%;
  max-height: 480px;
  object-fit: cover;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
