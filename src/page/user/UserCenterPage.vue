<template>
  <div id="userCenterPage">
    <a-row type="flex" justify="center">
      <a-col :span="18">
        <!-- 顶部用户信息卡片 -->
        <a-card v-if="user || mockUser" class="user-profile-card" :bordered="false">
          <a-row :gutter="32" align="middle">
            <!-- 左侧头像区域 -->
            <a-col :span="5">
              <div class="avatar-section">
                <a-avatar
                  :size="140"
                  :src="user?.userAvatar || mockUser.userAvatar || '/avatar/avatarFry.png'"
                  class="user-avatar"
                />
                <div class="avatar-badge">
                  <a-badge :count="userLevel" :number-style="{ backgroundColor: '#52c41a' }" />
                </div>
              </div>
            </a-col>

            <!-- 右侧用户信息 -->
            <a-col :span="19">
              <div class="user-basic-info">
                <div class="user-name-role">
                  <h1 class="user-name">
                    {{ user?.userName || mockUser.userName || '未设置昵称' }}
                  </h1>
                  <a-tag
                    :color="getUserRoleColor(user?.userRole || mockUser.userRole)"
                    class="role-tag"
                  >
                    {{ getUserRoleText(user?.userRole || mockUser.userRole) }}
                  </a-tag>
                  <span class="user-level">Lv.{{ userLevel }}</span>
                </div>

                <p class="user-profile" v-if="user?.userProfile || mockUser.userProfile">
                  {{ user?.userProfile || mockUser.userProfile }}
                </p>
                <p class="user-profile empty-profile" v-else>这个人很懒，什么都没有留下～</p>

                <!-- 用户统计信息 -->
                <div class="user-stats">
                  <div class="stat-item">
                    <span class="stat-number">{{ userStats.followers }}</span>
                    <span class="stat-label">粉丝</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ userStats.following }}</span>
                    <span class="stat-label">关注</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ userStats.posts }}</span>
                    <span class="stat-label">帖子</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ userStats.likes }}</span>
                    <span class="stat-label">获赞</span>
                  </div>
                </div>

                <!-- 用户元信息 -->
                <div class="user-meta-grid">
                  <div class="meta-item">
                    <UserOutlined class="meta-icon" />
                    <span>{{ getGenderText(user?.gender || mockUser.gender) }}</span>
                  </div>
                  <div class="meta-item">
                    <CalendarOutlined class="meta-icon" />
                    <span>{{ formatBirthday(user?.birthday || mockUser.birthday) }}</span>
                  </div>
                  <div class="meta-item">
                    <PhoneOutlined class="meta-icon" />
                    <span>{{ user?.phone || mockUser.phone || '未设置电话' }}</span>
                  </div>
                  <div class="meta-item">
                    <MailOutlined class="meta-icon" />
                    <span>{{ user?.email || mockUser.email || '未设置邮箱' }}</span>
                  </div>
                  <div class="meta-item">
                    <EnvironmentOutlined class="meta-icon" />
                    <span>{{ mockUser.location || '北京, 中国' }}</span>
                  </div>
                  <div class="meta-item">
                    <LinkOutlined class="meta-icon" />
                    <a :href="mockUser.website || '#'" target="_blank" rel="noopener noreferrer">
                      {{ mockUser.websiteName || '个人网站' }}
                    </a>
                  </div>
                </div>
              </div>
            </a-col>
          </a-row>
        </a-card>

        <!-- 主要内容区域 -->
        <a-row :gutter="24" class="content-area">
          <!-- 左侧栏：用户详细信息 -->
          <a-col :span="16">
            <!-- 基本信息卡片 -->
            <a-card class="info-card" title="基本信息" :bordered="false">
              <template #extra>
                <a-button type="primary" @click="goToEditProfile" size="small">
                  <EditOutlined />
                  编辑资料
                </a-button>
              </template>
              <a-descriptions :column="2" size="middle">
                <a-descriptions-item label="账号">
                  <span class="info-value">{{ user?.userAccount || '未设置' }}</span>
                </a-descriptions-item>
                <a-descriptions-item label="昵称">
                  <span class="info-value">{{ user?.userName || '未设置' }}</span>
                </a-descriptions-item>
                <a-descriptions-item label="角色">
                  <a-tag :color="getUserRoleColor(user?.userRole)" class="info-tag">
                    {{ getUserRoleText(user?.userRole) }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="性别">
                  <span class="info-value">{{ getGenderText(user?.gender) }}</span>
                </a-descriptions-item>
                <a-descriptions-item label="年龄">
                  <span v-if="user?.age && user?.age > 0" class="info-value"
                    >{{ user?.age }} 岁</span
                  >
                  <span v-else class="info-value">未设置</span>
                </a-descriptions-item>
                <a-descriptions-item label="电话">
                  <span class="info-value">{{ user?.phone || '未设置' }}</span>
                </a-descriptions-item>
                <a-descriptions-item label="邮箱">
                  <span class="info-value">{{ user?.email || '未设置' }}</span>
                </a-descriptions-item>
                <a-descriptions-item label="生日">
                  <span class="info-value">{{ formatBirthday(user?.birthday) }}</span>
                </a-descriptions-item>
                <a-descriptions-item label="用户ID">
                  <span class="info-value">{{ user?.id }}</span>
                </a-descriptions-item>
                <a-descriptions-item label="注册时间">
                  <span class="info-value">{{ formatDateTime(user?.createTime) }}</span>
                </a-descriptions-item>
              </a-descriptions>
            </a-card>

            <!-- 活跃度统计卡片 -->
            <a-card class="activity-card" title="活跃度统计" :bordered="false">
              <a-row :gutter="16">
                <a-col :span="6">
                  <div class="activity-item">
                    <div class="activity-icon" style="background: #1890ff">
                      <EyeOutlined />
                    </div>
                    <div class="activity-info">
                      <div class="activity-number">1,234</div>
                      <div class="activity-label">今日访问</div>
                    </div>
                  </div>
                </a-col>
                <a-col :span="6">
                  <div class="activity-item">
                    <div class="activity-icon" style="background: #52c41a">
                      <LikeOutlined />
                    </div>
                    <div class="activity-info">
                      <div class="activity-number">567</div>
                      <div class="activity-label">今日点赞</div>
                    </div>
                  </div>
                </a-col>
                <a-col :span="6">
                  <div class="activity-item">
                    <div class="activity-icon" style="background: #faad14">
                      <MessageOutlined />
                    </div>
                    <div class="activity-info">
                      <div class="activity-number">89</div>
                      <div class="activity-label">今日评论</div>
                    </div>
                  </div>
                </a-col>
                <a-col :span="6">
                  <div class="activity-item">
                    <div class="activity-icon" style="background: #f5222d">
                      <ShareAltOutlined />
                    </div>
                    <div class="activity-info">
                      <div class="activity-number">34</div>
                      <div class="activity-label">今日分享</div>
                    </div>
                  </div>
                </a-col>
              </a-row>
            </a-card>

            <!-- 最近动态卡片 -->
            <a-card class="recent-activity-card" title="最近动态" :bordered="false">
              <a-timeline>
                <a-timeline-item v-for="activity in recentActivities" :key="activity.id">
                  <template #dot>
                    <component :is="activity.icon" :style="{ color: activity.color }" />
                  </template>
                  <span class="activity-time">{{ activity.time }}</span>
                  <span class="activity-content">{{ activity.content }}</span>
                </a-timeline-item>
              </a-timeline>
            </a-card>
          </a-col>

          <!-- 右侧栏：侧边信息 -->
          <a-col :span="8">
            <!-- 热搜话题卡片 -->
            <a-card class="hot-topics-card" title="🔥 热搜话题" :bordered="false">
              <a-list :data-source="hotTopics" size="small">
                <template #renderItem="{ item, index }">
                  <a-list-item class="topic-list-item">
                    <a-list-item-meta>
                      <template #title>
                        <div class="topic-item">
                          <span class="topic-rank" :class="getRankClass(index)">{{
                            index + 1
                          }}</span>
                          <a href="#" class="topic-title">{{ item.title }}</a>
                          <span v-if="item.isNew" class="new-badge">新</span>
                        </div>
                      </template>
                      <template #description>
                        <div class="topic-meta">
                          <span class="topic-hot">{{ item.hot }} 热度</span>
                          <span class="topic-time">{{ item.time }}</span>
                        </div>
                      </template>
                    </a-list-item-meta>
                  </a-list-item>
                </template>
              </a-list>
            </a-card>

            <!-- 推荐关注卡片 -->
            <a-card class="recommend-card" title="👥 推荐关注" :bordered="false">
              <a-list :data-source="recommendUsers" size="small">
                <template #renderItem="{ item }">
                  <a-list-item class="recommend-item">
                    <a-list-item-meta>
                      <template #avatar>
                        <a-avatar :size="40" :src="item.avatar" />
                      </template>
                      <template #title>
                        <div class="recommend-user">
                          <span class="recommend-name">{{ item.name }}</span>
                          <a-tag v-if="item.isVip" color="gold" size="small">VIP</a-tag>
                        </div>
                      </template>
                      <template #description>
                        <span class="recommend-desc">{{ item.description }}</span>
                      </template>
                    </a-list-item-meta>
                    <template #actions>
                      <a-button type="link" size="small">关注</a-button>
                    </template>
                  </a-list-item>
                </template>
              </a-list>
            </a-card>

            <!-- 标签云卡片 -->
            <a-card class="tags-card" title="🏷️ 兴趣标签" :bordered="false">
              <div class="tags-cloud">
                <a-tag
                  v-for="tag in userTags"
                  :key="tag"
                  :color="tagColors[Math.floor(Math.random() * tagColors.length)]"
                  class="tag-item"
                >
                  {{ tag }}
                </a-tag>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserVoByIdUsingGet } from '@/api/userController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  EditOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
  StarOutlined,
  HeartOutlined,
  FireOutlined,
} from '@ant-design/icons-vue'

