<template>
  <div class="page-container">
    <div class="header">
      <el-icon class="header-icon" @click="handleBack"><ArrowLeft /></el-icon>
      <h1>{{ route.query.title }}</h1>
    </div>
    
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="时间">
          <div class="date-picker-group">
            <el-date-picker
              v-model="startDate"
              type="month"
              placeholder="请选择开始年月"
              value-format="YYYY-MM" 
              class="custom-height"
              @change="handleDateChange"
            />
            <el-date-picker
              v-model="endDate"
              type="month"
              placeholder="请选择结束年月" 
              value-format="YYYY-MM" 
              class="custom-height"
              @change="handleDateChange"
            />
          </div>
        </el-form-item>
      </el-form>
    </div>

    <div class="summary-card">
      <div class="summary-item">
        <div class="summary-label">总收入</div>
        <div class="summary-value income">￥{{ totalIncome }}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">总支出</div>
        <div class="summary-value expense">￥{{ totalPay }}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">结余</div>
        <div class="summary-value" :class="{ 'income': totalIncome - totalPay > 0, 'expense': totalIncome - totalPay < 0 }">
          ￥{{ totalIncome - totalPay }}
        </div>
      </div>
    </div>

    <div class="list-area">
      <div v-for="item in accountList" 
        :key="item.month" 
        :data-id="item.month"
        class="list-item"
        @click="handleItemClick(item)"
      >
        <div class="item-header">
          <span class="item-title">{{ item.month }}</span>
          <span class="item-title" :class="{ 'income': item.inCome - item.pay > 0, 'expense': item.inCome - item.pay < 0 }">
               ￥{{ item.inCome - item.pay }}
          </span>
        </div>
        <div class="item-info">
          <span>支出：￥{{ item.pay}}</span>
          <span>收入：￥{{ item.inCome}}</span>
        </div>  
      </div>

      <div v-if="loading" class="loading-text">
        <el-icon class="loading"><Loading /></el-icon> 加载中...
      </div>
      <div v-else-if="accountList.length === 0" class="empty-text">
        暂无数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue' 
import { useRouter,useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Loading,ArrowRight } from '@element-plus/icons-vue'
import { postRequest } from "../../utils/api"
import dayjs from 'dayjs' 

const route = useRoute() 
const router = useRouter()
const accountList = ref([])
const startDate = ref('')  
const endDate = ref('')  
const totalIncome = ref(0)
const totalPay = ref(0)
const loading = ref(false)

onMounted(async () => {
  startDate.value = dayjs().subtract(11, 'month').format('YYYY-MM')
  endDate.value = dayjs().format('YYYY-MM')
  await loadData(true)
})

const loadData = async (isRefresh = false) => {
  try {
    loading.value = true
    const params = { 
      startDate: startDate.value + '-01',
      endDate: endDate.value + '-' + dayjs(endDate.value).daysInMonth()
    }
    const resp = await postRequest('/version/ht/account/accountTotal', params)
    if (resp?.data?.code === 0 && resp.data.data) {
      accountList.value = resp.data.data
      if (isRefresh) {
        totalIncome.value = accountList.value.reduce((sum, item) => sum + (Number(item.inCome) || 0), 0)
        totalPay.value = accountList.value.reduce((sum, item) => sum + (Number(item.pay) || 0), 0)
      }
    } else {
      ElMessage.error(resp?.data?.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleDateChange = () => {
  loadData(true)
}

const handleBack = () => {
  router.back()
}

const handleItemClick = (item) => {
  localStorage.setItem('accountSearchParams', JSON.stringify({
    startDate: item.month + '-01',
    endDate: item.month + '-' + dayjs(item.month).daysInMonth()
  }))
  router.push('/account')
  router.push({
    path: '/account',
    query: {   
        from: 'total',
        startDate: item.month + '-01',
        endDate: item.month + '-' + dayjs(item.month).daysInMonth() 
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
  margin: 0 auto; 
  font-size: 18px; 
  font-weight: 500; 
}

.header-icon {
  font-size: 20px;
  cursor: pointer;
}

.search-bar {
  padding: 20px 15px 0px 15px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
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

.item-info {
  display: flex;
  justify-content: space-between;
  color: #606266;
  font-size: 14px;
}

.item-actions {
  position: relative;
  padding-right: 40px;
}

.item-actions {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #bfbfbf;
}

.arrow-icon {
  font-size: 16px;
}

.item-actions:hover {
  color: #1890ff;
}

.loading-text, .empty-text {
  text-align: center;
  color: #909399;
  padding: 16px;
  font-size: 14px;
}

.loading-text .loading { 
  animation: rotating 2s linear infinite; 
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.income {
  color: #eb2424 !important; 
}

.expense {
  color: rgb(60, 60, 230) !important;  
}

.summary-card {
  margin: 16px 16px 0px 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.summary-item {
  text-align: center;
}

.summary-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-input__wrapper) {
  width: 80px !important;
}

.date-picker-group {
  display: flex;
  gap: 10px;
}

:deep(.date-picker-group .el-input) {
  width: 150px !important;
}

:deep(.date-picker-group .el-input__wrapper) {
  width: 150px !important;
}

:deep(.date-picker-group .el-input__inner) {
  padding: 0 8px;
}

</style>