<template>
  <div class="page-container">
    <div class="header">
      <el-icon class="header-icon" @click="handleBack"><ArrowLeft /></el-icon>
      <h1>高级搜索</h1>
      <el-icon class="header-icon" @click="handleSearch"><Search /></el-icon>
    </div>

    <div class="search-content">
      <el-form ref="formRef" :model="searchForm" label-width="100px">
        <el-form-item label="关键词">
          <el-input 
            v-model="searchForm.searchKey" 
            placeholder="请输入搜索关键词"
            clearable
          />
        </el-form-item>

        <el-form-item label="收支类型">
          <el-select v-model="searchForm.payType" placeholder="请选择收支类型" style="width: 100%">
            <el-option label="全部" value="" />
            <el-option label="收入" value="1" />
            <el-option label="支出" value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </el-form-item>

        <el-form-item label="供货商">
          <div class="category-select" @click="handleSelectOrg">
            <span v-if="searchForm.orgName">{{ searchForm.orgName }}</span>
            <span v-else class="placeholder">请选择供货商</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Search } from '@element-plus/icons-vue'

const router = useRouter()
const dateRange = ref([])

const searchForm = reactive({
  searchKey: '',
  startDate: '',
  endDate: '',
  payType: '',
  orgId: '',
  orgName: ''
})

const handleDateChange = (val) => {
  if (val) {
    [searchForm.startDate, searchForm.endDate] = val
  } else {
    searchForm.startDate = ''
    searchForm.endDate = ''
  }
}

const handleBack = () => {
  router.back()
}

const handleSearch = () => {
  localStorage.setItem('accountSearchParams', JSON.stringify(searchForm))
  router.back()
}

const handleSelectOrg = () => {
  router.push({
    path: '/org',
    query: { 
      select: 'true',
      from: 'account'
    }
  })
}

// 检查是否有从选择页面返回的数据
const selectedOrg = localStorage.getItem('selectedOrg')
if (selectedOrg) {
  const org = JSON.parse(selectedOrg)
  searchForm.orgId = org.orgId
  searchForm.orgName = org.orgName
  localStorage.removeItem('selectedOrg')
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
  top: 0;
  left: 0;
  right: 0;
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

.search-content {
  padding: 16px;
}

.category-select {
  width: 100%;
  height: 32px;
  line-height: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.category-select:hover {
  border-color: #409eff;
}

.placeholder {
  color: #a8abb2;
}

:deep(.el-form) {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
</style>