<template>
  <div class="page-container">
    <div class="header">
      <el-icon class="back-icon" @click="handleBack"><ArrowLeft /></el-icon>
      <h1>{{ currentTitle }}</h1>
      <el-icon class="add-icon" @click="handleAdd"><Plus /></el-icon>
    </div>

    <div class="list-area">
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

    <div class="list-area">
        <div v-for="item in categoryList" 
             :key="item.categoryId" 
             class="list-item"
             @touchstart="handleTouchStart(item)"
             @touchend="handleTouchEnd">
          <div class="item-info" @click="handleViewSub(item)">   
            <div class="item-name">
              <span class="name-text">{{ item.categoryName }}</span>
              <span class="code-text" v-if=" item.categoryCode">{{ item.categoryCode }}</span>
              <span class="code-text" v-else>{{ item.categoryId }}</span>
            </div>
            <div class="item-name" v-if="!!item.aliasName || !!item.param">
              <span class="code-text">{{ item.aliasName }}</span>
              <span class="code-text">{{ item.param }}</span>
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
import { useRouter, useRoute } from 'vue-router' 
import { postRequest } from "../utils/api"
import { throttle } from 'lodash-es'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute() 

const searchKey = ref('')
const categoryList = ref([])
const navigationStack = ref([])
const currentPcode = ref(0)
const currentTitle = computed(() => {
  const baseTitle = route.query.busiType === '2' ? '产品种类维护' : '物料种类维护'
  return navigationStack.value.length ? navigationStack.value[navigationStack.value.length - 1].name : baseTitle
})

const pageState = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  hasMore: true,
  loading: false
})

const fetchCategoryList = async (pcode = 0, itemName = '') => {
  if (pageState.loading || !pageState.hasMore) return
  currentPcode.value = pcode
  if (pcode !== 0 && itemName) {
    navigationStack.value.push({ pcode, name: itemName })
  }
  try {
    pageState.loading = true
    const params = {
      keyword: searchKey.value,
      parentId: pcode, 
      pageNum: pageState.pageNum,
      pageSize: pageState.pageSize,
      busiType: route.query.busiType || '1'
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
      const existingIds = new Set(categoryList.value.map(item => item.categoryId))
      categoryList.value.push(...records.filter(item => !existingIds.has(item.categoryId)))
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
  // currentPcode.value = 0
  fetchCategoryList(currentPcode.value)
})

const handleBack = () => {
  if (navigationStack.value.length > 0) {
    navigationStack.value.pop()
    const prevItem = navigationStack.value[navigationStack.value.length - 1]
    pageState.pageNum = 1
    pageState.hasMore = true
    categoryList.value = []
    fetchCategoryList(prevItem ? prevItem.pcode : 0)
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
        categoryId: item.categoryId,
        categoryName: item.categoryName
      }))
    } else {
      // 非叶子节点，继续浏览子分类
      searchKey.value = '' 
      pageState.pageNum = 1
      pageState.hasMore = true
      categoryList.value = []
      fetchCategoryList(item.categoryId, item.categoryName)
    }
  } else {
    searchKey.value = '' 
    pageState.pageNum = 1
    pageState.hasMore = true
    categoryList.value = []
    fetchCategoryList(item.categoryId, item.categoryName)
  }
}

const handleAdd = () => {
  router.push({
    path: '/categoryForm',
    query: { 
      type: 'add',
      parentId: currentPcode.value,
      parentName: navigationStack.value.length ? navigationStack.value[navigationStack.value.length - 1].name : '顶级分类'
    }
  })
}

// 长按计时器
const pressTimer = ref(null)

// 长按开始处理
const handleTouchStart = (item) => {
  pressTimer.value = setTimeout(() => {
    router.push({
      path: '/categoryForm',
      query: { 
        type: 'edit',
        id: item.categoryId,
        name: item.categoryName,
        parentId: currentPcode.value
      }
    })
  }, 800)
}

// 长按结束处理
const handleTouchEnd = () => {
  if (pressTimer.value) {
    clearTimeout(pressTimer.value)
    pressTimer.value = null
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (pressTimer.value) {
    clearTimeout(pressTimer.value)
  }
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 65px 10px 10px;
}

.header {
  background: linear-gradient(135deg, #2d6eb2 0%, #75b2f7 100%);
  padding: 16px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed; 
  top: 0; left: 0; right: 0;       
  z-index: 100;   
}

.header h1 { 
  margin: 0; 
  font-size: 18px; 
  font-weight: 500; 
}

.back-icon, .add-icon {
  font-size: 20px;
  cursor: pointer;
}

.list-area {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  padding: 10px;
}

.list-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.list-item:hover {
  background-color: #fafafa;
}

.item-info {
  flex: 1;
  padding-right: 20px;
}

.item-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.name-text {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
}

.code-text {
  font-size: 14px;
  font-weight: 500;
  color: #8c8c8c;
}

.item-actions {
  color: #bfbfbf;
  font-size: 16px;
  transition: all 0.3s;
}

.item-actions:hover {
  color: #1890ff;
}

.loading-text,
.no-more-text,
.empty-text {
  text-align: center;
  color: #8c8c8c;
  padding: 16px;
  font-size: 14px;
}

@keyframes rotating {
  from { transform: rotate(0); }
  to { transform: rotate(360deg); }
}

.loading-text .loading {
  animation: rotating 1.2s linear infinite;
}
</style>

