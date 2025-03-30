<template>
  <div class="form-edit">
    <div class="header">
      <el-icon class="back-icon" @click="router.back()"><ArrowLeft /></el-icon>
      <h1>更多搜索</h1>
    </div>

    <div class="form-container">
      <el-form 
        ref="formRef"
        :model="formData"
        label-width="80px"
      >
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="formData.startDate"
            type="date"
            placeholder="请选择开始日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            class="custom-height"
          />
        </el-form-item>

        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="formData.endDate"
            type="date"
            placeholder="请选择结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            class="custom-height"
          />
        </el-form-item>

        <el-form-item label="客户名称" prop="orgName">
          <div class="category-select" @click="handleOrgClick">
            <span v-if="formData.orgName">{{ formData.orgName }}</span>
            <span v-else class="placeholder">请选择客户名称</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </el-form-item>

        <el-form-item label="烟花名称" prop="categoryName">
          <div class="category-select" @click="handleCategoryClick">
            <span v-if="formData.categoryName">{{ formData.categoryName }}</span>
            <span v-else class="placeholder">请选择烟花名称</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </el-form-item>

        <el-form-item label="关键词" prop="searchKey">
          <el-input 
            v-model="formData.searchKey" 
            placeholder="请输入搜索关键词"
            class="custom-height" />
        </el-form-item>

        <div class="form-footer">
          <el-button type="primary" @click="handleSubmit">查询</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import dayjs from 'dayjs' 

const router = useRouter()
const formRef = ref(null)

const formData = reactive({
  searchKey: '',
  categoryId: '', 
  categoryName: '',
  startDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD'),
  orgId: '',
  orgName: '',
})

const handleCategoryClick = () => {
  localStorage.setItem('tempFormData', JSON.stringify(formData))
  router.push({
    path: '/category',
    query: { select: 'true', from: 'matter', busiType:  '2' }
  })
}

const handleOrgClick = () => {
  localStorage.setItem('tempFormData', JSON.stringify(formData))
  router.push({
    path: '/org',
    query: { select: 'true', from: 'order' }
  })
}

const handleSubmit = () => {
  localStorage.setItem('stoinSearchParams', JSON.stringify(formData))
  router.back()
}

onMounted(() => {
  const tempFormData = localStorage.getItem('tempFormData')
  if (tempFormData) {
    const savedData = JSON.parse(tempFormData)
    Object.assign(formData, savedData)
    localStorage.removeItem('tempFormData')
  }

  const selectedCategory = localStorage.getItem('selectedCategory')
  if (selectedCategory) {
    const category = JSON.parse(selectedCategory)
    formData.categoryId = category.categoryId
    formData.categoryName = category.categoryName  
    localStorage.removeItem('selectedCategory')
  }

  const selectedOrg = localStorage.getItem('selectedOrg')
  if (selectedOrg) {
    const org = JSON.parse(selectedOrg)
    formData.orgId = org.orgId
    formData.orgName = org.orgName
    localStorage.removeItem('selectedOrg')
  }
})

</script>

<style scoped>
.form-edit {
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
  margin: 0 auto;
  font-size: 18px;
  font-weight: 500;
}

.back-icon {
  font-size: 20px;
  cursor: pointer;
  position: absolute;
}

.form-container {
  padding: 20px 15px;
  background: #fff;
  margin: 10px;
  border-radius: 8px;
}

.form-footer {
  margin-top: 30px;
  text-align: center;
}

.category-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background-color: var(--el-input-bg-color, #fff);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  cursor: pointer;
  height: 42px;
  width: 100%;
  box-sizing: border-box;
}

.placeholder {
  color: var(--el-text-color-placeholder);
}

:deep(.custom-height) {
  height: 42px;
}

:deep(.custom-height .el-input__wrapper) {
  height: 42px;
}

:deep(.custom-height .el-input__inner) {
  height: 42px;
  line-height: 42px;
}
</style>
