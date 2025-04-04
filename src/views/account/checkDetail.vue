<template>
  <div class="page-container">
    <div class="header">
      <el-icon class="header-icon" @click="handleBack"><ArrowLeft /></el-icon>
      <h1>{{ route.query.orgName }}</h1>
    </div>

    <div class="tab-container">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="汇总记录" name="total">
            <div class="summary-card">
              <div class="summary-item">
                <div class="summary-label">开始日期</div>
                <div class="summary-value">{{ formatDate(route.query.startDate) }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">结束日期</div>
                <div class="summary-value">{{ formatDate(route.query.endDate) }}</div>
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-item">
                <div class="summary-label">采购金额</div>
                <div class="summary-value expense">￥{{ route.query.stoinMoney }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">已付金额</div>
                <div class="summary-value expense">￥{{ route.query.stoinPay }}</div>
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-item">
                <div class="summary-label">订单金额</div>
                <div class="summary-value income">￥{{ route.query.orderMoney }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">已收金额</div>
                <div class="summary-value income">￥{{ route.query.orderPay }}</div>
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-item">
                <div class="summary-label">{{ route.query.balance > 0 ? '应收金额' : '应付金额' }}</div>
                <div class="summary-value" :class="{ 'income': route.query.balance > 0, 'expense': route.query.balance < 0 }">
                  ￥{{ route.query.balance > 0 ? route.query.balance : 0 - route.query.balance }}
                </div>
              </div>
            </div>
            
          </el-tab-pane>

        <el-tab-pane label="采购记录" name="stoin">
          <div class="list-area">
            <div v-for="item in stoinList" 
              :key="item.stoinId" 
              class="list-item"
            >
              <div class="item-header">
                <span class="item-title">{{ item.categoryName }}</span>
                <span class="item-title">￥{{item.money  }}</span>
              </div>
              <div class="item-info">
                <span>数量：{{ item.stoinCnt}}</span>
                <span>{{  formatDate(item.stoinDate) }}</span>
              </div>  
            </div>

            <div v-if="loading.stoin" class="loading-text">
              <el-icon class="loading"><Loading /></el-icon> 加载中...
            </div>
            <div v-else-if="stoinList.length === 0" class="empty-text">
              暂无数据
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="出库记录" name="order">
          <div class="list-area">
            <div v-for="item in orderList" 
              :key="item.orderId" 
              class="list-item"
            >
              <div class="item-header">
                <span class="item-title">{{ item.categoryName }}</span>
                <span class="item-title">￥{{item.money  }}</span>
              </div>
              <div class="item-info">
                <span>数量：{{ item.orderCnt}}</span>
                <span>{{  formatDate(item.orderDate) }}</span>
              </div>  
            </div>

            <div v-if="loading.order" class="loading-text">
              <el-icon class="loading"><Loading /></el-icon> 加载中...
            </div>
            <div v-else-if="orderList.length === 0" class="empty-text">
              暂无数据
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="收支记录" name="account">
          <div class="list-area">
            <div v-for="item in accountList" 
              :key="item.accountId" 
              class="list-item account-item"
            >
              <div class="item-header no-border">
                <div class="account-left">
                  <span class="account-date">{{ formatDate(item.accountDate) }}</span>
                </div>
                <div class="amount-wrapper">
                  <span class="balance-type" :class="{ 'income': item.payType === '1', 'expense': item.payType === '2' }">
                    {{ item.payType === '1' ? '收款' : '付款' }}
                  </span>
                  <span class="amount" :class="{ 'income': item.payType === '1', 'expense': item.payType === '2' }">
                    ￥{{ item.money }}
                  </span>
                </div>
              </div>  
            </div>

            <div v-if="loading.account" class="loading-text">
              <el-icon class="loading"><Loading /></el-icon> 加载中...
            </div>
            <div v-else-if="accountList.length === 0" class="empty-text">
              暂无数据
            </div>
          </div>
        </el-tab-pane>

      </el-tabs>
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

const totalData = reactive({
  stoinMoney: 0,
  stoinPay: 0,
  orderMoney: 0,
  orderPay: 0,
  balance: 0
})

const route = useRoute() 
const router = useRouter()

const handleBack = () => {
  router.back()
}

const activeTab = ref('total')
const stoinList = ref([])
const orderList = ref([])
const accountList = ref([])
const loading = reactive({
  stoin: false,
  order: false,
  account: false
})

onMounted(async () => {
  await loadData(activeTab.value)
})

const loadData = async (tab) => {
  if(tab === 'total'){
    return
  }

  if (loading[tab]) return
  
  try {
    loading[tab] = true
    const params = {
      orgId: route.query.orgId,
      startDate: route.query.startDate,
      endDate: route.query.endDate
    }
    
    let url = ''
    switch(tab) {
      case 'stoin':
        url = '/version/ht/matterStoin/list'
        break
      case 'order':
        url = '/version/ht/order/list'
        break
      case 'account':
        url = '/version/ht/account/list'
        break
    }
    
    const resp = await postRequest(url, params)
    if (resp?.data?.code === 0 && resp.data.data) {
      const { records = [] } = resp.data.data
      switch(tab) {
        case 'stoin':
          stoinList.value = records
          break
        case 'order':
          orderList.value = records
          break
        case 'account':
          accountList.value = records
          break
      }
    } else {
      ElMessage.error(resp?.data?.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading[tab] = false
  }
}

const handleTabClick = (tab) => {
  loadData(tab.props.name)
}

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
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

.summary-card {
  margin: 0 0 16px 0;
  padding: 20px;
  background: white;
  border-radius: 12px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.summary-item {
  text-align: center;
  flex: 1;
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
  padding: 16px 5px;
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
  border-bottom: 1px solid #eee;  /* 添加底部分隔线 */
}

.list-item:last-child {
  border-bottom: none;  /* 最后一项不需要分隔线 */
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

.tab-container {
  padding: 16px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
}

.account-item {
  padding: 12px 16px;
}

.account-item .item-header {
  padding-bottom: 0;
  border-bottom: none;
  margin-bottom: 0;
}

.account-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-date {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.account-remark {
  font-size: 13px;
  color: #909399;
}

.amount {
  font-size: 16px;
  font-weight: 600;
}

.amount-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.balance-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.balance-type.income {
  background-color: #ffebeb;
}

.balance-type.expense {
  background-color: #e6e6fa;
}
</style>