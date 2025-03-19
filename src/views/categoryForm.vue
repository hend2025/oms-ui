<template>
  <div class="category-edit">
    <div class="header">
      <el-icon class="back-icon" @click="router.back()"><ArrowLeft /></el-icon>
      <h1>{{ isEdit ? '修改分类' : '新增分类' }}</h1>
      <el-icon v-if="isEdit" class="delete-icon" @click="handleDelete"><Delete /></el-icon>
    </div>

    <div class="form-container">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="上级">
          <el-input v-model="formData.parentName" disabled />
        </el-form-item>

        <div class="type-select" v-if="formData.subCount===0">
          <span class="label">选择</span>
          <el-radio-group v-model="formData.ctype">
            <el-radio label="1">分类</el-radio>
            <el-radio label="2">类型</el-radio>
          </el-radio-group>
        </div>

        <el-form-item label="名称">
          <el-input v-model="formData.name" placeholder="请输入名称" />
        </el-form-item>

        <el-form-item label="子类数量" v-if="formData.ctype === '1'">
          <el-input v-model="formData.subCount" disabled />
        </el-form-item>

        <el-form-item label="规格参数" v-if="formData.ctype === '2'">
          <el-input
            v-model="formData.para"
            type="textarea"
            :rows="3"
            placeholder="请输入规格参数"
          />
        </el-form-item>

        <div class="form-footer">
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => route.query.type === 'edit')

const formData = ref({
  ctype: '1',
  name: '',
  para: '',
  parentName: '',
  subCount: 0
})

onMounted(() => {
  if (isEdit.value) {
    formData.value = {
      ctype: route.query.ctype || '1',
      name: route.query.name || '',
      para: route.query.para || '',
      subCount: route.query.subCount || 0,
      parentName: route.query.parentName || '顶级' 
    }
  } else {
    formData.value.parentName = '顶级'
  }
})
 
const handleSave = () => {
  if (!formData.value.name) {
    ElMessage.warning('请输入名称')
    return
  }
  
  if (formData.value.ctype === '2' && !formData.value.para) {
    ElMessage.warning('请输入规格参数')
    return
  }

  console.log('保存数据：', formData.value)
  ElMessage.success('保存成功')
  router.back()
}

const handleDelete = () => {
  ElMessageBox.confirm(
    '确定要删除该分类吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('删除成功')
    router.back()
  }).catch(() => {})
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