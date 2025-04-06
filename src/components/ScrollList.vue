<template>
  <div class="list-area" ref="scrollContainer" @scroll="handleScroll">
    <div v-for="(item, index) in items" 
         :key="itemKey ? item[itemKey] : index" 
         :data-id="item[itemKey]"
         class="list-item-wrapper"
         @click="handleItemClick(item)">
      <slot name="item" :item="item" :index="index">
      </slot>
    </div>
    
    <div v-if="loading" class="loading-text">
      <el-icon class="loading"><Loading /></el-icon>
      加载中...
    </div>
    <div v-if="finished" class="no-more-text">
      没有更多数据了
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, onUnmounted } from 'vue'

const props = defineProps({
  // 数据加载方法，需返回 Promise
  loadFn: {
    type: Function,
    required: true
  },
  // 唯一键值字段名
  itemKey: {
    type: String,
    default: 'id'
  },
  // 是否立即加载
  immediate: {
    type: Boolean,
    default: true
  },
  // 滚动到底部阈值（像素）
  threshold: {
    type: Number,
    default: 50
  },
  // 保持滚动位置的唯一标识
  scrollKey: {
    type: String,
    default: 'defaultScrollKey'
  }
})

const emit = defineEmits(['item-click', 'scroll', 'update:modelValue'])

const scrollContainer = ref(null)
const items = ref([])
const page = ref(1)
const loading = ref(false)
const finished = ref(false)
const scrollTop = ref(0)

// 滚动位置存储
const saveScrollPosition = () => {
  sessionStorage.setItem(props.scrollKey, scrollTop.value)
}

// 恢复滚动位置
const restoreScrollPosition = () => {
  const savedPosition = sessionStorage.getItem(props.scrollKey)
  if (savedPosition) {
    scrollContainer.value.scrollTop = parseInt(savedPosition)
    sessionStorage.removeItem(props.scrollKey)
  }
}

// 加载数据
const loadData = async () => {
  if (loading.value || finished.value) return
  
  loading.value = true
  try {
    const result = await props.loadFn(page.value)
    
    if (result.data.length === 0) {
      finished.value = true
      return
    }
    
    items.value = [...items.value, ...result.data]
    page.value++
    
    if (result.total && items.value.length >= result.total) {
      finished.value = true
    }
  } finally {
    loading.value = false
  }
}

// 重置列表
const reset = () => {
  items.value = []
  page.value = 1
  finished.value = false
  loading.value = false
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
}

// 处理滚动事件
const handleScroll = (e) => {
  const container = scrollContainer.value
  scrollTop.value = container.scrollTop
  
  // 触发滚动事件
  emit('scroll', {
    scrollTop: container.scrollTop,
    scrollHeight: container.scrollHeight,
    clientHeight: container.clientHeight
  })

  // 滚动到底部检测
  if (container.scrollHeight - container.scrollTop <= container.clientHeight + props.threshold) {
    loadData()
  }
}

// 处理点击事件
const handleItemClick = (item) => {
  saveScrollPosition()
  emit('item-click', item)
}

// 生命周期
onMounted(() => {
  if (props.immediate) loadData()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

onActivated(() => {
  restoreScrollPosition()
  const savedState = localStorage.getItem('formEditSave')
  if (savedState) {
    const state = JSON.parse(savedState)
    const index = items.value.findIndex(item => item[props.itemKey] === state[props.itemKey])
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...state }
    }
    localStorage.removeItem('formEditSave')
  }
})

// 暴露方法
defineExpose({
  reset,
  reload: () => {
    reset()
    loadData()
  }
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