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
      </template>
      <div class="tableBlock">
        <a-table
          :columns="columns"
          :data-source="dataList"
          :pagination="pagination"
          :loading="loading"
          @change="doTableChange"
          :row-key="(record) => record.id"
        >
          <template #headerCell="{ column }">
            <template v-if="column.dataIndex === 'id'">
              <span> ID </span>
            </template>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'url'">
              <a-image :src="record.url" :width="120" />
            </template>
            <!-- 标签 -->
            <template v-if="column.dataIndex === 'tags'">
              <a-space wrap>
                <a-tag v-for="tag in parseTags(record.tags)" :key="tag">{{ tag }}</a-tag>
              </a-space>
            </template>
            <!-- 图片信息 -->
            <template v-if="column.dataIndex === 'picInfo'">
              <div>格式：{{ record.picFormat || 'N/A' }}</div>
              <div>宽度：{{ record.picWidth || 'N/A' }}</div>
              <div>高度：{{ record.picHeight || 'N/A' }}</div>
              <div>宽高比：{{ record.picScale !== undefined ? record.picScale : 'N/A' }}</div>
              <div>
                大小：{{ record.picSize ? (record.picSize / 1024).toFixed(2) + 'KB' : 'N/A' }}
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'createTime'">
              {{ formatTime(record.createTime) }}
            </template>
            <template v-else-if="column.dataIndex === 'editTime'">
              {{ formatTime(record.editTime) }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { deletePictureUsingPost, listPictureByPageUsingPost } from '@/api/pictureController.ts'
import dayjs from 'dayjs'
import {
  SmileOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import router from '@/router'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'url',
    key: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    key: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
    key: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
    key: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    key: 'picInfo',
  },
  {
    title: '用户 ID',
    dataIndex: 'userId',
    key: 'userId',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
    key: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
  },
]

// 数据
const dataList = ref<API.Picture[]>([])
const total = ref(0)
const loading = ref(false)

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

// 处理新增图片
const handleAddPicture = () => {
  router.push('/add_picture')
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
  padding: 24px 0;
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
</style>
