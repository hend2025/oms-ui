<template>
  <div class="form-edit">
    <div class="header">
      <el-icon class="header-icon" @click="handleBack"><ArrowLeft /></el-icon>
      <h1>{{ stoinId ? '编辑入库' : '新增入库' }}</h1>
      <div style="width: 20px"></div>
    </div>

    <div class="form-container">
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="物料名称" prop="matterName">
          <el-input v-model="formData.matterName" placeholder="请输入物料名称" />
        </el-form-item>
        <el-form-item label="入库日期" prop="stoinDate">
          <el-date-picker
            v-model="formData.stoinDate"
            type="date"
            placeholder="请选择入库日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="入库数量" prop="stoinCnt">
          <el-input-number 
            v-model="formData.stoinCnt" 
            :min="1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input-number 
            v-model="formData.price" 
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="所属机构" prop="orgId">
          <el-select 
            v-model="formData.orgId"
            placeholder="请选择所属机构"
            style="width: 100%"
            @change="handleOrgChange"
          >
            <el-option
              v-for="item in orgOptions"
              :key="item.orgId"
              :label="item.orgName"
              :value="item.orgId"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="form-footer">
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getStoinDetail, saveStoin } from '../api/stoin'
import { postRequest } from '../utils/api'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const stoinId = route.params.id

const formData = reactive({
  stoinId: undefined,
  matterName: '',
  stoinDate: '',
  stoinCnt: 1,
  price: 0,
  orgId: undefined,
  orgName: '',
  orgCode: ''
})

const orgOptions = ref([])

const rules = {
  matterName: [{ required: true, message: '请输入物料名称' }],
  stoinDate: [{ required: true, message: '请选择入库日期' }],
  stoinCnt: [{ required: true, message: '请输入入库数量' }],
  price: [{ required: true, message: '请输入单价' }],
  orgId: [{ required: true, message: '请选择所属机构' }]
}

const loadOrgOptions = async () => {
  try {
    const resp = await postRequest('/version/ht/org/list', { pageSize: 100 })
    if (resp?.data?.code === 0 && resp.data.data) {
      orgOptions.value = resp.data.data.records || []
    }
  } catch (error) {
    ElMessage.error('加载机构列表失败')
  }
}

const handleOrgChange = (orgId) => {
  const org = orgOptions.value.find(item => item.orgId === orgId)
  if (org) {
    formData.orgName = org.orgName
    formData.orgCode = org.orgCode
  }
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    await saveStoin(formData)
    ElMessage.success('保存成功')
    router.back()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleBack = () => {
  router.back()
}

loadOrgOptions()
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

.form-container {
  padding: 20px 15px;
  background: #fff;
  margin: 70px 16px 16px;
  border-radius: 8px;
}

.form-footer {
  margin-top: 30px;
  text-align: center;
}
</style>