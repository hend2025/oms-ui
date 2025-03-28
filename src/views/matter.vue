<template>
  <div class="category">
    <div class="header">
      <el-icon class="back-icon" @click="handleBack"><ArrowLeft /></el-icon>
      <h1>页面实例</h1>
      <el-icon class="add-icon" @click="handleAdd"><Plus /></el-icon>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKey"
        placeholder="请输入搜索关键词"
        clearable
        :prefix-icon="Search"
      >
        <template #append>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
 
    <div class="list-area">
      <div v-for="item in categoryList" 
      :key="item.matterId" 
           class="purchase-item"
           @click="handleEdit(item)">
        <div class="item-header">
          <span class="item-name">{{ item.matterName }}</span>
          <span class="item-name">{{ item.matterCode }}</span>
        </div>
        <div class="item-content">
          <div class="item-info">
            <span>{{ item.aliasName }}</span>
            <span>{{ item.matterPara }}</span>
          </div>
        </div>
      </div> 
    </div>     

    <!-- 加载和提示信息移到这里 -->
    <div v-if="pageState.loading" class="loading-text">
      <el-icon class="loading"><Loading /></el-icon>
      加载中...
    </div>
    <div v-if="!pageState.loading && !pageState.hasMore && categoryList.length > 0" class="no-more-text">
      没有更多数据了
    </div>
    <div v-if="!pageState.loading && categoryList.length === 0" class="empty-text">
      暂无数据
    </div>
    
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'  
import { Search, ArrowLeft, Plus, Loading } from '@element-plus/icons-vue' 
import { useRouter } from 'vue-router'
import { postRequest } from "../utils/api"
import { throttle } from 'lodash-es'

const router = useRouter()
const searchKey = ref('')
const categoryList = ref([])

const pageState = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  hasMore: true,
  loading: false
})

const fetchCategoryList = async () => {
  if (pageState.loading || !pageState.hasMore) return
  try {
    pageState.loading = true
    const params = {
      keyword: searchKey.value,
      pageNum: pageState.pageNum,
      pageSize: pageState.pageSize
    }
    const resp = await postRequest('/version/ht/matter/list', params) 
    if (resp?.data?.code !== 0) {
      throw new Error(resp.data?.message || '获取数据失败')
    }
    const { records = [], total = 0 } = resp.data.data
    pageState.total = total
    if (pageState.pageNum === 1) {
      categoryList.value = records
    } else {
      const existingIds = new Set(categoryList.value.map(item => item.matterId))
      categoryList.value.push(...records.filter(item => !existingIds.has(item.matterId)))
    }
    pageState.hasMore = categoryList.value.length < total
    if (pageState.hasMore) {
      pageState.pageNum++
    } 
  } catch (error) {
    console.error('获取列表失败:', error)
  } finally {
    pageState.loading = false
  }
}

const handleScroll = throttle(() => {
  const { scrollHeight, scrollTop, clientHeight } = document.documentElement
  if (scrollHeight - scrollTop - clientHeight < 500) {
    fetchCategoryList()
  }
}, 200)

onMounted(() => {
  fetchCategoryList()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(searchKey, () => {
  pageState.pageNum = 1
  pageState.hasMore = true
  categoryList.value = []
  fetchCategoryList()
})

const handleBack = () => {
  router.back()
}

const handleAdd = () => {
  router.push('/matterForm')  
}

const handleEdit = (item) => {
  router.push(`/matterForm?id=${item.matterId}`)  
}
</script>

<style scoped>

.category {
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
  top: 0;         
  left: 0;       
  right: 0;       
  z-index: 100;   
}

.search-bar {
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-top: 60px;   
}

.header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.back-icon, .add-icon {
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.back-icon:hover, .add-icon:hover {
  transform: scale(1.1);
}

.search-bar {
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.list-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

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

.loading-text,
.no-more-text,
.empty-text {
  text-align: center;
  color: #909399;
  padding: 16px 0;
  font-size: 14px;
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
