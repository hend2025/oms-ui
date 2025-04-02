<template>
  <div class="form-edit">
    <div class="header">
      <el-icon class="back-icon" @click="router.back()"><ArrowLeft /></el-icon>
      <h1>{{ isEdit ? '修改' : '新增' }}</h1>
      <el-icon v-if="isEdit" class="delete-icon" @click="handleDelete"><Delete /></el-icon>
    </div>

    <div class="form-container">
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
      <el-form-item label="收支类型" prop="payType">
          <el-radio-group v-model="formData.payType" style="width: 100%">
            <el-radio label="1">收入</el-radio>
            <el-radio label="2">支出</el-radio>
          </el-radio-group>
      </el-form-item>
      
      <el-form-item label="订单日期" prop="accountDate" required>
        <el-date-picker
          v-model="formData.accountDate"
          type="date"
          placeholder="请选择订单日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="客户名称" prop="orgName" required>
          <div class="category-select" @click="handleOrgClick">
            <span v-if="formData.orgName">{{ formData.orgName }}</span>
            <span v-else class="placeholder">请选择客户名称</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </el-form-item>

        <el-form-item label="记账金额" prop="money">
          <el-input 
            v-model="formData.money" 
            type="number"
            placeholder="请输入记账金额" />
        </el-form-item>

        <div class="form-footer">
          <el-button type="primary" @click="handleSubmit">保存【返回】</el-button>
          <el-button type="primary" @click="handleContinueSubmit">保存【新增】</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Delete, ArrowRight } from '@element-plus/icons-vue'
import { postRequest, getRequest } from "../../utils/api"
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const isEdit = ref(false)

const formData = reactive({
  accountId: '',
  payType: '',
  accountDate: new Date().toISOString().split('T')[0],
  money: '',
  orgId: '',
  orgName: '',
  orgCode: '',
})

const rules = {
  payType: [{ required: true, message: '请选择收支类型' }],
  orgId: [{ required: true, message: '请选择客户名称' }],
  accountDate: [{ required: true, message: '请选择记账日期' }],
  money: [{ required: true, message: '请输入金额' }]
}

const handleOrgClick = () => {
  localStorage.setItem('tempFormData', JSON.stringify(formData))
  router.push({
    path: '/org',
    query: { select: 'true', from: 'order' }
  })
}

onMounted(async () => {
  const id = route.query.id
  if (id) {
    isEdit.value = true
    try {
      const resp = await getRequest(`/version/ht/account/info/${id}`)
      if (resp?.data?.code === 0) {
        const data = resp.data.data
        data.accountDate = data.accountDate ? dayjs(data.accountDate).format('YYYY-MM-DD') : ''
        Object.assign(formData, data)
      }
    } catch (error) {
      console.error('获取详情失败:', error)
    }
  }

  const tempFormData = localStorage.getItem('tempFormData')
  if (tempFormData) {
    const savedData = JSON.parse(tempFormData)
    Object.assign(formData, savedData)
    isEdit.value = !!savedData.accountId
    localStorage.removeItem('tempFormData')
  }

  const selectedOrg = localStorage.getItem('selectedOrg')
  if (selectedOrg) {
    const org = JSON.parse(selectedOrg)
    formData.orgId = org.orgId
    formData.orgName = org.orgName
    formData.orgCode = org.orgCode
    localStorage.removeItem('selectedOrg')
  }
  
})

const handleSubmit = async () => {
  await formRef.value.validate()
  console.log(formData)
  try {
    const url = isEdit.value ? '/version/ht/account/update' : '/version/ht/account/save'
    const resp = await postRequest(url, formData)
    if (resp?.data?.code === 0) {
      ElMessage.success('保存成功')
      router.back()
    } else {
      throw new Error(resp?.data?.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  }
}


const handleContinueSubmit = async () => {
  await formRef.value.validate()
  try {
    const url = isEdit.value ? '/version/ht/account/update' : '/version/ht/account/save'
    const resp = await postRequest(url, formData)
    if (resp?.data?.code === 0) {
      ElMessage.success('保存成功')
      formData.accountId = ''
      formData.money = ''  
    } else {
      throw new Error(resp?.data?.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  }
}

const handleDelete = () => {
  ElMessageBox.confirm('确认删除该采购记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const resp = await  getRequest(`/version/ht/account/delete/${formData.accountId}`)
      if (resp?.data?.code === 0) {
        ElMessage.success('删除成功')
        router.back()
      } else {
        throw new Error(resp?.data?.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {
    // 取消删除操作
  })
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
  padding: 20px 15px;
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
  font-size: var(--el-font-size-base);
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select__wrapper) {
  height: 42px !important;
}

:deep(.el-select .el-input__wrapper) {
  height: 42px !important;
}

:deep(.el-select .el-input__inner) {
  height: 42px !important;
  line-height: 42px !important;
}

:deep(.el-input__wrapper) {
  height: 42px;
}

:deep(.el-input__inner) {
  height: 42px;
  line-height: 42px;
  font-size: 14px;
}

.category-select .placeholder {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

:deep(.el-radio-group) {
  display: flex;
  justify-content: flex-start;
  gap: 30px;
  height: 42px;
  align-items: center;
  padding: 0 12px;
}
</style>