// 模拟用户数据，用于展示丰富内容
const mockUser = {
  id: 10000,
  userName: '前端开发工程师',
  userAccount: 'frontend_dev',
  userAvatar: '/avatar/avatarFry.png',
  userProfile:
    '热爱前端技术，专注于Vue.js和React生态，有5年前端开发经验，喜欢分享技术心得。致力于打造优秀的用户体验，关注前端工程化和性能优化。',
  userRole: 'user',
  gender: 1,
  age: 28,
  phone: '138****8888',
  email: 'frontend@example.com',
  birthday: '1995-08-15',
  location: '北京, 中国',
  website: 'https://example.com',
  websiteName: '个人技术博客',
  createTime: dayjs().subtract(2, 'year').toISOString(),
}

const route = useRoute()
const router = useRouter()
const user = ref<API.UserVO | null>(null)

// 用户等级（基于活跃度计算）
const userLevel = computed(() => {
  const baseLevel = 5
  const activityBonus =
    Math.floor(userStats.value.posts / 10) + Math.floor(userStats.value.likes / 50)
  return baseLevel + activityBonus
})

// 用户统计信息
const userStats = ref({
  followers: 1234,
  following: 567,
  posts: 89,
  likes: 4567,
})

// 用户标签
const userTags = ref([
  '前端开发',
  'Vue.js',
  'React',
  'TypeScript',
  'JavaScript',
  'CSS',
  'HTML5',
  'Node.js',
  'Webpack',
  '性能优化',
  '用户体验',
  '移动端',
  '响应式设计',
  '工程化',
  '组件库',
])

