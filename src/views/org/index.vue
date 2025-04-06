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
        @input="refreshList"
        @clear="refreshList"
        @keyup.enter="refreshList"
      >
        <template #append>
          <el-button @click="handleReset">重置</el-button>
        </template>
      </el-input>
    </div>

    <ScrollList 
      ref="scrollListRef"
      :load-fn="fetchData"
      item-key="orgId"
      @item-click="handleItemClick"
   >
    <template #item="{ item }">
        <div class="list-item">
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

  </ScrollList>

</div> 
</template>

<script setup>
import { ref, reactive,  onMounted } from 'vue' 
import { useRouter, useRoute } from 'vue-router'
import { postRequest } from "../../utils/api"
import ScrollList from '../../components/ScrollList.vue'

const router = useRouter()
const route = useRoute()  

const scrollListRef = ref(null)
const pageState = reactive({
  searchKey: '',
  from: route.query.from || ''
})

const fetchData = async (pageNum) => {
  try {
    let orgType = ""
    if (pageState.from === 'stoin') {
      orgType = "1,3"
    } else if (pageState.from === 'order') {
      orgType = "2,3"
    }
    const params = { pageNum: pageNum, orgType, searchKey: pageState.searchKey }
    const resp = await postRequest('/version/ht/org/list', params)
    const { records = [], total = 0 } = resp.data.data
    return { data:records, total:total }
  } catch (error) {
    console.error('加载失败', error)
    return { data: [], total: 0 }
  }
}

const refreshList = () => {
  scrollListRef.value?.reload()
}

const handleReset = () => {
  pageState.searchKey = ''
  refreshList()
}

const handleItemClick = (item) => { 
  if (route.query.select === 'true') {
    localStorage.setItem('selectedOrg', JSON.stringify({
      orgId: item.orgId,
      orgName: item.orgName,
      orgCode: item.orgCode
    }))
    router.back()
  } else {
    router.push(`/org/form?id=${item.orgId}`)
  } 
}

const handleAdd = () => router.push('/org/form')

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