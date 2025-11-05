<template>
  <div id="addPicturePage">
    <a-card class="upload-card">
      <template #title>
        <div class="card-title">
          <FileImageOutlined />
          <span>创建图片</span>
          <!-- 上传方式选择 - 放在标题栏 -->
          <a-tabs v-model:activeKey="uploadMethod" class="upload-method-tabs-in-title" size="small">
            <a-tab-pane key="local" tab="本地上传" />
            <a-tab-pane key="url" tab="URL上传" />
          </a-tabs>
        </div>
      </template>

      <a-row :gutter="24" class="main-content">
        <a-col :span="24" :md="12">
          <div class="upload-section" :class="{ 'url-upload-mode': uploadMethod === 'url' }">
            <div class="upload-header">
              <h3>{{ uploadMethod === 'local' ? '上传图片' : '解析图片' }}</h3>
              <p>{{ uploadMethod === 'local' ? '请选择高质量图片文件' : '请输入图片URL地址' }}</p>
            </div>

            <!-- 上传组件 -->
            <UploadPicture
              v-if="uploadMethod === 'local'"
              :picture="picture"
              :onSuccess="onSuccess"
            />
            <UrlUploadPicture
              v-else
              :picture="picture"
              :onSuccess="onUrlUploadSuccess"
              mode="parse"
            />

            <!-- URL上传的图片预览容器 -->
            <div v-if="uploadMethod === 'url' && picture?.url" class="url-preview-container">
              <img :src="picture.url" alt="Preview" class="url-preview-image" />
            </div>
          </div>
        </a-col>

        <a-col :span="24" :md="12">
          <div class="form-section">
            <a-form
              v-if="picture"
              layout="vertical"
              :model="pictureForm"
              @finish="handleSubmit"
              class="picture-form"
            >
              <a-form-item
                label="名称"
                name="name"
                :rules="[{ required: true, message: '请输入图片名称' }]"
              >
                <a-input
                  v-model:value="pictureForm.name"
                  placeholder="请输入图片名称"
                  size="large"
                  class="custom-input"
                />
              </a-form-item>

              <a-form-item
                label="简介"
                name="introduction"
                :rules="[{ required: true, message: '请输入图片简介' }]"
              >
                <a-textarea
                  v-model:value="pictureForm.introduction"
                  placeholder="请输入图片简介"
                  :rows="4"
                  size="large"
                  class="custom-textarea"
                />
              </a-form-item>

              <a-form-item label="分类" name="category">
                <a-auto-complete
                  v-model:value="pictureForm.category"
                  :options="categoryOptions"
                  placeholder="请选择或输入分类"
                  size="large"
                  allowClear
                  class="custom-select"
                >
                  <template #option="item">
                    <span>{{ item.label }}</span>
                  </template>
                </a-auto-complete>
              </a-form-item>

              <a-form-item label="标签" name="tags">
                <a-select
                  v-model:value="pictureForm.tags"
                  :options="tagOptions"
                  mode="tags"
                  placeholder="请选择或输入标签"
                  size="large"
                  allowClear
                  class="custom-select"
                >
                  <template #option="item">
                    <span>{{ item.label }}</span>
                  </template>
                </a-select>
              </a-form-item>

              <a-form-item class="submit-button">
                <a-button
                  type="primary"
                  html-type="submit"
                  size="large"
                  block
                  :loading="submitting"
                  class="submit-btn"
                >
                  {{ picture.value?.id ? '更新图片' : '创建图片' }}
                </a-button>
              </a-form-item>
            </a-form>

            <div v-else class="placeholder-text">
              <FileImageOutlined class="placeholder-icon" />
              <p>{{ uploadMethod === 'local' ? '请先上传图片' : '请先解析图片' }}</p>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import UploadPicture from '@/components/UploadPicture.vue'
import { onMounted, reactive, ref } from 'vue'
import {
  editPictureUsingPost,
  listPictureTagCategoryUsingGet,
  uploadPictureUsingPost,
  uploadPictureByUrlUsingPost,
} from '@/api/pictureController.ts'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { FileImageOutlined } from '@ant-design/icons-vue'
import UrlUploadPicture from '@/components/UrlUploadPicture.vue'

const picture = ref<API.PictureVO>()
const submitting = ref(false)
const pictureForm = reactive<API.PictureEditRequest>({
  name: '',
  introduction: '',
  category: '',
  tags: [],
})
const selectedFile = ref<File | null>(null)
const uploadMethod = ref<'local' | 'url'>('local')

const onSuccess = (file: File, previewUrl: string) => {
  // 保存选中的文件
  selectedFile.value = file
  // 创建一个临时的picture对象用于预览
  picture.value = {
    url: previewUrl,
  } as API.PictureVO
}

/**
 * URL上传成功回调
 * @param newPicture
 */
const onUrlUploadSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  // URL上传不需要selectedFile，因为文件已经在服务端
  selectedFile.value = null
}

