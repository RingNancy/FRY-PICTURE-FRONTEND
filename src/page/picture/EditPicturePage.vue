<template>
  <div id="editPicturePage">
    <a-card class="edit-card">
      <template #title>
        <div class="card-title">
          <FileImageOutlined />
          <span>编辑图片</span>
        </div>
      </template>

      <a-spin :spinning="loading" size="large">
        <a-row :gutter="24" class="main-content" v-if="picture">
          <a-col :span="24" :md="12">
            <div class="preview-section">
              <div class="preview-header">
                <h3>图片预览</h3>
              </div>
              <div class="image-preview-container">
                <img :src="picture.url" :alt="picture.name" class="image-preview" />
              </div>
              <div class="image-info">
                <a-descriptions :column="1" size="small">
                  <a-descriptions-item label="格式">{{ picture.picFormat }}</a-descriptions-item>
                  <a-descriptions-item label="尺寸"
                    >{{ picture.picWidth }}x{{ picture.picHeight }}</a-descriptions-item
                  >
                  <a-descriptions-item label="大小">{{
                    formatFileSize(picture.picSize)
                  }}</a-descriptions-item>
                </a-descriptions>
              </div>
            </div>
          </a-col>

          <a-col :span="24" :md="12">
            <div class="form-section">
              <a-form
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
                    更新图片
                  </a-button>
                </a-form-item>
              </a-form>
            </div>
          </a-col>
        </a-row>

        <div v-else class="empty-state">
          <FileImageOutlined class="empty-icon" />
          <p>未找到图片信息</p>
        </div>
      </a-spin>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController.ts'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { FileImageOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()

const picture = ref<API.PictureVO | null>(null)
const loading = ref(false)
const submitting = ref(false)

const pictureForm = reactive<API.PictureEditRequest>({
  name: '',
  introduction: '',
  category: '',
  tags: [],
})

const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])

// 格式化文件大小
const formatFileSize = (size?: number) => {
  if (!size) return 'N/A'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

// 获取图片详情
const fetchPictureDetail = async () => {
  const pictureId = route.params.id

  if (!pictureId) {
    message.error('缺少图片ID')
    return
  }

  loading.value = true
  try {
    const res = await getPictureVoByIdUsingGet({
      id: pictureId as string,
    })

    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data

      // 填充表单数据
      pictureForm.name = picture.value.name || ''
      pictureForm.introduction = picture.value.introduction || ''
      pictureForm.category = picture.value.category || ''
      pictureForm.tags = picture.value.tags
        ? Array.isArray(picture.value.tags)
          ? picture.value.tags
          : picture.value.tags.split(',')
        : []
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败：' + e.message)
  } finally {
    loading.value = false
  }
}

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  if (!picture.value?.id) {
    message.error('缺少图片ID')
    return
  }

  submitting.value = true
  try {
    // 调用编辑接口
    const res = await editPictureUsingPost({
      id: picture.value.id,
      ...values,
    })

    if (res.data.code === 0 && res.data.data) {
      message.success('更新成功')
      // 重新获取图片详情以确保数据是最新的
      await fetchPictureDetail()
    } else {
      message.error('更新失败，' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error('更新失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

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
  fetchPictureDetail()
  getTagCategoryOptions()
})
</script>

<style scoped>
#editPicturePage {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 16px;
}

.edit-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.main-content {
  margin-top: 20px;
}

.preview-section {
  display: flex;
  flex-direction: column;
  min-height: 400px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  border-radius: 12px;
  border: 1px solid #d1d8e0;
  padding: 24px;
}

.preview-header {
  text-align: center;
  margin-bottom: 24px;
}

.preview-header h3 {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.image-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 250px;
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-preview {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.image-info {
  margin-top: 24px;
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

:deep(.ant-descriptions-item-label) {
  font-weight: 500;
  color: #2c3e50;
}

:deep(.ant-descriptions-item-content) {
  color: #34495e;
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

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #95a5a6;
  font-size: 18px;
  background: #f8f9fa;
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #bdc3c7;
}

@media (max-width: 768px) {
  #editPicturePage {
    margin: 12px auto;
    padding: 0 12px;
  }

  .edit-card {
    padding: 16px;
  }

  .preview-section {
    min-height: 300px;
    padding: 16px;
  }

  .picture-form {
    padding: 16px;
  }

  .preview-header h3 {
    font-size: 18px;
  }
}
</style>