// 标签颜色
const tagColors = [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
]

// 最近动态
const recentActivities = ref([
  {
    id: 1,
    time: '2小时前',
    content: '发布了新文章《Vue 3.4 新特性详解》',
    icon: StarOutlined,
    color: '#1890ff',
  },
  {
    id: 2,
    time: '5小时前',
    content: '点赞了文章《TypeScript 泛型实战指南》',
    icon: LikeOutlined,
    color: '#52c41a',
  },
  {
    id: 3,
    time: '昨天',
    content: '关注了用户「React开发者」',
    icon: HeartOutlined,
    color: '#eb2f96',
  },
  {
    id: 4,
    time: '2天前',
    content: '评论了文章《前端性能优化最佳实践》',
    icon: MessageOutlined,
    color: '#faad14',
  },
])

// 热搜话题测试数据（增强版）
const hotTopics = ref([
  {
    title: 'Vue 3.4 Composition API 最佳实践',
    hot: '12.8w',
    time: '2小时前',
    isNew: true,
  },
  {
    title: 'TypeScript 5.0 新特性详解与实战',
    hot: '10.2w',
    time: '5小时前',
    isNew: false,
  },
  {
    title: 'Ant Design Vue 4.0 组件使用技巧',
    hot: '8.5w',
    time: '昨天',
    isNew: false,
  },
  {
    title: '前端性能优化策略深度分享',
    hot: '7.9w',
    time: '2天前',
    isNew: false,
  },
  {
    title: 'React Hooks 原理与最佳实践',
    hot: '6.3w',
    time: '3天前',
    isNew: false,
  },
  {
    title: 'Webpack 5 模块联邦实战指南',
    hot: '5.7w',
    time: '1周前',
    isNew: false,
  },
  {
    title: '微前端架构设计与落地实践',
    hot: '4.2w',
    time: '2周前',
    isNew: false,
  },
])

