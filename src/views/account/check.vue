<template>
  <div class="page-container">
    <div class="header">
      <el-icon class="header-icon" @click="handleBack"><ArrowLeft /></el-icon>
      <h1>{{ route.query.title }}</h1>
    </div>

    <div class="search-bar">
      <div class="date-picker-group">
            <el-date-picker
              v-model="pageState.startDate"
              type="month"
              placeholder="请选择开始年月"
              value-format="YYYY-MM" 
              class="custom-height"
            />
            <el-date-picker
              v-model="pageState.endDate"
              type="month"
              placeholder="请选择结束年月" 
              value-format="YYYY-MM" 
              class="custom-height"
            />
      </div>
      <div class="search-row">
        <el-input
          v-model="pageState.searchKey"
          placeholder="请输入客户或供应商"
          clearable
          class="search-input"
          readonly
          @click="handleOrgSelect"
        >
          <template #append>
            <el-button @click="handleReset">重置</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <div class="list-area">
      <div v-for="item in accountList" 
        :key="item.orgId" 
        :data-id="item.orgId"
        class="list-item" @click="handleItemClick(item)">
        <div class="item-header">
          <span class="item-title">{{ item.orgName }}</span>
          <div class="amount-wrapper">
            <span class="balance-type" :class="{ 'income': item.balance > 0, 'expense': item.balance < 0 }">
              {{ item.balance > 0 ? '应收' : '应付' }}
            </span>
            <span class="item-title" :class="{ 'income': item.balance > 0, 'expense': item.balance < 0 }">
              ￥{{ item.balance > 0 ? item.balance : 0 - item.balance }}
            </span>
          </div>
        </div>
        <div class="item-info">
          <span>{{ item.conerName}}</span>
          <span>{{ item.conerTel}}</span>
        </div>  
      </div>

      <div v-if="pageState.loading" class="loading-text">
        <el-icon class="loading"><Loading /></el-icon> 加载中...
      </div>
      <div v-else-if="accountList.length === 0" class="empty-text">
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
import { useRouter,useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Search, Loading } from '@element-plus/icons-vue'
import { postRequest } from "../../utils/api"
import dayjs from 'dayjs' 

const route = useRoute() 
const router = useRouter()
const accountList = ref([])
const pageState = reactive({
  loading: false,
  pageNum: 1,
  pageSize: 10,
  hasMore: true,
  searchKey: '',
  startDate: dayjs().subtract(11, 'month').format('YYYY-MM'),
  endDate: dayjs().format('YYYY-MM'),
  payType: '',
  orgId: '',
})

onMounted(async () => {
  await loadData(true)
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
      startDate: pageState.startDate + '-01',
      endDate: pageState.endDate + '-' + dayjs(pageState.endDate).daysInMonth(),
      payType: pageState.payType,
      orgId: pageState.orgId
    }
     
    const resp = await postRequest('/version/ht/account/accountSum', params)
    if (resp?.data?.code === 0 && resp.data.data) {
      const records = resp.data.data
      const total = records.length
      if (isRefresh) {
        accountList.value = records
      } else {
        accountList.value.push(...records)
      }
      pageState.hasMore = accountList.value.length < total
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
 
const handleReset = () => {
  Object.assign(pageState, {
    searchKey: '',
    startDate: dayjs().subtract(11, 'month').format('YYYY-MM'),
    endDate: dayjs().format('YYYY-MM'),
    payType: '',
    orgId: ''
  })
  loadData(true)
}

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleOrgSelect = () => {
  router.push({
    path: '/org',
    query: { select: 'true', from: 'check' }
  })
}

const handleItemClick = (item) => {
  router.push({
    path: '/account/checkDetail',
    query: { 
      title: '对账明细',
      orgId: item.orgId,
      orgName: item.orgName,
      startDate: pageState.startDate + '-01',
      endDate: pageState.endDate + '-' + dayjs(pageState.endDate).daysInMonth(),
      stoinMoney: item.payable,
      stoinPay: item.paid,
      orderMoney: item.receivable,
      orderPay: item.received,
      balance: item.balance,
    }
  })
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-top: 48px;
}

.header {
  background: linear-gradient(135deg, #2d6eb2 0%, #75b2f7 100%);
  padding: 16px;
  color: white;
  display: flex;
  align-items: center;
  position: fixed; 
  top: 0; 
  left: 0; 
  right: 0;       
  z-index: 100;   
}

.header h1 { 
  flex: 1;
  text-align: center;
  margin: 0; 
  font-size: 18px; 
  font-weight: 500; 
}

.header-icon {
  font-size: 20px;
  cursor: pointer;
}

.search-bar {
  padding: 15px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.search-row {
  display: flex;
  gap: 6px; 
  align-items: center;
}

:deep(.el-select) {
  width: 100px;
}

:deep(.el-select .el-input__wrapper),
:deep(.search-input .el-input__wrapper),
:deep(.search-input .el-input-group__append .el-button) {
  height: 36px;
  line-height: 36px;
  box-sizing: border-box;
}

:deep(.search-input .el-input__wrapper),
:deep(.search-input .el-input-group__append .el-button) {
  height: 36px;
  line-height: 36px;
  box-sizing: border-box;
}

:deep(.el-input-group__append) {
  padding: 0;
  display: flex;
  align-items: center;
}

:deep(.el-divider--vertical) {
  height: 20px;
  margin: 0 8px;
}

.search-input {
  flex: 1;
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
  font-size: 14px; 
  color: #303133; 
}

.item-code {
  font-size: 14px;
  color: #909399;
  font-weight: 600;
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

:deep(.el-select .el-input__wrapper) {
  height: 36px;
  line-height: 36px;
}

:deep(.el-select .el-input__inner) {
  height: 36px;
  line-height: 36px;
}

:deep(.search-input .el-input__inner) {
  height: 36px;
  line-height: 36px;
}

:deep(.search-input .el-input-group__append) {
  padding: 0;
}

:deep(.search-input .el-input-group__append .el-button) {
  height: 36px;
  margin: 0;
  padding: 0 10px;
  border: none;
}

:deep(.search-input .el-input-group__append .el-divider--vertical) {
  margin: 0;
}

.income {
  color: #eb2424 !important; 
}

.expense {
  color:rgb(60, 60, 230) !important;  
}

.date-picker-group {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
}

:deep(.date-picker-group .el-input) {
  width: 50% !important;
}

:deep(.date-picker-group .el-input__wrapper) {
  width: 50% !important;
}

:deep(.date-picker-group .el-input__inner) {
  padding: 0 8px;
}
:deep(.el-input__wrapper) {
  width: 80px !important;
}

.amount-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.balance-type {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.balance-type.income {
  background-color: #ffebeb;
}

.balance-type.expense {
  background-color: #e6e6fa;
}
</style>