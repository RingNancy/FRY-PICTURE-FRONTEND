<template>
  <div id="pictureManage">
    <a-card class="search-card" :bordered="false">
      <template #title>
        <span class="card-title">图片搜索</span>
      </template>
      <div class="searchBlock">
        <a-form layout="inline" :model="searchParams" @finish="doSearch">
          <a-form-item label="关键词" name="searchText">
            <a-input
              v-model:value="searchParams.searchText"
              placeholder="从名称和简介搜索"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="类型" name="category">
            <a-input v-model:value="searchParams.category" placeholder="请输入类型" allow-clear />
          </a-form-item>
          <a-form-item label="标签" name="tags">
            <a-select
              v-model:value="searchParams.tags"
              mode="tags"
              placeholder="请输入标签"
              style="min-width: 180px"
              allow-clear
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">
              <template #icon>
                <SearchOutlined />
              </template>
              搜索
            </a-button>
            <a-button style="margin-left: 12px" @click="resetSearch"> 重置 </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>

    <a-card class="table-card" :bordered="false">
      <template #title>
        <span class="card-title">图片列表</span>
      </template>
      <template #extra>
        <a-button type="primary" @click="handleAddPicture">
          <template #icon>
            <PlusOutlined />
          </template>
          新增图片
        </a-button>
        <a-button type="dashed" style="margin-left: 12px" @click="showBatchModal = true">
          <template #icon>
            <PlusOutlined />
          </template>
          批量添加
        </a-button>
      </template>
      <div class="tableBlock">
        <a-table
          :columns="columns"
          :data-source="dataList"
          :pagination="pagination"
          :loading="loading"
          @change="doTableChange"
          :row-key="(record) => record.id"
          :scroll="{ x: 1800 }"
        >
          <template #headerCell="{ column }">
            <template v-if="column.dataIndex === 'id'">
              <span> ID </span>
            </template>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'url'">
              <a-image
                :src="record.url"
                :width="100"
                :height="60"
                style="object-fit: cover; border-radius: 4px"
              />
            </template>
            <!-- 标签 -->
            <template v-if="column.dataIndex === 'tags'">
              <a-space wrap>
                <a-tag v-for="tag in parseTags(record.tags)" :key="tag" color="blue">{{
                  tag
                }}</a-tag>
              </a-space>
            </template>
            <!-- 图片信息 -->
            <template v-if="column.dataIndex === 'picInfo'">
              <div class="pic-info-item">
                <span class="info-label">格式:</span>
                <span class="info-value">{{ record.picFormat || 'N/A' }}</span>
              </div>
              <div class="pic-info-item">
                <span class="info-label">尺寸:</span>
                <span class="info-value"
                  >{{ record.picWidth || 'N/A' }}×{{ record.picHeight || 'N/A' }}</span
                >
              </div>
              <div class="pic-info-item">
                <span class="info-label">大小:</span>
                <span class="info-value">{{
                  record.picSize ? (record.picSize / 1024).toFixed(2) + 'KB' : 'N/A'
                }}</span>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'createTime'">
              {{ formatTime(record.createTime) }}
            </template>
            <template v-else-if="column.dataIndex === 'editTime'">
              {{ formatTime(record.editTime) }}
            </template>
            <!-- 审核信息 -->
            <template v-if="column.dataIndex === 'reviewMessage'">
              <div class="review-item">
                <span class="review-label">状态:</span>
                <span :class="getReviewStatusClass(record.reviewStatus)">
                  {{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}
                </span>
              </div>
              <div class="review-item" v-if="record.reviewMessage">
                <span class="review-label">信息:</span>
                <span class="review-value">{{ record.reviewMessage }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">审核人:</span>
                <a class="review-value">{{ reviewerNames[record.id] || '加载中...' }}</a>
              </div>
            </template>

            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button
                  v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
                  type="link"
                  size="small"
                  @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
                  class="action-pass"
                >
                  通过
                </a-button>
                <a-button
                  v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
                  type="link"
                  size="small"
                  @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
                  class="action-reject"
                >
                  拒绝
                </a-button>
                <a-button type="primary" size="small" @click="handleEdit(record)">
                  <template #icon>
                    <EditOutlined />
                  </template>
                  编辑
                </a-button>
                <a-button danger size="small" @click="doDelete(record.id)">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>
    
    <!-- 添加批量上传模态框组件 -->
    <UploadPictureByBatch 
      v-model:visible="showBatchModal" 
      @success="handleBatchSuccess" 
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  deletePictureUsingPost,
  listPictureByPageUsingPost,
  doPictureReviewUsingPost,
} from '@/api/pictureController.ts'
import { getUsernameById } from '@/utils'
import dayjs from 'dayjs'
import {
  SmileOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import router from '@/router'
import { PIC_REVIEW_STATUS_MAP, PIC_REVIEW_STATUS_ENUM } from '@/constants/picture.ts'

// 添加导入语句
import UploadPictureByBatch from '@/components/UploadPictureByBatch.vue'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
    fixed: 'left',
  },
  {
    title: '图片',
    dataIndex: 'url',
    key: 'url',
    width: 120,
    fixed: 'left',
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    key: 'introduction',
    width: 200,
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
    key: 'category',
    width: 120,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    key: 'tags',
    width: 200,
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    key: 'picInfo',
    width: 180,
  },
  {
    title: '上传用户',
    dataIndex: 'userId',
    key: 'userId',
    width: 120,
    customRender: ({ record }) => {
      return userNames[record.id] || '加载中...'
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
    key: 'editTime',
    width: 160,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
    key: 'reviewMessage',
    width: 250,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
  },
]

// 数据
const dataList = ref<API.Picture[]>([])
const total = ref(0)
const loading = ref(false)
// 控制批量添加模态框显示
const showBatchModal = ref(false)
// 用户名映射
const userNames = reactive<Record<number, string>>({})
const reviewerNames = reactive<Record<number, string>>({})

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

// 获取审核状态的样式类
const getReviewStatusClass = (status: number | undefined) => {
  if (status === PIC_REVIEW_STATUS_ENUM.PASS) {
    return 'status-pass'
  } else if (status === PIC_REVIEW_STATUS_ENUM.REJECT) {
    return 'status-reject'
  } else {
    return 'status-default'
  }
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await listPictureByPageUsingPost({
      ...searchParams,
    })
    if (res.data.code === 0 && res.data.data) {
      // 现在后端返回的是分页对象，需要正确处理
      dataList.value = res.data.data.records || []
      total.value = res.data.data.total || 0

      // 获取涉及的用户信息
      await fetchUsersInfo(dataList.value)
    } else {
      message.error('获取数据失败，' + (res.data.message || '未知错误'))
      dataList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    message.error('获取数据失败，请稍后重试')
    dataList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 批量获取用户信息
const fetchUsersInfo = async (pictures: API.Picture[]) => {
  // 创建获取用户名的Promise数组
  const userPromises: Promise<void>[] = []

  pictures.forEach((picture) => {
    // 获取上传用户名称
    if (picture.userId) {
      const userId = picture.userId
      const pictureId = picture.id!

      // 如果还没有获取过该用户名称，则添加获取任务
      if (!userNames[pictureId]) {
        userPromises.push(
          getUsernameById(userId).then((name) => {
            userNames[pictureId] = name
          }),
        )
      }
    }

    // 获取审核人名称
    if (picture.reviewerId) {
      const reviewerId = picture.reviewerId
      const pictureId = picture.id!

      // 如果还没有获取过该审核人名称，则添加获取任务
      if (!reviewerNames[pictureId]) {
        userPromises.push(
          getUsernameById(reviewerId).then((name) => {
            reviewerNames[pictureId] = name
          }),
        )
      }
    }
  })

  // 并行执行所有获取用户名的Promise
  await Promise.all(userPromises)
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

// 获取数据
const doSearch = () => {
  // 重置搜索条件
  searchParams.current = 1
  fetchData()
}

// 表格变化处理
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  searchParams.searchText = ''
  searchParams.category = ''
  searchParams.tags = []
  searchParams.current = 1
  fetchData()
}

// 删除数据
const doDelete = async (id: number) => {
  if (!id) {
    message.warning('无效的图片ID')
    return
  }

  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这张图片吗？此操作不可恢复',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await deletePictureUsingPost({ id })
        if (res.data.code === 0) {
          message.success('删除成功')
          // 刷新数据
          fetchData()
        } else {
          message.error('删除失败: ' + (res.data.message || '未知错误'))
        }
      } catch (error) {
        console.error('删除失败:', error)
        message.error('删除失败，请稍后重试')
      }
    },
  })
}

