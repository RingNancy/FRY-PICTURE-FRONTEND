<template>
  <div class="sidebar-info">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <a-spin />
      <div class="loading-text">加载中...</div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && !picture" class="empty-state">
      <div class="empty-icon">
        <PictureOutlined />
      </div>
      <p class="empty-text">请选择一张图片查看详情</p>
    </div>

    <!-- 图片名称和分辨率 -->
    <div v-if="!loading && picture" class="info-section name-section">
      <div class="picture-name">{{ picture?.name || '未命名' }}</div>
      <div class="picture-resolution">{{ picture?.picWidth }}x{{ picture?.picHeight }}</div>
    </div>

    <!-- 标签信息 -->
    <div v-if="!loading && picture?.tags?.length" class="info-section tags-section">
      <div class="tags-container">
        <a-tag v-for="tag in picture.tags" :key="tag" color="blue" class="tag-item">
          {{ tag }}
        </a-tag>
      </div>
    </div>

    <!-- 图片属性 -->
    <div v-if="!loading && picture" class="info-section properties-section">
      <!-- 作者信息 -->
      <div class="property-item author-item">
        <div class="author-info">
          <a-avatar :src="picture?.user?.userAvatar" size="small" class="author-avatar" />
          <span class="author-name">{{ picture?.user?.userName || '未知用户' }}</span>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="property-item stats-item">
        <EyeOutlined class="stats-icon" />
        <span class="stats-label">浏览数</span>
        <span class="property-value">{{ picture?.viewNum || 0 }}</span>
      </div>
      <div class="property-item stats-item">
        <LikeOutlined class="stats-icon" />
        <span class="stats-label">点赞数</span>
        <span class="property-value">{{ picture?.thumbNum || 0 }}</span>
      </div>
      <div class="property-item stats-item">
        <DownloadOutlined class="stats-icon" />
        <span class="stats-label">下载数</span>
        <span class="property-value">{{ picture?.favourNum || 0 }}</span>
      </div>

      <!-- 其他属性 -->
      <div class="property-item">
        <span class="property-label">类别：</span>
        <span class="property-value">{{ picture?.category || '-' }}</span>
      </div>
      <div class="property-item">
        <span class="property-label">格式：</span>
        <span class="property-value">{{ picture?.picFormat || '-' }}</span>
      </div>
      <div class="property-item">
        <span class="property-label">大小：</span>
        <span class="property-value">{{ formatSize(picture?.picSize) }}</span>
      </div>
      <div class="property-item">
        <span class="property-label">上传时间：</span>
        <span class="property-value">{{ formatTime(picture?.createTime) }}</span>
      </div>
    </div>

    <!-- 工具栏 -->
    <div v-if="!loading && picture" class="info-section tools-section">
      <div class="tool-buttons">
        <a-button v-if="canEdit" type="primary" class="tool-btn" @click="handleEdit">
          <EditOutlined />
          编辑
        </a-button>
        <a-button v-if="canDownload" class="tool-btn" @click="handleDownload">
          <DownloadOutlined />
          下载
        </a-button>
        <a-button v-if="canDelete" danger class="tool-btn" @click="handleDelete">
          <DeleteOutlined />
          删除
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  DownOutlined,
  RightOutlined,
  LeftOutlined,
  PictureOutlined,
  EyeOutlined,
  LikeOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import {
  deletePictureUsingPost,
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
} from '@/api/pictureController.ts'
import { downloadImage, formatSize, isPictureOwnerOrAdmin } from '@/utils'
import router from '@/router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

// 定义组件属性
const props = defineProps<{
  pictureId?: string | number
}>()

// 组件事件
const emit = defineEmits<{
  edit: []
  download: []
  delete: []
}>()

// 图片数据
const picture = ref<API.PictureVO | null>(null)

// 加载状态
const loading = ref(false)

// 权限控制
const canEdit = ref(false)
const canDelete = ref(false)
const canDownload = ref(false)

// 格式化时间
const formatTime = (time?: string) => {
  if (!time) return '未知'
  return new Date(time).toLocaleDateString('zh-CN')
}

