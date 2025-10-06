<template>
  <div id="userManage">
    <a-card class="search-card" :bordered="false">
      <template #title>
        <span class="card-title">用户搜索</span>
      </template>
      <div class="searchBlock">
        <a-form layout="inline" :model="searchParams" @finish="doSearch">
          <a-form-item label="账号">
            <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" />
          </a-form-item>
          <a-form-item label="用户名">
            <a-input v-model:value="searchParams.userName" placeholder="输入用户名" />
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
        <span class="card-title">用户列表</span>
      </template>
      <template #extra>
        <a-button type="primary" @click="handleAddUser">
          <template #icon>
            <PlusOutlined />
          </template>
          新增用户
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
              <span>
                <smile-outlined />
                ID
              </span>
            </template>
          </template>

          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'userName'">
              <a>
                {{ record.userName }}
              </a>
            </template>
            <template v-else-if="column.dataIndex === 'userAvatar'">
              <a-avatar :src="record.userAvatar" :size="40" shape="square" />
            </template>
            <template v-else-if="column.dataIndex === 'userRole'">
              <div v-if="record.userRole == 'admin'">
                <a-tag color="red">管理员</a-tag>
              </div>
              <div v-else>
                <a-tag color="blue">普通用户</a-tag>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'crateTime'">
              {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template v-else-if="column.dataIndex === 'updateTime'">
              {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
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

<script lang="ts" setup>
import {
  SmileOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { deleteUserUsingPost, listUserVoByPageUsingPost } from '@/api/userController.ts'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import router from '@/router'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    key: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    key: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
    key: 'userAvatar',
  },
  {
    title: '角色',
    dataIndex: 'userRole',
    key: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'crateTime',
    key: 'crateTime',
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
  },
]

// 数据
const dataList = ref<API.UserVO[]>([])
const total = ref(0)
const loading = ref(false)

// 搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await listUserVoByPageUsingPost({
      ...searchParams,
    })
    if (res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
  }
})

// 表格变化处理
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 获取数据
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  searchParams.userAccount = ''
  searchParams.userName = ''
  searchParams.current = 1
  fetchData()
}

// 删除数据
const doDelete = async (id: number) => {
  if (!id) {
    return
  }

  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个用户吗？此操作不可恢复',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await deleteUserUsingPost({ id })
        if (res.data.code === 0) {
          message.success('删除成功')
          // 刷新数据
          fetchData()
        } else {
          message.error('删除失败: ' + res.data.message)
        }
      } catch (error) {
        message.error('删除失败')
      }
    },
  })
}

// 处理新增用户
const handleAddUser = () => {
  message.info('新增用户功能待实现')
}

// 处理编辑用户
const handleEdit = (record: API.UserVO) => {
  router.push(`/admin/user/edit/${record.id}`)
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#userManage {
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
