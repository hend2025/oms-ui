<template>
  <div>

    <div class="list-area">
      <div v-for="item in list" 
        :key="item[keyField]"
        :data-id="item[keyField]"
        class="list-item-wrapper"
        @click="savePageState(item)"
      >
        <slot name="item" :item="item"></slot>
      </div>
    </div>

    <div v-if="loading" class="loading-text">
      <el-icon class="loading"><Loading /></el-icon>
      加载中...
    </div>
    <div v-if="!loading && !hasMore && list.length > 0" class="no-more-text">
      没有更多数据了
    </div>
    <div v-if="!loading && list.length === 0" class="empty-text">
      暂无数据
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const props = defineProps({
  fetchApi: {
    type: Function,
    required: true
  },
  queryParams: {
    type: Object,
    default: () => ({})
  },
  keyField: {
    type: String,
    default: 'id'
  }
})

const emit = defineEmits(['update:list'])

const list = ref([])
const pageState = reactive({
  loading: false,
  hasMore: true,
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 监听查询参数变化
watch(() => props.queryParams, () => {
  refresh()
}, { deep: true })

const fetchData = async () => {
  if (pageState.loading || !pageState.hasMore) return
  try {
    pageState.loading = true
    const params = {
      pageNum: pageState.pageNum,
      pageSize: pageState.pageSize,
      ...props.queryParams
    }
    const resp = await props.fetchApi(params)
    if (resp?.data?.code === 0 && resp.data.data) {
      const { records = [], total = 0 } = resp.data.data
      pageState.total = total
      const newList = pageState.pageNum === 1 ? records : [...list.value, ...records]
      list.value = newList
      emit('update:list', newList)  // 向父组件同步数据
      pageState.hasMore = list.value.length < total
      if (pageState.hasMore) pageState.pageNum++
    } else {
      ElMessage.error(resp?.data?.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取列表失败:', error)
    ElMessage.error('获取数据失败')
    pageState.hasMore = false
  } finally {
    pageState.loading = false
  }
}

const refresh = () => {
  pageState.pageNum = 1
  pageState.hasMore = true
  list.value = []
  emit('update:list', [])
  fetchData()
}

// 滚动加载
const handleScroll = () => {
  const { scrollHeight, scrollTop, clientHeight } = document.documentElement
  if (!pageState.loading && pageState.hasMore && (scrollHeight - scrollTop - clientHeight) <= 50) {
    fetchData()
  }
}

// 滚动到目标位置
const scrollToTarget = async (targetId) => {
  const targetElement = document.querySelector(`[data-id="${targetId}"]`)
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'instant', block: 'center' })
  }
}

const savePageState = (item) => {
  localStorage.setItem('pageListState', JSON.stringify({
      targetId: item[props.keyField],
      pageState: pageState,
      queryParams: props.queryParams,
      list: list.value
  }))
}

onMounted(() => {
  const savedState = localStorage.getItem('pageListState')
  if (savedState) {
    const state = JSON.parse(savedState)
    list.value = state.list
    Object.assign(pageState, state.pageState) 
    if (state.targetId) {
      scrollToTarget(state.targetId)
    } else {
      fetchData()
    }
    localStorage.removeItem('pageListState')
  } else {
    fetchData()
  }
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

defineExpose({
  refresh,
  scrollToTarget,
  pageState
})
</script>

<style scoped>
.list-area {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
}

.loading-text,
.no-more-text,
.empty-text {
  padding: 16px 0;
  color: #909399;
  font-size: 14px;
  text-align: center;
}

.empty-text {
  padding: 40px 0;
}

.loading-text .loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>