// 推荐用户
const recommendUsers = ref([
  {
    id: 1,
    name: 'React专家',
    avatar: '/avatar/user1.jpg',
    description: 'React技术专家，专注于hooks和性能优化',
    isVip: true,
  },
  {
    id: 2,
    name: 'TypeScript爱好者',
    avatar: '/avatar/user2.jpg',
    description: 'TypeScript深度用户，分享TS实战经验',
    isVip: false,
  },
  {
    id: 3,
    name: '全栈工程师',
    avatar: '/avatar/user3.jpg',
    description: '前后端通吃，专注于系统架构设计',
    isVip: true,
  },
  {
    id: 4,
    name: 'UI设计师',
    avatar: '/avatar/user4.jpg',
    description: '专注用户体验设计，分享设计思维',
    isVip: false,
  },
])

// ... existing code ...
const userRoleMap: Record<string, string> = {
  user: '普通用户',
  admin: '管理员',
  ban: '封禁用户',
}

const genderMap: Record<number, string> = {
  0: '女',
  1: '男',
  2: '保密',
}

const getUserRoleText = (role: string | undefined): string => {
  if (!role) return '普通用户'
  return userRoleMap[role] || role
}

const getUserRoleColor = (role: string | undefined): string => {
  if (!role) return 'blue'
  return userRoleMap[role] === '管理员' ? 'red' : 'blue'
}

const getGenderText = (gender: number | string | undefined): string => {
  if (gender === undefined || gender === null) return '未设置性别'
  if (typeof gender === 'number') {
    return genderMap[gender] || gender.toString()
  }
  const genderNum = parseInt(gender, 10)
  if (!isNaN(genderNum) && genderMap[genderNum]) {
    return genderMap[genderNum]
  }
  return gender
}

const goToEditProfile = () => {
  if (user.value?.id) {
    router.push(`/user/edit/${user.value.id}`)
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '未设置'
  return dayjs(dateString).format('YYYY-MM-DD')
}

const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return '未设置'
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}