const router = useRouter()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  if (!selectedFile.value && !picture.value?.url) {
    message.error('请先上传图片')
    return
  }

  submitting.value = true
  try {
    let uploadedPicture

    // 如果有本地文件需要上传
    if (selectedFile.value) {
      // 先上传图片
      const uploadParams = picture.value?.id ? { id: picture.value.id } : {}
      const uploadRes = await uploadPictureUsingPost(uploadParams, {}, selectedFile.value)

      if (uploadRes.data.code !== 0 || !uploadRes.data.data) {
        message.error('图片上传失败，' + uploadRes.data.message)
        return
      }

      uploadedPicture = uploadRes.data.data
    } else if (picture.value?.url) {
      // URL上传的图片需要检查是否已经上传到服务器
      // 如果是通过URL解析模式添加的，需要先上传
      if (uploadMethod.value === 'url') {
        const uploadRes = await uploadPictureByUrlUsingPost({
          fileUrl: picture.value.url,
        })

        if (uploadRes.data.code !== 0 || !uploadRes.data.data) {
          message.error('图片上传失败，' + uploadRes.data.message)
          return
        }

        uploadedPicture = uploadRes.data.data
      } else {
        // 已经存在于服务器上的图片
        uploadedPicture = picture.value
      }
    } else {
      message.error('图片信息异常')
      return
    }

    // 获取图片ID
    const pictureId = uploadedPicture.id

    // 然后更新图片信息
    const res = await editPictureUsingPost({
      id: pictureId,
      ...values,
    })

    if (res.data.code === 0 && res.data.data) {
      message.success('创建成功')
      // 跳转到图片详情页
      router.push({
        path: `/picture/${pictureId}`,
      })
    } else {
      message.error('创建失败，' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error('创建失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data && res.data.code === 0 && res.data.data) {
      // 转换成下拉选项组件接受的格式
      tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
        return {
          value: data,
          label: data,
        }
      })
      categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
        return {
          value: data,
          label: data,
        }
      })
    } else {
      message.error('加载选项失败，' + (res.data?.message || '未知错误'))
    }
  } catch (error) {
    message.error('加载选项失败，请稍后重试')
  }
}

onMounted(() => {
  getTagCategoryOptions()
})
</script>

<style scoped>
#addPicturePage {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.upload-method-tabs-in-title {
  margin-left: auto;
}

.upload-method-tabs-in-title :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}

.upload-method-tabs-in-title :deep(.ant-tabs-tab) {
  font-size: 14px;
  padding: 8px 16px;
}

.upload-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: none;
}

.main-content {
  margin-top: 20px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  min-height: 400px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  border-radius: 12px;
  border: 2px dashed #a3c4f3;
  padding: 24px;
  transition: all 0.3s ease;
}

/* URL上传模式下不需要虚线框，移除默认的虚线框样式 */
.upload-section.url-upload-mode {
  border: none;
  background: transparent;
  padding: 0;
}

.url-preview-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  border-radius: 12px;
  border: 2px dashed #a3c4f3;
  padding: 24px;
  margin-top: 16px;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.url-preview-container:hover {
  background: linear-gradient(135deg, #eef2f7 0%, #d8e6f5 100%);
  border-color: #6aa1ef;
  box-shadow: 0 4px 12px rgba(106, 161, 239, 0.2);
}

.url-preview-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upload-header {
  text-align: center;
  margin-bottom: 24px;
}

.upload-header h3 {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.upload-header p {
  font-size: 14px;
  color: #7f8c8d;
}

.form-section {
  padding: 0 16px;
}

.picture-form {
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

:deep(.ant-form-item-label) {
  padding-bottom: 8px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #2c3e50;
  font-size: 15px;
}

.custom-input,
.custom-textarea,
.custom-select {
  border-radius: 8px !important;
  border: 1px solid #d1d8e0 !important;
  transition: all 0.3s ease;
}

.custom-input:hover,
.custom-textarea:hover,
.custom-select:hover {
  border-color: #a3c4f3 !important;
  box-shadow: 0 0 0 2px rgba(163, 196, 243, 0.2) !important;
}

.custom-input:focus,
.custom-textarea:focus,
.custom-select:focus {
  border-color: #6aa1ef !important;
  box-shadow: 0 0 0 2px rgba(106, 161, 239, 0.2) !important;
}

.custom-textarea {
  min-height: 120px !important;
}

.submit-btn {
  background: linear-gradient(135deg, #6aa1ef 0%, #3498db 100%) !important;
  border: none !important;
  border-radius: 8px !important;
  height: 48px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.submit-btn:hover {
  background: linear-gradient(135deg, #3498db 0%, #6aa1ef 100%) !important;
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4) !important;
  transform: translateY(-2px);
}

.placeholder-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 300px;
  color: #95a5a6;
  font-size: 18px;
  background: #f8f9fa;
  border-radius: 12px;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #bdc3c7;
}

@media (max-width: 768px) {
  #addPicturePage {
    margin: 12px auto;
    padding: 0 12px;
  }

  .upload-card {
    padding: 16px;
  }

  .upload-section {
    min-height: 300px;
    padding: 16px;
  }

  .placeholder-text {
    min-height: 250px;
  }

  .picture-form {
    padding: 16px;
  }

  .upload-header h3 {
    font-size: 18px;
  }
}
</style>
