<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col flex="200px">
        <router-link to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/icon.png" alt="logo" />
            <div class="title">FRY|PICTURE</div>
          </div>
        </router-link>
      </a-col>
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <a-col flex="120px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <ASpace>
                <a-avatar :src="loginUserStore.loginUser.userAvatar" />
                {{ loginUserStore.loginUser.userName ?? '无名' }}
              </ASpace>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <MessageOutlined />
                    我的消息
                  </a-menu-item>
                  <a-menu-item @click="goToUserCenter">
                    <UserOutlined />
                    个人中心
                  </a-menu-item>
                  <a-menu-item @click="doLogout">
                    <LoginOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <!-- 未登录 -->
          <div v-else>
            <a-button type="primary" @click="goLogin">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 登录/注册弹窗 -->
    <AuthModal v-model:visible="authModalVisible" @login-success="onLoginSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import {
  AppstoreOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  UserOutlined,
  MessageOutlined,
} from '@ant-design/icons-vue'
import { type MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { LoginOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { userLogoutUsingPost } from '@/api/userController.ts'
import AuthModal from './AuthModal.vue'

// 当前选中菜单
const current = ref<string[]>([])
const router = useRouter()
const loginUserStore = useLoginUserStore()
loginUserStore.fetchLoginUser()

const authModalVisible = ref(false)

// 根据用户角色动态生成菜单项
const items = computed<MenuProps['items']>(() => {
  const baseItems: MenuProps['items'] = [
    {
      key: '/',
      icon: () => h(HomeOutlined),
      label: '主页',
      title: '主页',
    },
    {
      key: '/home',
      icon: () => h(AppstoreOutlined),
      label: '应用',
      title: '应用',
    },
  ]

  // 只有管理员角色才显示用户管理菜单
  if (loginUserStore.loginUser.userRole === 'admin') {
    baseItems.push({
      key: '/admin/userManage',
      icon: () => h(InfoCircleOutlined),
      label: '用户管理',
      title: '用户管理',
    })
  }

  return baseItems
})

// 显示认证模态框
const showAuthModal = () => {
  authModalVisible.value = true
}

// 登录按钮点击事件
const goLogin = () => {
  showAuthModal()
}

// 登录成功处理
const onLoginSuccess = () => {
  // 可以在这里添加登录成功后的处理逻辑
}

// 跳转到个人中心
const goToUserCenter = () => {
  router.push({
    name: '个人中心',
    params: {
      // 将ID转换为字符串，避免大数字精度丢失问题
      id: loginUserStore.loginUser.id?.toString()
    }
  })
}

// 用户注销
const doLogout = async () => {
  const res = await userLogoutUsingPost()
  console.log(res)
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功')
    await router.push('/user/login')
  } else {
    message.error('退出登录失败，' + res.data.message)
  }
}

//路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 监听路由变化，更新当前选中菜单
router.afterEach((to, from, next) => {
  current.value = [to.path]
})
</script>

<style scoped>
.title-bar {
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-weight: bold;
  color: paleturquoise;
  font-size: 18px;
  margin-left: 16px;
}

.logo {
  height: 48px;
}

.user-login-status {
  font-weight: bold;
  text-align: center;
  align-items: center;
}
</style>