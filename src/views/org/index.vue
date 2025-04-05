<template>
  <div class="page-container">
    <PageHeader 
      :title="route.query.title" 
      :show-add="true"
      @add="handleAdd" 
    />

    <div class="search-bar">
      <el-input
        v-model="pageState.searchKey"
        placeholder="请输入搜索关键词"
        clearable
        class="search-input"
        @input="handleSearch"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleReset">重置</el-button>
        </template>
      </el-input>
    </div>
 
    <PageList
      :list="pageList"
      :loading="pageState.loading"
      :has-more="pageState.hasMore"
      key-field="orgId"
    >
      <template #item="{ item }">
        <div class="list-item" @click="handleEdit(item)">
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
      </template>
    </PageList>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'  
import { useRouter, useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue' 
import { ElMessage } from 'element-plus'
import { postRequest } from "../../utils/api"
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import PageList from '../../components/PageList.vue'

const router = useRouter()
const route = useRoute()  

const pageList = ref([])
const pageState = reactive({
  loading: false,
  pageNum: 1,
  pageSize: 10,
  total: 0,
  hasMore: true,
  searchKey: '',
  from: route.query.from || ''
})

const fetchPageList = async () => {
  if (pageState.loading || !pageState.hasMore) return
  try {
    pageState.loading = true
    let orgType = ""
    if (pageState.from === 'stoin') {
      orgType = "1,3"
    } else if (pageState.from === 'order') {
      orgType = "2,3"
    }
    const params = {
      pageNum: pageState.pageNum,
      pageSize: pageState.pageSize,
      searchKey: pageState.searchKey,
      orgType: orgType
    }
    const resp = await postRequest('/version/ht/org/list', params)
    if (resp?.data?.code === 0 && resp.data.data) {
      const { records = [], total = 0 } = resp.data.data
      pageState.total = total
      pageState.pageNum === 1 ? pageList.value = records : pageList.value.push(...records)
      pageState.hasMore = pageList.value.length < total
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
  pageList.value = []
  fetchPageList()
}

const handleAdd = () => router.push('/org/form')

const handleEdit = (item) => {
  if (route.query.select === 'true') {
    localStorage.setItem('selectedOrg', JSON.stringify({
      orgId: item.orgId,
      orgName: item.orgName,
      orgCode: item.orgCode
    }))
    router.back()
  } else {
    localStorage.setItem('pageListState', JSON.stringify({
      targetId: item.orgId,
      pageState: pageState,
      pageList: pageList.value
    }))
    router.push(`/org/form?id=${item.orgId}`)
  }
}

const handleReset = () => {
  pageState.searchKey = ''
  handleSearch()
}

const { scrollToTarget } = useInfiniteScroll({
  loading: pageState.loading,
  hasMore: pageState.hasMore,
  fetchData: fetchPageList
})

onMounted(async () => {
  const savedState = localStorage.getItem('pageListState')
  if (savedState) {
    const state = JSON.parse(savedState)
    pageList.value = state.pageList
    Object.assign(pageState, state.pageState) 
    if (state.targetId) {
      await scrollToTarget(state.targetId)
    } else {
      await fetchPageList()
    }
    localStorage.removeItem('pageListState')
  } else {
    await fetchPageList()
  }
})
 
</script>

<style scoped>

.page-container {
  min-height: 100vh;
  padding-top: 48px;
  background-color: #f5f7fa;
}

.search-bar {
  padding: 15px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.list-area {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
}

.list-item {
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
}

.list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.item-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.item-name {
  color: #2c3e50;
  font-size: 16px;
  font-weight: bold;
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

:deep(.search-input .el-input-group__append) {
  padding: 0;
}

:deep(.search-input .el-input-group__append .el-button) {
  height: 36px;
  padding: 0 10px;
  margin: 0;
  border: none;
}

</style>