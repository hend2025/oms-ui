<template>
  <div class="category-edit">
    <div class="header">
      <el-icon class="back-icon" @click="router.back()"><ArrowLeft /></el-icon>
      <h1>{{ isEdit ? '修改分类' : '新增分类' }}</h1>
      <el-icon v-if="isEdit" class="delete-icon" @click="handleDelete"><Delete /></el-icon>
    </div>

    <div class="form-container">
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="物料名称" prop="matterName">
          <el-input v-model="formData.matterName" placeholder="请输入物料名称" />
        </el-form-item>
        
        <el-form-item label="物料编码" prop="matterCode">
          <el-input v-model="formData.matterCode" placeholder="请输入物料编码" />
        </el-form-item>

        <el-form-item label="分类编码" prop="categoryCode">
          <el-input v-model="formData.categoryCode" placeholder="请输入分类编码" />
        </el-form-item>

        <el-form-item label="物料参数" prop="matterParam">
          <el-input v-model="formData.matterParam" placeholder="请输入物料参数" />
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
import { ArrowLeft, Delete } from '@element-plus/icons-vue'
import { postRequest } from "../utils/api"
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const isEdit = ref(false)

const formData = reactive({
  matterId: '',
  matterName: '',
  matterCode: '',
  categoryCode: '',
  matterParam: ''
})

const rules = {
  matterName: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  matterCode: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
  categoryCode: [{ required: true, message: '请输入分类编码', trigger: 'blur' }]
}

onMounted(async () => {
  const id = route.query.id
  if (id) {
    isEdit.value = true
    try {
      const resp = await postRequest('/version/ht/matter/detail', { matterId: id })
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
  padding: 20px;
  background: #fff;
  margin: 15px;
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

</style>