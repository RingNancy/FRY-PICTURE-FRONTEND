<template>
  <a-modal
    :visible="visible"
    :title="false"
    :confirm-loading="confirmLoading"
    :footer="null"
    :maskClosable="false"
    @cancel="handleCancel"
    :width="360"
  >
    <div class="auth-modal-header">
      <img class="logo" src="../assets/icon.png" alt="logo" />
      <h2 class="auth-modal-title">{{ isLogin ? '登录' : '注册' }}</h2>
    </div>

    <!-- 登录表单 -->
    <a-form
      v-if="isLogin"
      :model="loginFormState"
      name="loginForm"
      autocomplete="off"
      @finish="handleLogin"
    >
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="loginFormState.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码不能小于 8 位' },
        ]"
      >
        <a-input-password v-model:value="loginFormState.userPassword" placeholder="请输入密码" />
      </a-form-item>

      <a-form-item>
        <a-checkbox v-model:checked="loginFormState.remember">记住密码</a-checkbox>
      </a-form-item>

      <div class="tips">
        没有账号？
        <a @click="switchToRegister">去注册</a>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="confirmLoading" style="width: 100%"
          >登录</a-button
        >
      </a-form-item>
    </a-form>

    <!-- 注册表单 -->
    <a-form
      v-else
      :model="registerFormState"
      name="registerForm"
      autocomplete="off"
      @finish="handleRegister"
    >
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="registerFormState.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码不能小于 8 位' },
        ]"
      >
        <a-input-password v-model:value="registerFormState.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <a-form-item
        name="checkPassword"
        :rules="[
          { required: true, message: '请输入确认密码' },
          { min: 8, message: '确认密码不能小于 8 位' },
        ]"
      >
        <a-input-password
          v-model:value="registerFormState.checkPassword"
          placeholder="请输入确认密码"
        />
      </a-form-item>
      <div class="tips">
        已有账号？
        <a @click="switchToLogin">去登录</a>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="confirmLoading" style="width: 100%"
          >注册</a-button
        >
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { userLoginUsingPost, userRegisterUsingPost } from '@/api/userController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { useRouter } from 'vue-router'

const visible = defineModel<boolean>('visible', { required: true })
const emit = defineEmits(['loginSuccess'])

const isLogin = ref(true)
const confirmLoading = ref(false)
const loginUserStore = useLoginUserStore()
const router = useRouter()

// 登录表单状态
const loginFormState = reactive({
  userAccount: '',
  userPassword: '',
  remember: false,
})

// 注册表单状态
const registerFormState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

// 切换到注册
const switchToRegister = () => {
  isLogin.value = false
}

// 切换到登录
const switchToLogin = () => {
  isLogin.value = true
}

// 处理登录
const handleLogin = async (values: any) => {
  confirmLoading.value = true
  try {
    const res = await userLoginUsingPost({
      userAccount: values.userAccount,
      userPassword: values.userPassword,
    })
    // 登录成功，把登录态保存到全局状态中
    if (res.data.code === 0 && res.data.data) {
      await loginUserStore.fetchLoginUser()
      message.success('登录成功')
      emit('loginSuccess')
      close()
      // 跳转到首页
      router.push('/')
    } else {
      message.error('登录失败，' + res.data.message)
    }
  } catch (error) {
    message.error('登录失败，请稍后重试')
    console.error(error)
  } finally {
    confirmLoading.value = false
  }
}

// 处理注册
const handleRegister = async (values: any) => {
  // 判断两次输入的密码是否一致
  if (registerFormState.userPassword !== registerFormState.checkPassword) {
    message.error('二次输入的密码不一致')
    return
  }

  confirmLoading.value = true
  try {
    const res = await userRegisterUsingPost(values)
    // 注册成功
    if (res.data.code === 0 && res.data.data) {
      message.success('注册成功')
      switchToLogin()
    } else {
      message.error('注册失败，' + res.data.message)
    }
  } catch (error) {
    message.error('注册失败，请稍后重试')
    console.error(error)
  } finally {
    confirmLoading.value = false
  }
}

// 关闭模态框
const close = () => {
  visible.value = false
  resetForms()
}

// 重置表单
const resetForms = () => {
  // 重置登录表单
  loginFormState.userAccount = ''
  loginFormState.userPassword = ''
  loginFormState.remember = false

  // 重置注册表单
  registerFormState.userAccount = ''
  registerFormState.userPassword = ''
  registerFormState.checkPassword = ''

  // 默认回到登录状态
  isLogin.value = true
}

// 取消操作
const handleCancel = () => {
  close()
}
</script>

<style scoped>
.auth-modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  height: 60px;
  margin-bottom: 16px;
}

.auth-modal-title {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.tips {
  margin-bottom: 16px;
  color: #bbb;
  font-size: 13px;
  text-align: right;
}
</style>
