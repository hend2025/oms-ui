<template>
  <div class="form-edit">
    <div class="header">
      <el-icon class="back-icon" @click="router.back()"><ArrowLeft /></el-icon>
      <h1>{{ isEdit ? '修改' : '新增' }}客户</h1>
      <el-icon v-if="isEdit" class="delete-icon" @click="handleDelete"><Delete /></el-icon>
    </div>

    <div class="form-container">
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
              
      <el-form-item label="客户类型" prop="orgType" required>
          <el-select v-model="formData.orgType" placeholder="请选择客户类型">
            <el-option label="供应商" value="1" />
            <el-option label="销售商" value="2" />
            <el-option label="供应商和销售商" value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="客户名称" prop="orgName" required>
          <el-input v-model="formData.orgName" placeholder="请输入客户名称" />
        </el-form-item>

        <el-form-item label="客户编码" prop="orgCode">
          <el-input v-model="formData.orgCode" placeholder="请输入客户编码" />
        </el-form-item>
                
        <el-form-item label="联 系 人" prop="conerName">
          <el-input v-model="formData.conerName" placeholder="请输入联系人" />
        </el-form-item>

        <el-form-item label="联系电话" prop="conerTel">
          <el-input v-model="formData.conerTel" placeholder="请输入联系电话" />
        </el-form-item>

        <el-form-item label="客户地址" prop="addr">
          <el-input v-model="formData.addr" placeholder="请输入客户地址" />
        </el-form-item>

        <div class="form-footer">
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Delete } from '@element-plus/icons-vue'
import { postRequest, getRequest } from "../utils/api"
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const isEdit = ref(false)

const formData = reactive({
  orgId: '',
  orgName: '',
  orgType: '',
  orgCode: '',
  conerName: '',
  conerTel: '',
  addr: ''
})

const rules = {
  orgName: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  orgType: [
    { required: true, message: '请选择客户类型', trigger: 'change' }
  ]
}

onMounted(async () => {
  const id = route.query.id
  if (id) {
    isEdit.value = true
    try {
      const resp = await getRequest(`/version/ht/org/info/${id}`)
      if (resp?.data?.code === 0) {
        Object.assign(formData, resp.data.data)
      }
    } catch (error) {
      console.error('获取详情失败:', error)
    }
  }
})

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const url = isEdit.value ? '/version/ht/org/update' : '/version/ht/org/save'
        const resp = await postRequest(url, formData)
        if (resp?.data?.code === 0) {
          ElMessage.success('保存成功')
          router.back()
        } else {
          ElMessage.error(resp?.data?.message || '保存失败')
        }
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
      }
    }
  })
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确认删除该客户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const resp = await getRequest(`/version/ht/org/delete/${formData.orgId}`)
    if (resp?.data?.code === 0) {
      ElMessage.success('删除成功')
      router.back()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}
</script>

<style scoped>

.form-edit {
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

:deep(.el-input__wrapper) {
  height: 42px;
}

:deep(.el-input__inner) {
  height: 42px;
  line-height: 42px;
  font-size: 14px; 
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select__wrapper) {
  height: 42px;
}
</style>