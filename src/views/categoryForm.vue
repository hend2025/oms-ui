<template>
  <div class="form-edit">
    <div class="header">
      <el-icon class="back-icon" @click="router.back()"><ArrowLeft /></el-icon>
      <h1>{{ isEdit ? '修改' : '新增' }}</h1>
      <el-icon v-if="isEdit" class="delete-icon" @click="handleDelete"><Delete /></el-icon>
    </div>

    <div class="form-container">
      <el-form :model="formData" label-width="80px">

        <el-form-item label="节点类型" prop="nodeType" required>
          <el-radio-group v-model="formData.nodeType">
            <el-radio label="1">分类</el-radio>
            <el-radio label="2">实体</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="上级节点" prop="parentName" required>
          <el-input v-model="formData.parentName" disabled />
        </el-form-item>
                      
        <el-form-item label="节点名称" prop="categoryName" required>
          <el-input v-model="formData.categoryName" placeholder="请输入节点名称" />
        </el-form-item>

        <el-form-item label="规格参数" prop="param" >
          <el-input v-model="formData.param" placeholder="请输入规格参数" />
        </el-form-item>
        
        <el-form-item label="别名简称" prop="aliasName" >
          <el-input v-model="formData.aliasName" placeholder="请输入别名简称" />
        </el-form-item>
        
        <el-form-item label="拼音简称" prop="pinyin" >
          <el-input v-model="formData.pinyin" placeholder="请输入拼音简称" />
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
import { postRequest, getRequest } from "../utils/api"

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => route.query.type === 'edit')

const formData = ref({
  categoryId: '',
  categoryName: '',
  categoryCode: '',
  parentId: '',
  parentName: '',  
  nodeType: '',
  busiType: '',
  aliasName: '',
  pinyin: '',
  param: ''
})

// 添加保存方法
const handleSave = async () => {
  try {
    // 表单验证
    if (!formData.value.categoryName) {
      ElMessage.warning('请输入节点名称')
      return
    }
    if (!formData.value.nodeType) {
      ElMessage.warning('请选择节点类型')
      return
    }

    const params = {
      ...formData.value,
      parentId: route.query.parentId || 0,
      busiType: formData.value.busiType || route.query.busiType || '1'  // 确保保存时也带上业务类型
    }

    const url = isEdit.value ? '/version/ht/category/update' : '/version/ht/category/save'
    const resp = await postRequest(url, params)

    if (resp?.data?.code === 0) {
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      router.back()
    } else {
      throw new Error(resp?.data?.message || '操作失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.message || '保存失败')
  }
}

// 获取分类详情
const fetchCategoryDetail = async () => {
  if (!isEdit.value) return
  try {
    const id = route.query.id
    const resp = await getRequest(`/version/ht/category/info/${id}`)
    if (resp?.data?.code === 0) {
      const detail = resp.data.data
      formData.value = {
        ...formData.value,
        categoryId: detail.categoryId,
        categoryName: detail.categoryName,
        categoryCode: detail.categoryCode,
        parentId: detail.parentId,
        parentName: detail.parentName,
        nodeType: detail.nodeType,
        busiType: detail.busiType,
        aliasName: detail.aliasName,
        pinyin: detail.pinyin,
        param: detail.param
      }
    } else {
      ElMessage.error('获取分类详情失败')
    }
  } catch (error) {
    console.error('获取分类详情失败:', error)
    ElMessage.error('获取分类详情失败')
  }
}

onMounted(() => {
  if (isEdit.value) {
    fetchCategoryDetail()
  } else {
    // 新增时设置父级信息和业务类型
    formData.value.parentId = route.query.parentId
    formData.value.parentName = route.query.parentName
    formData.value.busiType = route.query.busiType || '1'  // 添加业务类型设置
  }
})

const handleDelete = () => {
  ElMessageBox.confirm('确认删除该分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const resp = await getRequest(`/version/ht/category/delete/${formData.value.categoryId}`)
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