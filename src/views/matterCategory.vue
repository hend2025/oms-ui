<template>
  <div class="category">
    <div class="header">
      <el-icon class="back-icon" @click="handleBack"><ArrowLeft /></el-icon>
      <h1>{{ currentTitle }}</h1>
      <el-icon class="add-icon" @click="handleAdd"><Plus /></el-icon>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKey"
        placeholder="请输入搜索关键词"
        clearable
        :prefix-icon="Search"
      />
    </div>

    <!-- 分类列表 -->
    <div class="category-list">
        <div v-for="item in categoryList" 
             :key="item.matterCode" 
             class="category-item">
          <div class="category-info">
            <div class="category-name">
              <span class="name-text">{{ item.matterName }}</span>
              <div class="icon-group">
                <el-icon class="edit-icon" @click.stop="handleEdit(item)"><Edit /></el-icon>
              </div>
            </div>
            <div class="sub-count" v-if="item.subCount">
              子类数量：{{ item.subCount }}个
            </div>
            <div class="sub-count" v-if="item.para">
              规格参数：{{ item.matterParam }}
            </div>
          </div>
          <div class="item-actions">
            <el-icon v-if="item.matterType === '1'" @click="handleViewSub(item)"><ArrowRight /></el-icon>
          </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ArrowLeft, ArrowRight, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { postRequest } from "../utils/api"

const router = useRouter()
const searchKey = ref('')
const categoryList = ref([])
const navigationStack = ref([])
const currentTitle = computed(() => navigationStack.value.length ? navigationStack.value[navigationStack.value.length - 1].matterName : '物料分类')

// 查询分类列表
const fetchCategoryList = async (parentCode='0', matterName='物料分类') => {
  if (!navigationStack.value.find(item => item.parentCode === parentCode) ) {
    navigationStack.value.push({parentCode:parentCode,matterName:matterName})
  }
  try {
    const params = {
      keyword: searchKey.value,
      parentCode: parentCode,
      pageNum: 1,
      pageSize: 10
    }
    const response = await postRequest('/version/ht/matterCategory/list', params)
    if (response.data.code === 0) {
      categoryList.value = response.data.data.records.map(item => ({
        matterCode: item.matterCode,
        matterName: item.matterName,
        parentCode: item.parentCode,
        matterType: item.matterType,
        matterParam: item.matterParam,
        subCount: item.subCount || 0
      }))
    } else {
      ElMessage.error(response.data.message || '查询失败')
    }
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('查询失败')
  }
}

const handleViewSub = (item) => {
  fetchCategoryList(item.matterCode,item.matterName)
}

const handleBack = () => {
  if (navigationStack.value.length > 1) {
    // 先移除当前层级
    navigationStack.value.pop()
    // 获取上一层级的信息
    const prevItem = navigationStack.value[navigationStack.value.length - 1]
    // 使用上一层级的信息查询数据
    fetchCategoryList(prevItem.parentCode,prevItem.matterName)
  } else {
    // 如果只剩一层或没有层级，清空导航栈并返回首页
    navigationStack.value = []
    router.back()
  }
}

// 页面加载时查询数据
onMounted(() => {
  fetchCategoryList()
})

const handleEdit = (item) => {
    router.push({
      path: '/matterCategoryEdit/edit',
      query: { 
        type: 'edit',
        matterCode: item.matterCode,
        matterName: item.matterName,
        matterPcode: item.matterPcode,
        matterType: item.matterType,
        matterParam: item.matterParam,
        subCount: item.subCount,
        parentName: '顶级' 
      }
    })
}

const handleAdd = () => {
  router.push({
    path: '/matterCategoryEdit/edit',
    query: { type: 'add' }
  })
}

</script>

<style scoped>
.category {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #409eff 0%, #a0cfff 100%);
  padding: 20px;
  color: white;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.back-icon, .add-icon {
  font-size: 20px;
  cursor: pointer;
}

.search-bar {
  padding: 15px;
  background: #fff;
}

.category-list {
  padding: 15px;
}

.category-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}

.sub-count {
  font-size: 14px;
  color: #999;
}

.icon-group {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.edit-icon {
  font-size: 16px;
  color: #409eff;
  cursor: pointer;
  margin-left: 8px;
}

.name-text {
  font-weight: bold;
}
</style>

