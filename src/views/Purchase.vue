<template>
  <div class="purchase">
    <div class="header">
      <div class="left">
        <el-button :icon="ArrowLeft" circle @click="handleBack" />
      </div>
      <div class="center">
        <h2 class="page-title">订单管理</h2>
      </div>
      <div class="right">
        <el-button :icon="Search" circle @click="toggleSearch" />
        <el-button type="primary" circle @click="handleAdd">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="search-area" v-show="showSearch">
      <div class="search-item">
        <div class="date-range">
          <el-date-picker
            v-model="queryParams.startDate"
            type="date"
            placeholder="开始日期"
            format="YYYY/MM/DD"
            value-format="YYYY/MM/DD"
          />
          <span class="date-separator">至</span>
          <el-date-picker
            v-model="queryParams.endDate"
            type="date"
            placeholder="结束日期"
            format="YYYY/MM/DD"
            value-format="YYYY/MM/DD"
          />
        </div>
      </div>
      <div class="search-item">
        <el-input
          v-model="queryParams.matterName"
          placeholder="物料名称"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
      <div class="search-item">
        <el-input
          v-model="queryParams.companyName"
          placeholder="供应商"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
      <div class="search-actions">
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
    </div>

    <div class="list-area">
      <div v-for="item in purchaseList" 
           :key="item.stoinId" 
           class="purchase-item">
        <div class="item-header">
          <span class="item-name">{{ item.matterName }}</span>
          <span class="item-date">{{ formatDate(item.stoinDate) }}</span>
        </div>
        <div class="item-content">
          <div class="item-info">
            <span>数量：{{ item.stoinCnt }}件</span>
            <span>金额：{{ item.money }}元</span>
          </div>
          <div class="item-supplier-row">
            <span class="item-supplier">{{ item.companyName }}</span>
            <el-button type="primary" link @click="handleEdit(item)">编辑</el-button>
          </div>
        </div>
      </div>
      <div v-if="pageState.loading" class="loading-text">加载中...</div>
      <div v-if="!pageState.hasMore" class="no-more-text">没有更多数据了</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'  
import { ElMessage } from 'element-plus'
import { Search, Plus, ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs' 
import { postRequest } from "../utils/api"
import { throttle } from 'lodash-es'

const router = useRouter()
const showSearch = ref(false)
const purchaseList = ref([])

const pageState = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  hasMore: true,
  loading: false,
  retryCount: 0,
  maxRetries: 3
})

const queryParams = reactive({
  startDate: dayjs().subtract(3, 'month').format('YYYY/MM/DD'),
  endDate: dayjs().format('YYYY/MM/DD'),
  matterName: '',
  companyName: ''
})

const fetchPurchaseList = async (isRetry = false) => {
  if (pageState.loading || !pageState.hasMore) return
  
  try {
    pageState.loading = true

    const params = {
      ...queryParams,
      pageNum: pageState.pageNum,
      pageSize: pageState.pageSize
    }

    const resp = await postRequest('/version/ht/matter/stoin/list', params)
    
    if (resp?.data?.code !== 0) {
      throw new Error(resp.data?.message || '获取数据失败')
    }

    const { records = [], total = 0 } = resp.data.data
    pageState.total = total
    
    if (pageState.pageNum === 1) {
      purchaseList.value = records
    } else {
      const existingIds = new Set(purchaseList.value.map(item => item.stoinId))
      purchaseList.value.push(...records.filter(item => !existingIds.has(item.stoinId)))
    }
    
    pageState.hasMore = purchaseList.value.length < total
    if (pageState.hasMore) {
      pageState.pageNum++
    }
    
    pageState.retryCount = 0
    
  } catch (error) {
    console.error('获取列表失败:', error)
    if (!isRetry && pageState.retryCount < pageState.maxRetries) {
      pageState.retryCount++
      await new Promise(resolve => setTimeout(resolve, 1000 * pageState.retryCount))
      return fetchPurchaseList(true)
    }
    ElMessage.error(error.message || '获取列表失败！')
  } finally {
    pageState.loading = false
  }
}

const handleScroll = throttle(() => {
  const { scrollHeight, scrollTop, clientHeight } = document.documentElement
  if (scrollHeight - scrollTop - clientHeight < 500) {
    fetchPurchaseList()
  }
}, 200)

const handleSearch = () => {
  pageState.pageNum = 1
  pageState.hasMore = true
  pageState.retryCount = 0
  showSearch.value = false
  purchaseList.value = []
  fetchPurchaseList()
}

const handleBack = () => router.push('/')
const handleAdd = () => router.push('/purchase/detail')
const toggleSearch = () => showSearch.value = !showSearch.value
const handleEdit = (item) => router.push({ path: '/purchase/detail', query: { id: item.stoinId } })

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

onMounted(() => {
  fetchPurchaseList()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.purchase {
  padding: 20px;
  position: relative;
  background: #f6f8fa;
  min-height: 100vh;
}

.header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.right {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  align-items: center;
}

.search-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: -10px 0 24px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  animation: slideDown 0.3s ease;
}

.search-item {
  width: 100%;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-separator {
  color: #606266;
}

.list-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.purchase-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.purchase-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.item-name, .item-date {
  font-weight: bold;
  font-size: 16px;
  color: #2c3e50;
}

.item-date {
  text-align: right;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-info {
  display: flex;
  justify-content: space-between;
  color: #606266;
  font-size: 14px;
}

.item-supplier-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-supplier {
  color: #909399;
  font-size: 14px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  font-weight: bold;
  text-align: center;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-text,
.no-more-text {
  text-align: center;
  color: #909399;
  padding: 16px 0;
  font-size: 14px;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.empty-text {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

.loading-text .loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>