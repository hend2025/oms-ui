import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Purchase from '../views/Purchase.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/purchase',
    name: 'Purchase',
    component: Purchase
  },
  {
    path: '/purchase/detail',
    name: 'PurchaseDetail',
    component: () => import('../views/PurchaseDetail.vue')
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('../views/category.vue')
  },
  {
    path: '/categoryForm',
    name: 'CategoryForm',
    component: () => import('../views/categoryForm.vue')
  },
  {
    path: '/matter',
    name: 'Matter',
    component: () => import('../views/matter.vue'),
    meta: {
      title: '物料品类'
    }
  },
  {
    path: '/matterForm',
    name: 'MatterForm',
    component: () => import('../views/matterForm.vue'),
    meta: {
      title: '物料表单'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router