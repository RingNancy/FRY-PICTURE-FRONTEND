import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/page/HomePage.vue'
import UserManagePage from '@/page/admin/UserManagePage.vue'
import UserCenterPage from '@/page/user/UserCenterPage.vue'
import UserEditPage from '@/page/user/UserEditPage.vue'
import AdminUserEditPage from '@/page/admin/AdminUserEditPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: UserManagePage,
    },
    {
      path: '/user/center/:id',
      name: '个人中心',
      component: UserCenterPage,
      props: true
    },
    {
      path: '/user/edit/:id',
      name: '编辑资料',
      component: UserEditPage,
      props: true
    },
    {
      path: '/admin/user/edit/:id',
      name: '管理员编辑用户',
      component: AdminUserEditPage,
      props: true
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router