// 获取图片详情
const fetchPictureDetail = async () => {
  if (!props.pictureId) {
    picture.value = null
    canEdit.value = false
    canDelete.value = false
    canDownload.value = false
    return
  }

  loading.value = true
  try {
    // 直接将ID作为字符串传递给API，避免数字转换导致的精度丢失
    const res = await getPictureVoByIdUsingGet({
      id: String(props.pictureId),
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
      // 检查编辑/删除权限（仅创建者或管理员）
      const hasEditDeletePermission = await isPictureOwnerOrAdmin(Number(props.pictureId))
      canEdit.value = hasEditDeletePermission
      canDelete.value = hasEditDeletePermission

      // 检查下载权限（只需登录用户）
      const loginUserStore = useLoginUserStore()
      await loginUserStore.fetchLoginUser()
      const currentUser = loginUserStore.loginUser
      canDownload.value = !!currentUser.id
    } else {
      message.error('获取图片详情失败，' + res.data.message)
      picture.value = null
      canEdit.value = false
      canDelete.value = false
      canDownload.value = false
    }
  } catch (e: any) {
    message.error('获取图片详情失败：' + e.message)
    picture.value = null
    canEdit.value = false
    canDelete.value = false
    canDownload.value = false
  } finally {
    loading.value = false
  }
}

// 监听图片ID变化
watch(
  () => props.pictureId,
  () => {
    fetchPictureDetail()
  },
  { immediate: true },
)

// 处理编辑操作
const handleEdit = () => {
  if (picture.value?.id) {
    router.push(`/edit_picture/${picture.value.id}`)
  } else {
    message.warning('无法编辑图片，缺少图片ID')
  }
}

// 处理下载操作
const handleDownload = () => {
  // 检查用户是否登录
  const loginUserStore = useLoginUserStore()
  const currentUser = loginUserStore.loginUser

  if (!currentUser.id) {
    // 未登录，跳转到登录页面
    message.warning('请先登录后再下载图片')
    router.push('/user/login')
    return
  }

  downloadImage(picture.value?.url)
}

// 处理删除操作
const handleDelete = async () => {
  const id = picture.value?.id
  if (!id) {
    return
  }

  // 显示确认对话框
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这张图片吗？此操作不可恢复。',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await deletePictureUsingPost({ id })
        if (res.data.code === 0) {
          message.success('删除成功')
          // 可以在这里添加删除成功后的回调，比如刷新页面或返回上一页
        } else {
          message.error('删除失败，' + res.data.message)
        }
      } catch (error: any) {
        message.error('删除失败：' + error.message)
      }
    },
    onCancel() {
      // 用户取消删除操作
    },
  })
}
</script>

<style scoped>
.sidebar-info {
  height: 100%;
  overflow-y: auto;
  padding: 0;
  /* background-color: #ffffff; */
  /* border-left: 1px solid #f0f0f0; */
  /* border-right: 1px solid #f0f0f0; */
}

/* 图片名称和分辨率 */
.name-section {
  padding: 24px 16px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
  background-color: #fafafa;
}

.picture-name {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
  word-break: break-all;
}

.picture-resolution {
  font-size: 14px;
  color: #8c8c8c;
}

/* 标签容器 */
.tags-section {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin-bottom: 4px;
}

/* 属性部分 */
.properties-section {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.property-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 0;
}

.property-item:last-child {
  margin-bottom: 0;
}

.author-item {
  padding: 16px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  flex-shrink: 0;
}

.author-name {
  font-size: 16px;
  color: #262626;
  font-weight: 500;
}

/* 统计信息样式 */
.stats-item {
  background-color: #f0faff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #e6f7ff;
}

.stats-icon {
  font-size: 18px;
  color: #1890ff;
  margin-right: 8px;
}

.stats-label {
  font-size: 14px;
  color: #595959;
  flex: 1;
}

.property-value {
  color: #262626;
  font-size: 14px;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.property-label {
  color: #8c8c8c;
  font-size: 14px;
  flex-shrink: 0;
}

/* 工具栏 */
.tools-section {
  padding: 20px 16px;
}

.tool-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  font-size: 16px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.empty-text {
  color: #8c8c8c;
  font-size: 14px;
  margin: 0;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
}

.loading-text {
  margin-top: 16px;
  color: #8c8c8c;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar-info {
    padding: 8px;
  }

  .name-section,
  .tags-section,
  .properties-section,
  .tools-section {
    padding: 16px;
  }

  .tool-buttons {
    gap: 10px;
  }

  .tool-btn {
    height: 36px;
  }
}
</style>
