<template>
  <a-modal
    v-model:open="modalVisible"
    title="批量添加图片"
    @ok="handleOk"
    @cancel="handleCancel"
    :confirm-loading="confirmLoading"
  >
    <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item
        label="关键词"
        name="searchText"
        :rules="[{ required: true, message: '请输入关键词!' }]"
      >
        <a-input v-model:value="form.searchText" placeholder="请输入搜索关键词" />
      </a-form-item>
      <a-form-item
        label="数量"
        name="count"
        :rules="[{ required: true, message: '请输入数量!' }]"
      >
        <a-input-number
          v-model:value="form.count"
          placeholder="请输入要获取的图片数量"
          :min="1"
          :max="20"
          style="width: 100%"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureByBatchUsingPost } from '@/api/pictureController'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const modalVisible = ref(false)
const confirmLoading = ref(false)

// 表单数据
const form = ref({
  searchText: '',
  count: 5
})

// 监听visible属性变化
watch(
  () => props.visible,
  (newVal) => {
    modalVisible.value = newVal
  }
)

// 监听modalVisible变化并触发update事件
watch(modalVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 确认按钮处理
const handleOk = async () => {
  if (!form.value.searchText) {
    message.warning('请输入关键词')
    return
  }

  if (!form.value.count || form.value.count < 1 || form.value.count > 20) {
    message.warning('请输入有效的数量（1-20之间）')
    return
  }

  confirmLoading.value = true
  try {
    const res = await uploadPictureByBatchUsingPost({
      searchText: form.value.searchText,
      count: form.value.count
    })

    if (res.data.code === 0) {
      message.success(`成功添加 ${res.data.data} 张图片`)
      // 重置表单
      form.value = {
        searchText: '',
        count: 5
      }
      // 关闭模态框
      modalVisible.value = false
      // 触发成功事件
      emit('success')
    } else {
      message.error('批量添加失败: ' + (res.data.message || '未知错误'))
    }
  } catch (error: any) {
    console.error('批量添加失败:', error)
    message.error('批量添加失败: ' + (error.message || '网络错误'))
  } finally {
    confirmLoading.value = false
  }
}

// 取消按钮处理
const handleCancel = () => {
  modalVisible.value = false
  // 重置表单
  form.value = {
    searchText: '',
    count: 5
  }
}
</script>

<style scoped></style>