const formatBirthday = (dateString: string | undefined) => {
  if (!dateString) return '未设置生日'
  return dayjs(dateString).format('YYYY-MM-DD')
}

const getRankClass = (index: number) => {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return 'rank-normal'
}

const fetchUserInfo = async () => {
  try {
    const userId = route.params.id as string
    if (!userId) {
      user.value = mockUser as API.UserVO
      return
    }
    const res = await getUserVoByIdUsingGet({ id: userId })
    if (res.data.code === 0 && res.data.data) {
      user.value = res.data.data
    } else {
      user.value = mockUser as API.UserVO
      message.warning('获取用户信息失败，显示模拟数据')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    user.value = mockUser as API.UserVO
    message.warning('获取用户信息失败，显示模拟数据')
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
#userCenterPage {
  width: 100%;
  padding: 24px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.user-profile-card {
  margin-bottom: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.avatar-section {
  position: relative;
  display: flex;
  justify-content: center;
}

.user-avatar {
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.avatar-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.user-basic-info {
  padding: 8px 0;
}

.user-name-role {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.user-name {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.role-tag {
  font-size: 14px;
  padding: 4px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.user-level {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.user-profile {
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 20px 0;
  opacity: 0.9;
}

.empty-profile {
  font-style: italic;
  opacity: 0.7;
}

.user-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

.user-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.meta-icon {
  opacity: 0.8;
}

.content-area {
  margin-top: 24px;
}

.info-card,
.activity-card,
.recent-activity-card,
.hot-topics-card,
.recommend-card,
.tags-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.info-card :deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
}

.info-value {
  font-weight: 500;
  color: #1890ff;
}

.info-tag {
  margin: 0;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.activity-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.activity-info {
  flex: 1;
}

.activity-number {
  font-size: 20px;
  font-weight: 700;
  color: #262626;
}

.activity-label {
  font-size: 14px;
  color: #8c8c8c;
}

.recent-activity-card :deep(.ant-timeline-item) {
  padding-bottom: 16px;
}

.activity-time {
  color: #8c8c8c;
  font-size: 12px;
  margin-right: 8px;
}

.activity-content {
  color: #262626;
  font-weight: 500;
}

.topic-list-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.topic-list-item:last-child {
  border-bottom: none;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topic-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.rank-first {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.rank-second {
  background: linear-gradient(135deg, #feca57, #ff9ff3);
  color: white;
}

.rank-third {
  background: linear-gradient(135deg, #48dbfb, #0abde3);
  color: white;
}

.rank-normal {
  background: #f0f0f0;
  color: #666;
}

.topic-title {
  flex: 1;
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
}

.topic-title:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.new-badge {
  background: #ff4d4f;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}

.topic-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topic-hot {
  color: #ff4d4f;
  font-weight: 600;
}

.topic-time {
  color: #8c8c8c;
  font-size: 12px;
}

.recommend-item {
  padding: 12px 0;
}

.recommend-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommend-name {
  font-weight: 600;
  color: #262626;
}

.recommend-desc {
  color: #8c8c8c;
  font-size: 12px;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin: 0;
  border: none;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
}

@media (max-width: 1200px) {
  .user-meta-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  #userCenterPage {
    padding: 16px 0;
  }

  .user-name {
    font-size: 24px;
  }

  .user-stats {
    gap: 16px;
  }

  .stat-number {
    font-size: 20px;
  }

  .user-meta-grid {
    grid-template-columns: 1fr;
  }

  .content-area {
    flex-direction: column;
  }

  .content-area > [class*='col-'] {
    width: 100%;
  }

  .activity-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}

/* 动画效果 */
.user-profile-card {
  animation: slideInUp 0.6s ease-out;
}

.info-card,
.activity-card,
.recent-activity-card,
.hot-topics-card,
.recommend-card,
.tags-card {
  animation: fadeIn 0.8s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
