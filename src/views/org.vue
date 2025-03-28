<template>
  <div class="page-container">
    <div class="header">
      <el-icon class="back-icon" @click="handleBack"><ArrowLeft /></el-icon>
      <h1>机构管理</h1>
      <el-icon class="add-icon" @click="handleAdd"><Plus /></el-icon>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKey"
        placeholder="请输入搜索关键词"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>
 
    <div class="list-area">
      <div v-for="item in orgList" 
        :key="item.orgId" 
        class="purchase-item"
        @click="handleEdit(item)"
      >
        <div class="item-header">
          <span class="item-name">{{ item.orgName }}</span>
          <span class="item-name">{{ item.orgCode }}</span>
        </div>
        <div class="item-content">
          <div class="item-info">
            <span>联系人：{{ item.conerName || '-' }}</span>
            <span>电话：{{ item.conerTel || '-' }}</span>
          </div>
          <div class="item-info">
            <span>地址：{{ item.addr || '-' }}</span>
          </div>
        </div>
      </div> 
    </div>     

    <div v-if="pageState.loading" class="loading-text">
      <el-icon class="loading"><Loading /></el-icon>
      加载中...
    </div>
    <div v-if="!pageState.loading && !pageState.hasMore && orgList.length > 0" class="no-more-text">
      没有更多数据了
    </div>
    <div v-if="!pageState.loading && orgList.length === 0" class="empty-text">
      暂无数据
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'  
import { Search, ArrowLeft, Plus, Loading } from '@element-plus/icons-vue' 
import { useRouter } from 'vue-router'
import { postRequest } from "../utils/api"
import { ElMessage } from 'element-plus'

const router = useRouter()
const searchKey = ref('')
const orgList = ref([])
const pageState = reactive({
  loading: false,
  pageNum: 1,
  pageSize: 10,
  total: 0,
  hasMore: true
})

const fetchOrgList = async () => {
  if (pageState.loading || !pageState.hasMore) return
  try {
    pageState.loading = true
    const params = {
      keyword: searchKey.value,
      pageNum: pageState.pageNum,
      pageSize: pageState.pageSize
    }
    const resp = await postRequest('/version/ht/org/list', params)
    if (resp?.data?.code === 0 && resp.data.data) {
      const { records = [], total = 0 } = resp.data.data
      pageState.total = total
      pageState.pageNum === 1 ? orgList.value = records : orgList.value.push(...records)
      pageState.hasMore = orgList.value.length < total
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

const handleSearch = () => {
  pageState.pageNum = 1
  pageState.hasMore = true
  orgList.value = []
  fetchOrgList()
}

const handleBack = () => router.back()
const handleAdd = () => router.push('/orgForm')

const handleEdit = (item) => {
  localStorage.setItem('orgListState', JSON.stringify({
    pageNum: pageState.pageNum,
    scrollPosition: document.documentElement.scrollTop || document.body.scrollTop,
    keyword: searchKey.value,
    list: orgList.value
  }))
  router.push(`/orgForm?id=${item.orgId}`)
}

onMounted(async () => {
  const savedState = localStorage.getItem('orgListState')
  if (savedState) {
    const state = JSON.parse(savedState)
    pageState.pageNum = 1
    searchKey.value = state.keyword || ''
    orgList.value = state.list || []
    nextTick(() => {
      setTimeout(() => {
        window.scrollTo({
          top: state.scrollPosition,
          behavior: 'instant'
        })
        localStorage.removeItem('orgListState')
      }, 100)
    })
  } else {
    await fetchOrgList()
  }
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => window.removeEventListener('scroll', handleScroll))

const handleScroll = () => {
  const { scrollHeight, scrollTop, clientHeight } = document.documentElement
  if (!pageState.loading && pageState.hasMore && (scrollHeight - scrollTop - clientHeight) <= 50) {
    fetchOrgList()
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}
.header {
  background: linear-gradient(135deg, #2d6eb2 0%, #75b2f7 100%);
  padding: 16px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: fixed; 
  top: 0; left: 0; right: 0;       
  z-index: 100;   
}
.header h1 { margin: 0; font-size: 18px; font-weight: 500; }
.back-icon, .add-icon {
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}
.back-icon:hover, .add-icon:hover { transform: scale(1.1); }
.search-bar {
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-top: 60px;   
}
.list-area { display: flex; flex-direction: column; gap: 16px; padding: 16px; }
.purchase-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
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
.item-name { font-weight: bold; font-size: 16px; color: #2c3e50; }
.item-content { display: flex; flex-direction: column; gap: 12px; }
.item-info {
  display: flex;
  justify-content: space-between;
  color: #606266;
  font-size: 14px;
}
.loading-text, .no-more-text, .empty-text {
  text-align: center;
  color: #909399;
  padding: 16px 0;
  font-size: 14px;
}
.empty-text { padding: 40px 0; }
.loading-text .loading { animation: rotating 2s linear infinite; }
@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>