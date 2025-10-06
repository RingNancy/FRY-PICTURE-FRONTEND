<template>
  <div id="adminUserEditPage">
    <a-row type="flex" justify="center">
      <a-col :span="16">
        <a-card class="edit-card" title="编辑用户信息">
          <a-form
            :model="formState"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 18 }"
            layout="horizontal"
            class="edit-form"
            @finish="onSubmit"
          >
            <a-form-item label="用户ID" name="id">
              <a-input v-model:value="formState.id" disabled />
            </a-form-item>

            <a-form-item
              label="用户昵称"
              name="userName"
              :rules="[{ required: true, message: '请输入用户昵称' }]"
            >
              <a-input v-model:value="formState.userName" placeholder="请输入用户昵称" />
            </a-form-item>

            <a-form-item label="用户账号" name="userAccount">
              <a-input v-model:value="formState.userAccount" disabled />
            </a-form-item>

            <a-form-item label="头像地址" name="userAvatar">
              <a-input v-model:value="formState.userAvatar" placeholder="请输入头像地址" />
            </a-form-item>

            <a-form-item label="个人简介" name="userProfile">
              <a-textarea
                v-model:value="formState.userProfile"
                placeholder="请输入个人简介"
                :rows="4"
              />
            </a-form-item>

            <a-form-item label="性别" name="gender">
              <a-select v-model:value="formState.gender" placeholder="请选择性别">
                <a-select-option :value="0">女</a-select-option>
                <a-select-option :value="1">男</a-select-option>
                <a-select-option :value="2">保密</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="年龄" name="age">
              <a-input-number
                v-model:value="formState.age"
                placeholder="请输入年龄"
                :min="1"
                :max="150"
                style="width: 100%"
              />
            </a-form-item>

            <a-form-item label="电话" name="phone">
              <a-input v-model:value="formState.phone" placeholder="请输入电话号码" />
            </a-form-item>

            <a-form-item label="邮箱" name="email">
              <a-input v-model:value="formState.email" placeholder="请输入邮箱地址" />
            </a-form-item>

            <a-form-item label="生日" name="birthday">
              <a-date-picker
                v-model:value="birthdayValue"
                placeholder="请选择生日"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>

            <a-form-item
              label="用户角色"
              name="userRole"
              :rules="[{ required: true, message: '请选择用户角色' }]"
            >
              <a-select v-model:value="formState.userRole" placeholder="请选择用户角色">
                <a-select-option value="user">普通用户</a-select-option>
                <a-select-option value="admin">管理员</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item :wrapper-col="{ span: 18, offset: 4 }" class="form-buttons">
              <a-button type="primary" html-type="submit" :loading="submitting">保存</a-button>
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
import dayjs from 'dayjs'
import { getUserVoByIdUsingGet, updateUserUsingPost } from '@/api/userController'

const route = useRoute()
const router = useRouter()

// 表单状态
const formState = reactive({
  id: undefined as number | undefined,
  userName: '',
  userAccount: '',
  userAvatar: '',
  userProfile: '',
  gender: undefined as number | undefined,
  age: undefined as number | undefined,
  phone: '',
  email: '',
  birthday: '',
  userRole: '',
})

// 生日值，用于日期选择器
const birthdayValue = computed({
  get: () => {
    return formState.birthday ? dayjs(formState.birthday) : undefined
  },
  set: (value) => {
    formState.birthday = value ? value.format('YYYY-MM-DD') : ''
  },
})

// 提交状态
const submitting = ref<boolean>(false)

// 路由参数中的用户ID
const userId = route.params.id as string

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
      formState.id = userData.id
      formState.userName = userData.userName || ''
      formState.userAccount = userData.userAccount || ''
      formState.userAvatar = userData.userAvatar || ''
      formState.userProfile = userData.userProfile || ''
      formState.gender = userData.gender
      formState.age = userData.age || undefined
      formState.phone = userData.phone || ''
      formState.email = userData.email || ''
      formState.birthday = userData.birthday || ''
      formState.userRole = userData.userRole || ''
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
  if (!formState.id) {
    message.error('用户ID不能为空')
    return
  }

  try {
    submitting.value = true
    const res = await updateUserUsingPost({
      id: formState.id,
      userName: formState.userName,
      userAvatar: formState.userAvatar,
      userProfile: formState.userProfile,
      gender: formState.gender,
      age: formState.age,
      phone: formState.phone,
      email: formState.email,
      birthday: formState.birthday,
      userRole: formState.userRole,
    })

    if (res.data.code === 0) {
      message.success('用户信息更新成功')
      // 跳转回用户管理页面
      router.push('/admin/userManage')
    } else {
      message.error(res.data.message || '更新失败')
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    message.error('更新用户信息失败')
  } finally {
    submitting.value = false
  }
}

// 取消编辑
const onCancel = () => {
  router.push('/admin/user')
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
#adminUserEditPage {
  width: 100%;
  padding: 20px 0;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.edit-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.edit-form {
  margin-top: 20px;
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
