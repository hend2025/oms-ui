import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/category',
    component: () => import('../views/category/index.vue')
  },
  {
    path: '/category/form',
    component: () => import('../views/category/form.vue')
  },
  {
    path: '/org',
    component: () => import('../views/org/index.vue')
  },
  {
    path: '/org/form',
    component: () => import('../views/org/form.vue')
  },
  {
    path: '/stoin',
    component: () => import('../views/stoin/index.vue')
  },
  {
    path: '/stoin/form',
    component: () => import('../views/stoin/form.vue')
  },
  {
    path: '/stoin/search',
    component: () => import('../views/stoin/search.vue')
  },
  {
    path: '/order',
    component: () => import('../views/order/index.vue')
  },
  {
    path: '/order/form',
    component: () => import('../views/order/form.vue')
  },
  {
    path: '/order/search',
    component: () => import('../views/order/search.vue')
  },
  {
    path: '/account',
    component: () => import('../views/account/index.vue')
  },
  {
    path: '/account/form',
    component: () => import('../views/account/form.vue')
  },
  {
    path: '/account/check',
    component: () => import('../views/account/check.vue')
  },
  {
    path: '/account/total',
    component: () => import('../views/account/total.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router