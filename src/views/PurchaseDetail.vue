<template>
  <div class="purchase-detail">
    <!-- 顶部操作栏 -->
    <div class="header">
      <div class="left">
        <el-button :icon="ArrowLeft" circle @click="handleBack" />
      </div>
      <div class="center">
        <h2 class="page-title">订单管理</h2>
      </div>
      <div class="right">
      </div>
    </div>

    <!-- 表单区域 -->
    <div class="form-container">
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        class="detail-form"
      >
        <el-form-item label="采购日期" prop="date">
          <el-date-picker
            v-model="formData.date"
            type="date"
            placeholder="选择日期"
            format="YYYY/MM/DD"
            value-format="YYYY/MM/DD"
          />
        </el-form-item>

        <el-form-item label="供应商" prop="supplier">
          <el-input
            v-model="formData.supplier"
            placeholder="供应商"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearchSupplier" />
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="物料名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="物料名称"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearchMaterial" />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="采购数量" prop="quantity">
          <el-input-number 
            v-model="formData.quantity" 
            :min="1"
            :precision="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="单价" prop="price">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            :step="0.1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <div class="form-footer">
        <div class="form-footer-right">
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import dayjs from 'dayjs'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const formData = reactive({
  date: dayjs().format('YYYY/MM/DD'),
  name: '',
  quantity: 1,
  price: 0,
  supplier: ''
})

const rules = {
  name: [
    { required: true, message: '请输入物料名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '请选择采购日期', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入采购数量', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入单价', trigger: 'blur' }
  ],
  supplier: [
    { required: true, message: '请输入供应商信息', trigger: 'blur' }
  ]
}

const handleBack = () => {
  router.back()
}

const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 调用保存接口
      ElMessage.success('保存成功')
      router.back()
    }
  })
}

const handleSearchMaterial = () => {
  // TODO: 实现物料查询逻辑
}

const handleSearchSupplier = () => {
  // TODO: 实现供应商查询逻辑
}
</script>

<style scoped>
.purchase-detail {
  padding: 20px;
  position: relative;
  background: #f6f8fa;
  min-height: 100vh;
}

.header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.center {
  text-align: center;
}

.page-title {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  font-weight: bold;
}

.form-container {
  background: white;
  padding: 30px 15px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.detail-form {
  max-width: 600px;
  margin: 0 auto;
}

:deep(.el-form-item) {
  margin-bottom: 25px;
}

:deep(.el-input), :deep(.el-date-picker) {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  padding-right: 0;
}

.input-with-search {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.input-with-search .el-button {
  flex-shrink: 0;
}

.material-input :deep(.el-input-group__append) {
  padding: 0;
  background-color: var(--el-fill-color-blank);
}

.material-input :deep(.el-input-group__append .el-button) {
  border: none;
  height: 32px;
  padding: 5px 5px;
}

.form-footer {
  text-align: center;
  margin-top: 30px;
}

.form-footer-right {
  display: flex;
  justify-content: flex-end;
  max-width: 600px;
  margin: 0 auto;
}

</style>