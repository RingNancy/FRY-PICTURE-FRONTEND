<template>
  <div id="userEditPage">
    <a-row type="flex" justify="center">
      <a-col :span="16">
        <a-card class="edit-card" title="编辑个人资料">
          <a-form
            :model="formState"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 18 }"
            layout="horizontal"
            class="edit-form"
          >
            <a-form-item label="用户昵称">
              <a-input v-model:value="formState.userName" placeholder="请输入用户昵称" />
            </a-form-item>

            <a-form-item label="头像">
              <a-upload
                v-model:file-list="fileList"
                name="avatar"
                list-type="picture-card"
                class="avatar-uploader"
                :show-upload-list="false"
                action="/api/upload"
                :before-upload="beforeUpload"
                @change="handleChange"
              >
                <img v-if="formState.userAvatar" :src="formState.userAvatar" alt="avatar" style="width: 100%" />
                <div v-else>
                  <loading-outlined v-if="loading"></loading-outlined>
                  <plus-outlined v-else></plus-outlined>
                  <div class="ant-upload-text">上传头像</div>
                </div>
              </a-upload>
            </a-form-item>

            <a-form-item label="个人简介">
              <a-textarea
                v-model:value="formState.userProfile"
                placeholder="请输入个人简介"
                :rows="4"
              />
            </a-form-item>

            <a-form-item label="性别">
              <a-select v-model:value="formState.gender" placeholder="请选择性别">
                <a-select-option value="0">女</a-select-option>
                <a-select-option value="1">男</a-select-option>
                <a-select-option value="2">保密</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="年龄">
              <a-input-number
                v-model:value="formState.age"
                placeholder="请输入年龄"
                :min="1"
                :max="150"
                style="width: 100%"
              />
            </a-form-item>

            <a-form-item label="电话">
              <a-input v-model:value="formState.phone" placeholder="请输入电话号码" />
            </a-form-item>

            <a-form-item label="邮箱">
              <a-input v-model:value="formState.email" placeholder="请输入邮箱地址" />
            </a-form-item>

            <a-form-item label="生日">
              <a-date-picker
                v-model:value="birthdayValue"
                placeholder="请选择生日"
                style="width: 100%"
                value-format="YYYY-MM-DD"
                :locale="datePickerLocale"
              />
            </a-form-item>

            <a-form-item :wrapper-col="{ span: 18, offset: 4 }" class="form-buttons">
              <a-button type="primary" @click="onSubmit">保存</a-button>
              <a-button style="margin-left: 10px" @click="onCancel">取消</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { getUserVoByIdUsingGet } from '@/api/userController'
import { editUserUsingPost } from '@/api/userController'

// 引入中文语言包
import 'dayjs/locale/zh-cn'
import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN'

const route = useRoute()
const router = useRouter()

// 设置日期选择器中文语言包
const datePickerLocale = zhCN

// 表单状态
const formState = reactive({
  userName: '',
  userAvatar: '',
  userProfile: '',
  gender: undefined as string | undefined,
  age: undefined as number | undefined,
  phone: '',
  email: '',
  birthday: ''
})

// 生日值，用于日期选择器
const birthdayValue = computed({
  get: () => {
    return formState.birthday ? dayjs(formState.birthday) : undefined
  },
  set: (value) => {
    formState.birthday = value ? value.format('YYYY-MM-DD') : ''
  }
})

// 上传相关状态
const fileList = ref<any[]>([])
const loading = ref<boolean>(false)

// 路由参数中的用户ID
const userId = route.params.id as string

// 文件上传前的检查
const beforeUpload = (file: any) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!');
  }
  return isJpgOrPng && isLt2M;
}

// 处理文件上传变化
const handleChange = (info: any) => {
  if (info.file.status === 'uploading') {
    loading.value = true
    return
  }
  if (info.file.status === 'done') {
    // 模拟上传成功，实际项目中应该从服务器返回URL
    formState.userAvatar = info.file.response?.url || info.file.url
    loading.value = false
    message.success('头像上传成功')
  }
  if (info.file.status === 'error') {
    loading.value = false
    message.error('头像上传失败')
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  if (!userId) {
    message.error('未找到用户ID')
    return
  }

  try {
    const res = await getUserVoByIdUsingGet({ id: userId })
    
    if (res.data.code === 0 && res.data.data) {
      const userData = res.data.data
      
      // 填充表单数据
      formState.userName = userData.userName || ''
      formState.userAvatar = userData.userAvatar || ''
      formState.userProfile = userData.userProfile || ''
      formState.gender = userData.gender !== undefined ? userData.gender.toString() : undefined
      formState.age = userData.age || undefined
      formState.phone = userData.phone || ''
      formState.email = userData.email || ''
      formState.birthday = userData.birthday || ''
      
      // 设置头像文件列表
      if (userData.userAvatar) {
        fileList.value = [{
          uid: '-1',
          name: 'avatar.png',
          status: 'done',
          url: userData.userAvatar,
        }]
      }
    } else {
      message.error(res.data.message || '获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    message.error('获取用户信息失败')
  }
}

// 提交表单
const onSubmit = async () => {
  // 在实际项目中，这里应该调用后端接口保存数据
  try {
    // 使用 BigInt 或者字符串来处理大整数ID，避免精度丢失
    const res = await editUserUsingPost({
      id: userId, // 直接使用字符串形式的ID，避免parseInt造成的精度丢失
      userName: formState.userName,
      userAvatar: formState.userAvatar,
      userProfile: formState.userProfile,
      gender: formState.gender ? parseInt(formState.gender) : undefined,
      age: formState.age,
      phone: formState.phone,
      email: formState.email,
      birthday: formState.birthday
    })

    if (res.data.code === 0) {
      message.success('资料保存成功')
      // 跳转回个人中心页面
      router.push(`/user/center/${userId}`)
    } else {
      message.error(res.data.message || '操作失败')
    }
  } catch (error) {
    console.error('保存用户信息失败:', error)
    message.error('保存用户信息失败')
  }
}

// 取消编辑
const onCancel = () => {
  router.push(`/user/center/${userId}`)
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
#userEditPage {
  width: 100%;
  padding: 20px 0;
}

.edit-card {
  border-radius: 8px;
}

.edit-form {
  margin-top: 20px;
}

.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}

.form-buttons {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .edit-form :deep(.ant-form-item-label) {
    width: 100%;
    text-align: left;
    padding-bottom: 8px;
  }
  
  .edit-form :deep(.ant-form-item-control) {
    width: 100%;
  }
}
</style>