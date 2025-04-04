
<template>
  <div class="page-container">
    <div class="header">
      <div class="welcome">欢迎使用！</div>
      <div class="system-title">销售订单管理系统</div>
    </div>

    <div class="function-icons">
      <div 
        v-for="menu in menuList" 
        :key="menu.path" 
        class="icon"
        @click="handleMenuClick(menu)"
      >
        <img :src="menu.icon" />
        <p>{{ menu.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import hxjlIcon from '../assets/hxjl.png'

const router = useRouter()

// const menuList = ref([
//   { name: '功能-1', path: '/stoin', icon: hxjlIcon },
//   { name: '功能-2', path: '/order', icon: hxjlIcon },
//   { name: '功能-3', path: '/account', icon: hxjlIcon },
//   { name: '功能-4', path: '/account/check', icon: hxjlIcon },
//   { name: '功能-5', path: '/account/total', icon: hxjlIcon },
//   { name: '功能-6', path: '/category', query: { busiType: '1' }, icon: hxjlIcon },
//   { name: '功能-7', path: '/category', query: { busiType: '2' }, icon: hxjlIcon },
//   { name: '功能-8', path: '/org', icon: hxjlIcon },
//   { name: '功能-9', path: '', icon: hxjlIcon }
// ])

const menuList = ref([
  { name: '物料入库', path: '/stoin', icon: hxjlIcon },
  { name: '订单出库', path: '/order', icon: hxjlIcon },
  { name: '收支记账', path: '/account', icon: hxjlIcon },
  { name: '销售对账', path: '/account/check', icon: hxjlIcon },
  { name: '财务总账', path: '/account/total', icon: hxjlIcon },
  { name: '物料种类', path: '/category', query: { busiType: '1' }, icon: hxjlIcon },
  { name: '烟花种类', path: '/category', query: { busiType: '2' }, icon: hxjlIcon },
  { name: '客户管理', path: '/org', icon: hxjlIcon },
  { name: '账号设置', path: '', icon: hxjlIcon }
])

const handleMenuClick = (menu) => {
  if (!menu.path) return
  router.push({
    path: menu.path,
    query: { ...menu.query, title: menu.name }
  })
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #2d6eb2 0%, #75b2f7 100%);
  padding: 30px 20px;
  color: white;
}

.welcome {
  font-size: 32px;
  margin-bottom: 6px;
  font-weight: bold;
}

.system-title {
  padding-top: 10px;
  text-align: center;
  font-size: 36px;
  font-weight: bold;
  background: linear-gradient(to right, #fff, #e6f3ff);
  -webkit-background-clip: text;
  color: transparent;
}

.function-icons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 10px;
}

.icon {
  cursor: pointer;
  text-align: center;
}

.icon img {
  width: 80px;
  height: 80px;
}

.icon p {
  margin-top: -10px;
  font-size: 14px;
}
</style>
