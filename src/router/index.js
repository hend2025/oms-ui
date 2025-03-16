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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router