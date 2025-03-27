<template>
  <div class="category-edit">
    <div class="header">
      <el-icon class="back-icon" @click="router.back()"><ArrowLeft /></el-icon>
      <h1>{{ isEdit ? '修改物料' : '新增物料' }}</h1>
      <el-icon v-if="isEdit" class="delete-icon" @click="handleDelete"><Delete /></el-icon>
    </div>

    <div class="form-container">
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
      <el-form-item label="分类名称" prop="categoryName" required>
          <div class="category-select" @click="handleCategoryClick">
            <span v-if="formData.categoryName">{{ formData.categoryName }}</span>
            <span v-else class="placeholder">请选择分类</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </el-form-item>

        <el-form-item label="物料名称" prop="matterName" required>
          <el-input v-model="formData.matterName" placeholder="请输入物料名称" />
        </el-form-item>
        
        <el-form-item label="物料编码" prop="matterCode">
          <el-input v-model="formData.matterCode" placeholder="请输入物料编码" />
        </el-form-item>
                
        <el-form-item label="物料别名" prop="aliasName">
          <el-input v-model="formData.aliasName" placeholder="请输入物料别名" />
        </el-form-item>

        <el-form-item label="物料拼音" prop="pinyin">
          <el-input v-model="formData.pinyin" placeholder="请输入物料拼音" />
        </el-form-item>

        <el-form-item label="物料参数" prop="param">
          <el-input v-model="formData.param" placeholder="请输入物料参数" />
        </el-form-item>

        <div class="form-footer">
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Delete, ArrowRight } from '@element-plus/icons-vue'
import { postRequest,getRequest } from "../utils/api"
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const isEdit = ref(false)

const formData = reactive({
  matterId: '',
  matterName: '',
  matterCode: '',
  categoryId: '',
  categoryName: '',  
  aliasName: '',
  pinyin: '',
  param: ''
})

const handleCategoryClick = () => {
  localStorage.setItem('matterFormTemp', JSON.stringify(formData))
  router.push({
    path: '/category',
    query: {
      select: 'true',
      from: 'matter'
    }
  })
}

onMounted(async () => {
  const tempFormData = localStorage.getItem('matterFormTemp')
  if (tempFormData) {
    const savedData = JSON.parse(tempFormData)
    Object.assign(formData, savedData)
    isEdit.value = !!savedData.matterId  // 根据是否有 matterId 判断是否为编辑状态
    localStorage.removeItem('matterFormTemp')
  }

  const selectedCategory = localStorage.getItem('selectedCategory')
  if (selectedCategory) {
    const category = JSON.parse(selectedCategory)
    formData.categoryId = category.categoryId
    formData.categoryName = category.categoryName  
    localStorage.removeItem('selectedCategory')
    return
  }

  const id = route.query.id
  if (id) {
    isEdit.value = true
    try {
      const resp = await getRequest(`/version/ht/matter/info/${id}`)
      if (resp?.data?.code === 0) {
        Object.assign(formData, resp.data.data)
      }
    } catch (error) {
      console.error('获取物料详情失败:', error)
    }
  }
})

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const url = isEdit.value ? '/version/ht/matter/update' : '/version/ht/matter/add'
        const resp = await postRequest(url, formData)
        if (resp?.data?.code === 0) {
          ElMessage.success('保存成功')
          router.back()
        }
      } catch (error) {
        console.error('保存失败:', error)
      }
    }
  })
}

const handleBack = () => {
  router.back()
}

const rules = {
  categoryId: [
    { required: true, message: '请选择分类编码', trigger: 'change' }
  ],
  matterName: [
    { required: true, message: '请输入物料名称', trigger: 'blur' }
  ]
}
</script>


<style scoped>
.category-edit {
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
  padding: 20px 15px 10px 10px;
  background: #fff;
  margin: 10px;
  border-radius: 8px;
}

.type-select {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.type-select .label {
  width: 80px;
  text-align: right;
  padding-right: 12px;
  color: #606266;
}

.form-footer {
  margin-top: 30px;
  text-align: center;
}

.delete-icon {
  font-size: 20px;
  cursor: pointer;
  position: absolute;
  right: 20px;
  color: #fff;
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
  height: 42px;  /* 从32px增加到42px */
  width: 100%;
  box-sizing: border-box;
  font-size: var(--el-font-size-base);
}

/* 添加对 el-input 的样式覆盖 */
:deep(.el-input__wrapper) {
  height: 42px;
}

:deep(.el-input__inner) {
  height: 42px;
  line-height: 42px;
  font-size: 14px;  /* 增加字体大小 */
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
  height: 42px;  /* 从32px增加到42px */
  width: 100%;
  box-sizing: border-box;
  font-size: var(--el-font-size-base);
}

.category-select .placeholder {
  color: var(--el-text-color-placeholder);
  font-size: 14px;  /* 增加字体大小，保持一致 */
}

.category-name-display {
  height: 42px;
  line-height: 42px;
  padding: 0 12px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #909399;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}
</style>