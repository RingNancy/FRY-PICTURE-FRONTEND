import HomePage from '@/page/homePage.vue';
<template>
  <div id="homePage">
    <div class="header-section">
      <h1>FRY PICTURE</h1>
      <!-- 搜索框 -->
      <div class="search-bar">
        <a-input-search
          placeholder="从海量图片中搜索"
          v-model:value="searchParams.searchText"
          enter-button="搜索"
          size="large"
          @search="doSearch"
        />
      </div>
    </div>

    <!-- 分类 + 标签 + 文件类型筛选 -->
    <div class="filter-section">
      <a-tabs v-model:activeKey="selectedCategory" @change="doSearch">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
      </a-tabs>

      <div class="filter-bar">
        <div class="tag-filter">
          <span class="filter-label">标签：</span>
          <a-space :size="[0, 8]" wrap>
            <a-checkable-tag
              v-for="(tag, index) in tagList"
              :key="tag"
              v-model:checked="selectedTagList[index]"
              @change="doSearch"
            >
              {{ tag }}
            </a-checkable-tag>
          </a-space>
        </div>

        <div class="file-type-filter">
          <span class="filter-label">文件类型：</span>
          <a-space :size="[0, 8]" wrap>
            <a-checkable-tag
              v-for="type in fileTypeOptions"
              :key="type.value"
              v-model:checked="selectedFileTypes[type.value]"
              @change="doSearch"
            >
              {{ type.label }}
            </a-checkable-tag>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 图片列表 -->
    <a-list
      class="picture-list"
      :grid="{ gutter: 0, column: 4, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }"
      :data-source="dataList"
      :pagination="pagination"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item class="picture-list-item">
          <!-- 单张图片 -->
          <a-card hoverable class="picture-card" @click="doClickPicture(picture)">
            <template #cover>
              <div class="image-container">
                <img
                  :alt="picture.name"
                  :src="picture.url"
                  class="picture-image"
                  :style="{
                    aspectRatio:
                      picture.picWidth && picture.picHeight
                        ? picture.picWidth / picture.picHeight
                        : '1/1',
                  }"
                />
                <div class="image-format-badge">{{ picture.picFormat }}</div>
                <div class="image-overlay">
                  <div class="image-name">{{ picture.name }}</div>
                  <div class="image-dimensions">{{ picture.picWidth }}x{{ picture.picHeight }}</div>
                </div>
              </div>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import { useRouter } from 'vue-router'

// 数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 文件类型选项
const fileTypeOptions = [
  { label: 'JPEG', value: 'jpeg' },
  { label: 'PNG', value: 'png' },
  { label: 'GIF', value: 'gif' },
  { label: 'WEBP', value: 'webp' },
  { label: 'BMP', value: 'bmp' },
]

// 文件类型筛选
const selectedFileTypes = reactive<Record<string, boolean>>({
  jpeg: false,
  png: false,
  gif: false,
  webp: false,
  bmp: false,
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 12,
    total: total.value,
    showSizeChanger: false,
    // 切换页号时，会修改搜索参数并获取数据
    onChange: (page, pageSize) => {
      searchParams.current = page
      searchParams.pageSize = pageSize
      fetchData()
    },
  }
})

// 解析标签的函数
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

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

const doSearch = () => {
  // 重置搜索条件
  searchParams.current = 1
  fetchData()
}

const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<boolean[]>([])

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    // 转换成下拉选项组件接受的格式
    categoryList.value = res.data.data.categoryList ?? []
    tagList.value = res.data.data.tagList ?? []
    // 初始化选中状态数组
    selectedTagList.value = new Array(tagList.value.length).fill(false)
  } else {
    message.error('加载分类标签失败，' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

const fetchData = async () => {
  loading.value = true
  try {
    // 转换搜索参数
    const params = {
      ...searchParams,
      tags: [] as string[],
    }

    // 处理文件类型筛选
    const selectedTypes = Object.entries(selectedFileTypes)
      .filter(([_, isSelected]) => isSelected)
      .map(([type, _]) => type)

    if (selectedTypes.length > 0) {
      // 如果选择了多个文件类型，使用其中一个（根据API要求可能需要调整）
      params.picFormat = selectedTypes[0] // 或者根据API支持情况做相应处理
    }

    if (selectedCategory.value !== 'all') {
      params.category = selectedCategory.value
    }
    selectedTagList.value.forEach((useTag, index) => {
      if (useTag) {
        params.tags.push(tagList.value[index])
      }
    })

    const res = await listPictureVoByPageUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0
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

const router = useRouter()
// 跳转至图片详情
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/view_picture/${picture.id}`,
  })
}
</script>

<style scoped>
:deep(.ant-list-grid .ant-col > .ant-list-item) {
  padding: 2px 6px;
}
#homePage {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px);
}

#homePage .header-section {
  text-align: center;
  margin-bottom: 32px;
}

#homePage .header-section h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 24px;
}

#homePage .search-bar {
  max-width: 520px;
  margin: 0 auto;
}

#homePage .filter-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

#homePage .filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

#homePage .tag-filter {
  flex: 1;
  margin-right: 24px;
}

#homePage .file-type-filter {
  min-width: 200px;
}

#homePage .filter-label {
  font-weight: 500;
  margin-right: 8px;
  white-space: nowrap;
}

#homePage .picture-list {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

#homePage .picture-list-item {
  padding: 2px 6px;
}

#homePage .picture-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

#homePage .picture-info {
  padding: 12px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

#homePage .picture-title {
  font-weight: 500;
  margin-bottom: 8px;
  flex-grow: 1;
  display: flex;
  align-items: center;
}

#homePage .picture-category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

#homePage .picture-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

#homePage .image-container {
  position: relative;
  overflow: hidden;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

#homePage .picture-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

#homePage .picture-card:hover .picture-image {
  transform: scale(1.05);
}

#homePage .image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

#homePage .image-container:hover .image-overlay {
  transform: translateY(0);
}

#homePage .image-name {
  font-weight: 500;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#homePage .image-dimensions {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

#homePage .image-format-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

#homePage .image-card:hover .image-overlay {
  opacity: 1;
}

#homePage .ant-card-meta {
  margin-top: auto;
  padding: 12px;
}

#homePage .ant-card-actions {
  margin-top: auto;
}

@media (max-width: 768px) {
  #homePage {
    padding: 16px;
  }

  #homePage .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  #homePage .tag-filter {
    margin-right: 0;
    margin-bottom: 16px;
  }

  #homePage .filter-section {
    padding: 16px;
  }

  #homePage .picture-list {
    padding: 16px;
  }
}
</style>
