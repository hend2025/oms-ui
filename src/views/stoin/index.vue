<template>
  <div class="page-container">
    <div class="header">
      <el-icon class="header-icon" @click="handleBack"><ArrowLeft /></el-icon>
      <h1>物料采购</h1>
      <el-icon class="header-icon" @click="handleAdd"><Plus /></el-icon>
    </div>

    <div class="search-bar">
      <el-input
        v-model="pageState.searchKey"
        placeholder="请输入搜索关键词"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleReset">重置</el-button>
          <el-divider direction="vertical" />
          <el-button @click="handleMoreSearch">更多</el-button>
        </template>
      </el-input>
    </div>

    <div class="list-area">
      <div v-for="item in stoinList" 
        :key="item.stoinId" 
        :data-id="item.stoinId"
        class="list-item"
        @click="handleEdit(item)"
      >
        <div class="item-header">
          <span class="item-title">{{ item.categoryName }}</span>
          <span class="item-code">{{ formatDate(item.stoinDate) }}</span>
        </div>
        <div class="item-info">
          <span>数量：{{ item.stoinCnt }}</span>
          <span>金额：{{ item.money }}元</span>
        </div>
        <div class="item-info">
          <span>供货商：{{ item.orgName }}</span>
        </div>
      </div>

      <div v-if="pageState.loading" class="loading-text">
        <el-icon class="loading"><Loading /></el-icon> 加载中...
      </div>
      <div v-else-if="stoinList.length === 0" class="empty-text">
        暂无数据
      </div>
      <div v-else-if="!pageState.hasMore" class="no-more-text">
        没有更多了
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue' 
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Search, Loading } from '@element-plus/icons-vue'
import { postRequest, getRequest } from "../../utils/api"  // 修改这行，添加一个层级

import dayjs from 'dayjs' 

const router = useRouter()
const stoinList = ref([])
const pageState = reactive({
  loading: false,
  pageNum: 1,
  pageSize: 10,
  hasMore: true,
  searchKey: '',
  startDate: '',
  endDate: '',
  categoryId: '',
  orgId: ''
})

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

onMounted(async () => {
  const savedState = localStorage.getItem('stoinListState')
  if (savedState) {
    const state = JSON.parse(savedState)
    Object.assign(pageState, {
      pageNum: 1,
      searchKey: state.searchKey || '',
      startDate: state.startDate || '',
      endDate: state.endDate || '',
      categoryId: state.categoryId || '',
      orgId: state.orgId || ''
    })
    
    // 循环加载数据直到目标页
    const targetPage = state.pageNum || 1
    while (pageState.pageNum <= targetPage && pageState.hasMore) {
      await loadData(pageState.pageNum === 1)
    }
    
    // 数据加载完成后恢复位置
    nextTick(() => {
      if (state.targetId) {
        const targetElement = document.querySelector(`[data-id="${state.targetId}"]`)
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'instant', block: 'center' })
        } else if (state.scrollPosition) {
          window.scrollTo({
            top: state.scrollPosition,
            behavior: 'instant'
          })
        }
      } else if (state.scrollPosition) {
        window.scrollTo({
          top: state.scrollPosition,
          behavior: 'instant'
        })
      }
      localStorage.removeItem('stoinListState')
    })
  } else {
    const searchParams = localStorage.getItem('stoinSearchParams')
    if (searchParams) {
      const params = JSON.parse(searchParams)
      Object.assign(pageState, params)
      localStorage.removeItem('stoinSearchParams')
    }
    await loadData(true)
  }
  window.addEventListener('scroll', handleScroll)
})

const loadData = async (isRefresh = false) => {
  if (pageState.loading || (!isRefresh && !pageState.hasMore)) return
  
  try {
    pageState.loading = true
    if (isRefresh) {
      pageState.pageNum = 1
      pageState.hasMore = true
    }
    
    const params = {
      pageNum: pageState.pageNum,
      pageSize: pageState.pageSize,
      searchKey: pageState.searchKey,
      startDate: pageState.startDate,
      endDate: pageState.endDate,
      categoryId: pageState.categoryId,
      orgId: pageState.orgId
    }
     
    const resp = await postRequest('/version/ht/matterStoin/list', params)
    if (resp?.data?.code === 0 && resp.data.data) {
      const { records = [], total = 0 } = resp.data.data
      if (isRefresh) {
        stoinList.value = records
      } else {
        stoinList.value.push(...records)
      }
      pageState.hasMore = stoinList.value.length < total
      if (pageState.hasMore) pageState.pageNum++
    } else {
      ElMessage.error(resp?.data?.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    pageState.loading = false
  }
}

const handleSearch = () => {
  loadData(true)
}

const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop
  const clientHeight = document.documentElement.clientHeight
  const scrollHeight = document.documentElement.scrollHeight
  
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    loadData()
  }
}

const handleBack = () => {
  router.back()
}

const handleAdd = () => {
  router.push('/stoin/form')
}

const handleEdit = (item) => {
  localStorage.setItem('stoinListState', JSON.stringify({
    pageNum: pageState.pageNum,
    searchKey: pageState.searchKey,
    startDate: pageState.startDate,
    endDate: pageState.endDate,
    categoryId: pageState.categoryId,
    orgId: pageState.orgId,
    list: stoinList.value,
    scrollPosition: document.documentElement.scrollTop || document.body.scrollTop,
    targetId: item.stoinId
  }))
  router.push(`/stoin/form?id=${item.stoinId}`)
}

const handleMoreSearch = () => {
  router.push('/stoin/search')
}

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
// 在 script setup 中添加 handleReset 方法
const handleReset = () => {
  Object.assign(pageState, {
    searchKey: '',
    startDate: '',
    endDate: '',
    categoryId: '',
    orgId: ''
  })
  loadData(true)
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-top: 56px;
}

.header {
  background: linear-gradient(135deg, #2d6eb2 0%, #75b2f7 100%);
  padding: 16px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed; 
  top: 0; left: 0; right: 0;       
  z-index: 100;   
}

.header h1 { 
  margin: 0; 
  font-size: 18px; 
  font-weight: 500; 
}

.header-icon {
  font-size: 20px;
  cursor: pointer;
}

.search-bar {
  padding: 16px;
  background: #fff;
}

.list-area { 
  padding: 16px;
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
}

.list-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.3s;
}

.list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
}

.item-title { 
  font-weight: 600; 
  font-size: 16px; 
  color: #303133; 
}

.item-code {
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.item-info {
  display: flex;
  justify-content: space-between;
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.item-info:last-child {
  margin-bottom: 0;
}

.loading-text, .no-more-text, .empty-text {
  text-align: center;
  color: #909399;
  padding: 16px;
  font-size: 14px;
}

.empty-text { 
  padding: 40px 16px; 
}

.loading-text .loading { 
  animation: rotating 2s linear infinite; 
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

:deep(.el-divider--vertical) {
  border-left: 2px solid #dcdfe6;
  margin: 0 8px;
  height: 1.5em;
}
</style>