<template>
  <div class="home">
    <!-- 顶部标题栏 -->
    <div class="header">
      <h1>销售订单管理系统</h1>
    </div>
    
    <!-- 九宫格菜单 -->
    <div class="menu-grid">
      <div v-for="(item, index) in menuItems" 
           :key="index" 
           class="menu-item"
           @click="handleMenuClick(item)">
        <el-icon size="24">
          <component :is="item.icon"></component>
        </el-icon>
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Setting, User, Calendar, List, 
         Message, Search, Star } from '@element-plus/icons-vue'

const router = useRouter()

const menuItems = ref([
  { name: '物料采购', icon: Document, path: '/purchase' },
  { name: '订单管理', icon: Setting, path: '/orders' },
  { name: '收支记账', icon: User, path: '/finance' },
  { name: '财务对账', icon: Calendar, path: '/reconciliation' },
  { name: '物料种类', icon: List, path: '/materials' },
  { name: '产品管理', icon: Message, path: '/products' },
  { name: '客户管理', icon: Search, path: '/customers' },
  { name: '账号设置', icon: Star, path: '/settings' },
])

const handleMenuClick = (item) => {
  router.push(item.path)
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: white;
}

.header {
  background: linear-gradient(135deg, #8cd5ff 0%, #47a3ff 100%);
  padding: 1rem;
  color: white;
  text-align: center;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.menu-item {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.menu-item span {
  font-size: 0.9rem;
  color: #333;
}
</style>