const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const res = await doPictureReviewUsingPost({
    id: record.id,
    reviewStatus,
    reviewMessage,
  })
  if (res.data.code === 0) {
    message.success('审核操作成功')
    // 重新获取列表
    fetchData()
  } else {
    message.error('审核操作失败，' + res.data.message)
  }
}

// 处理新增图片
const handleAddPicture = () => {
  router.push('/add_picture')
}

// 批量添加成功回调
const handleBatchSuccess = () => {
  // 重新获取数据
  fetchData()
}

// 处理编辑图片
const handleEdit = (record: API.Picture) => {
  // 这里应该跳转到编辑页面
  message.info('编辑功能待实现')
}

// 格式化时间的函数，增加安全检查
const formatTime = (time: string | undefined) => {
  if (!time) return 'N/A'
  try {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  } catch (error) {
    console.error('时间格式化错误:', error)
    return '无效时间'
  }
}

// 解析标签的函数，增加安全检查
const parseTags = (tags: string | undefined) => {
  if (!tags) return []
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('标签解析错误:', error)
    return []
  }
}
</script>
<style scoped>
#pictureManage {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.search-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.searchBlock {
  padding: 24px 0;
}

.searchBlock :deep(.ant-form-item) {
  margin-bottom: 12px;
}

.searchBlock :deep(.ant-form-item-label) {
  padding-right: 8px;
  padding-bottom: 0;
  line-height: 32px;
}

.searchBlock :deep(.ant-form-item-control-input) {
  min-height: 32px;
  line-height: 32px;
}

.tableBlock {
  padding: 16px 0;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr:hover) {
  background-color: #f5f7fa;
}

:deep(.ant-table) {
  border-radius: 4px;
}

.avatar-cell {
  display: flex;
  align-items: center;
}

.pic-info-item {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.pic-info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  width: 40px;
  display: inline-block;
}

.info-value {
  margin-left: 4px;
}

.review-item {
  margin-bottom: 4px;
  display: flex;
  align-items: flex-start;
}

.review-item:last-child {
  margin-bottom: 0;
}

.review-label {
  font-weight: 500;
  width: 50px;
  display: inline-block;
}

.review-value {
  margin-left: 4px;
  flex: 1;
  word-break: break-all;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 8px;
}

:deep(.ant-table-thead > tr > th) {
  padding: 12px 8px;
}

/* 审核状态样式 */
.status-pass {
  color: #52c41a;
  font-weight: 500;
}

.status-reject {
  color: #ff4d4f;
  font-weight: 500;
}

.status-default {
  color: #faad14;
  font-weight: 500;
}

/* 操作按钮样式 */
.action-pass {
  color: #52c41a !important;
}

.action-reject {
  color: #ff4d4f !important;
}

.action-pass:hover {
  color: #73d13d !important;
}

.action-reject:hover {
  color: #ff7875 !important;
}
</style>
