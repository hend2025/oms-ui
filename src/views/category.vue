<template>
  <div class="category">
    <div class="header">
      <el-icon class="back-icon" @click="handleBack"><ArrowLeft /></el-icon>
      <h1>{{ currentTitle }}</h1>
      <el-icon class="add-icon" @click="handleAdd"><Plus /></el-icon>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKey"
        placeholder="请输入搜索关键词"
        clearable
        :prefix-icon="Search"
      >
        <template #append>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="category-list">
        <div v-for="item in categoryList" 
             :key="item.categoryCode" 
             class="category-item">
          <div class="category-info" @click="handleViewSub(item)">   
            <div class="category-name">
              <span class="name-text">{{ item.categoryName }}</span>
            </div>
          </div>
          <div class="item-actions" v-if="item.childNum>0">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
    </div>

    <!-- 加载和提示信息移到这里 -->
    <div v-if="pageState.loading" class="loading-text">
      <el-icon class="loading"><Loading /></el-icon>
      加载中...
    </div>
    <div v-if="!pageState.loading && !pageState.hasMore && categoryList.length > 0" class="no-more-text">
      没有更多数据了
    </div>
    <div v-if="!pageState.loading && categoryList.length === 0" class="empty-text">
      暂无数据
    </div>
    
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'  
import { Search, ArrowLeft, ArrowRight, Plus, Loading } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'  // 添加 useRoute
import { postRequest } from "../utils/api"
import { throttle } from 'lodash-es'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()  // 添加这行

const searchKey = ref('')
const categoryList = ref([])
const navigationStack = ref([])
const currentPcode = ref('0')
const currentTitle = computed(() => navigationStack.value.length ? navigationStack.value[navigationStack.value.length - 1].name : '分类维护')

const pageState = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  hasMore: true,
  loading: false
})

const fetchCategoryList = async (pcode = '0', itemName = '') => {
  if (pageState.loading || !pageState.hasMore) return
  currentPcode.value = pcode
  if (pcode !== '0' && itemName) {
    navigationStack.value.push({ pcode, name: itemName })
  }
  try {
    pageState.loading = true
    const params = {
      keyword: searchKey.value,
      parentCode: pcode, 
      pageNum: pageState.pageNum,
      pageSize: pageState.pageSize
    }
    const resp = await postRequest('/version/ht/category/list', params)
    if (resp?.data?.code !== 0) {
      throw new Error(resp.data?.message || '获取数据失败')
    }
    const { records = [], total = 0 } = resp.data.data
    pageState.total = total
    if (pageState.pageNum === 1) {
      categoryList.value = records
    } else {
      const existingIds = new Set(categoryList.value.map(item => item.categoryCode))
      categoryList.value.push(...records.filter(item => !existingIds.has(item.categoryCode)))
    }
    pageState.hasMore = categoryList.value.length < total
    if (pageState.hasMore) {
      pageState.pageNum++
    } 
  } catch (error) {
    console.error('获取列表失败:', error)
  } finally {
    pageState.loading = false
  }
}

const handleScroll = throttle(() => {
  const { scrollHeight, scrollTop, clientHeight } = document.documentElement
  if (scrollHeight - scrollTop - clientHeight < 500) {
    fetchCategoryList(currentPcode.value)
  }
}, 200)

onMounted(() => {
  fetchCategoryList()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(searchKey, () => {
  pageState.pageNum = 1
  pageState.hasMore = true
  categoryList.value = []
  // 清空导航栈，回到顶级
  // navigationStack.value = []
  // currentPcode.value = '0'
  fetchCategoryList(currentPcode.value)
})

const handleBack = () => {
  if (navigationStack.value.length > 0) {
    navigationStack.value.pop()
    const prevItem = navigationStack.value[navigationStack.value.length - 1]
    pageState.pageNum = 1
    pageState.hasMore = true
    categoryList.value = []
    fetchCategoryList(prevItem ? prevItem.pcode : '0')
  } else {
    router.back()
  }
}

const handleViewSub = (item) => {
  // 如果是从物料表单页面跳转来的选择模式
  if (route.query.select === 'true' && route.query.from === 'matter') {
    if (item.childNum === 0) {
      // 选中叶子节点，返回物料表单页面
      router.back()
      // 通过 localStorage 临时存储所选分类信息
      localStorage.setItem('selectedCategory', JSON.stringify({
        categoryCode: item.categoryCode,
        categoryName: item.categoryName
      }))
    } else {
      // 非叶子节点，继续浏览子分类
      searchKey.value = '' 
      pageState.pageNum = 1
      pageState.hasMore = true
      categoryList.value = []
      fetchCategoryList(item.categoryCode, item.categoryName)
    }
  } else {
    // 普通浏览模式
    if (item.childNum === 0) {
      ElMessage.warning('该分类下没有子分类')
      return
    }
    searchKey.value = '' 
    pageState.pageNum = 1
    pageState.hasMore = true
    categoryList.value = []
    fetchCategoryList(item.categoryCode, item.categoryName)
  }
}

const handleAdd = () => {
  router.push({
    path: '/categoryForm',
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
  background: linear-gradient(135deg, #2d6eb2 0%, #75b2f7 100%);
  padding: 16px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: fixed; 
  top: 0;         
  left: 0;       
  right: 0;       
  z-index: 100;   
}

.search-bar {
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-top: 60px;   
}

.header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.back-icon, .add-icon {
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.back-icon:hover, .add-icon:hover {
  transform: scale(1.1);
}

.search-bar {
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.category-list {
  padding: 16px;
}

.category-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.category-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.category-info {
  flex: 1;
  padding-right: 16px;
}

.category-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.name-text {
  font-weight: 600;
  color: #2c3e50;
}

.sub-count {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.item-actions {
  color: #409eff;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 12px;  
  transition: transform 0.2s;
}

.delete-icon {
  color: #f56c6c;
}

.item-actions:hover {
  transform: translateX(4px);
}

.loading-text,
.no-more-text {
  text-align: center;
  color: #909399;
  padding: 16px 0;
  font-size: 14px;
}

.empty-text {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

.loading-text .loading {
  animation: rotating 2s linear infinite;
}

</style>

