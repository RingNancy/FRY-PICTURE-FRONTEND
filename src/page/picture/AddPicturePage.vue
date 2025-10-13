<template>
  <div id="addPicturePage">
    <a-card class="upload-card">
      <template #title>
        <div class="card-title">
          <FileImageOutlined />
          <span>创建图片</span>
        </div>
      </template>
      
      <a-row :gutter="24" class="main-content">
        <a-col :span="24" :md="12">
          <div class="upload-section">
            <div class="upload-header">
              <h3>上传图片</h3>
              <p>请选择高质量图片文件</p>
            </div>
            <UploadPicture :picture="picture" :onSuccess="onSuccess" />
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
              <p>请先上传图片</p>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import UploadPicture from '@/components/UploadPicture.vue'
import { onMounted, reactive, ref, computed } from 'vue'
import { editPictureUsingPost, listPictureTagCategoryUsingGet, uploadPictureUsingPost } from '@/api/pictureController.ts'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { FileImageOutlined } from '@ant-design/icons-vue'

const picture = ref<API.PictureVO>()
const submitting = ref(false)
const pictureForm = reactive<API.PictureEditRequest>({
  name: '',
  introduction: '',
  category: '',
  tags: []
})
const selectedFile = ref<File | null>(null)
const uploadPictureRef = ref()

const onSuccess = (file: File, previewUrl: string) => {
  // 保存选中的文件
  selectedFile.value = file
  // 创建一个临时的picture对象用于预览
  picture.value = {
    url: previewUrl
  } as API.PictureVO
}

const router = useRouter()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  if (!selectedFile.value) {
    message.error('请先上传图片')
    return
  }
  
  submitting.value = true
  try {
    // 先上传图片
    const uploadParams = picture.value?.id ? { id: picture.value.id } : {}
    const uploadRes = await uploadPictureUsingPost(uploadParams, {}, selectedFile.value)
    
    if (uploadRes.data.code !== 0 || !uploadRes.data.data) {
      message.error('图片上传失败，' + uploadRes.data.message)
      return
    }
    
    // 获取上传后的图片信息
    const uploadedPicture = uploadRes.data.data
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

.upload-card {
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

.upload-section:hover {
  background: linear-gradient(135deg, #eef2f7 0%, #d8e6f5 100%);
  border-color: #6aa1ef;
  box-shadow: 0 4px 12px rgba(106, 161, 239, 0.2);
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