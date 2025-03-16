<template>
  <div class="purchase">
    <!-- 顶部操作栏 -->
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

    <!-- 搜索区域 -->
    <div class="search-area" v-show="showSearch">
      <div class="search-item">
        <div class="date-range">
          <el-date-picker
            v-model="startDate"
            type="date"
            placeholder="开始日期"
            format="YYYY/MM/DD"
            value-format="YYYY/MM/DD"
          />
          <span class="date-separator">至</span>
          <el-date-picker
            v-model="endDate"
            type="date"
            placeholder="结束日期"
            format="YYYY/MM/DD"
            value-format="YYYY/MM/DD"
          />
        </div>
      </div>
      <div class="search-item">
        <el-input
          v-model="matterNameKeyword"
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
          v-model="companyNameKeyword"
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

    <!-- 列表区域 -->
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
      <div v-if="loading" class="loading-text">加载中...</div>
      <div v-if="!hasMore" class="no-more-text">没有更多数据了</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'  
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs' 
import { postRequest, getRequest } from "../utils/api"

const router = useRouter()
const showSearch = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const startDate = ref(dayjs().subtract(3, 'month').format('YYYY/MM/DD'))
const endDate = ref(dayjs().format('YYYY/MM/DD'))
const matterNameKeyword = ref('')
const companyNameKeyword = ref('')
const purchaseList = ref([])

const loading = ref(false)
const hasMore = ref(true)
const isRequesting = ref(false)  // 添加请求状态控制

const fetchPurchaseList = async () => {
  if (loading.value || !hasMore.value || isRequesting.value) return
  loading.value = true
  isRequesting.value = true  // 设置请求状态

  let para = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    startDate: startDate.value,
    endDate: endDate.value,
    matterName: matterNameKeyword.value,
    companyName: companyNameKeyword.value
  }
  
  try {
    const resp = await postRequest('/version/ht/matter/stoin/list', para)
    if (resp.status === 200 && resp.data.code === 0) {
      const newRecords = resp.data.data.records || []
      const total = resp.data.data.total || 0
      
      // 检查是否有重复数据
      if (pageNum.value === 1) {
        purchaseList.value = newRecords
      } else {
        const existingIds = new Set(purchaseList.value.map(item => item.stoinId))
        const uniqueNewRecords = newRecords.filter(item => !existingIds.has(item.stoinId))
        purchaseList.value = [...purchaseList.value, ...uniqueNewRecords]
      }
      
      hasMore.value = purchaseList.value.length < total
      if (hasMore.value) {
        pageNum.value++
      }
    } else {
      ElMessage({ message: '获取列表失败：' + (resp.data?.message || resp.statusText), type: 'error' })
    }
  } catch (error) {
    console.error('获取列表失败:', error)
    ElMessage({ message: '获取列表失败！', type: 'error' })
  } finally {
    loading.value = false
    isRequesting.value = false  // 重置请求状态
    
    // 延迟检查是否需要加载下一页
    setTimeout(() => {
      if (hasMore.value && document.documentElement.scrollHeight <= document.documentElement.clientHeight) {
        fetchPurchaseList()
      }
    }, 100)
  }
}

// 优化滚动处理函数
const handleScroll = () => {
  const scrollHeight = document.documentElement.scrollHeight
  const scrollTop = document.documentElement.scrollTop
  const clientHeight = document.documentElement.clientHeight
  
  if (!loading.value && !isRequesting.value && hasMore.value && 
      scrollHeight - scrollTop - clientHeight < 500) {
    fetchPurchaseList()
  }
}

const handleSearch = () => {
  pageNum.value = 1
  hasMore.value = true
  showSearch.value = false
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
</style>