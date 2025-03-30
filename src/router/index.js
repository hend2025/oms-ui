import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/category',
    component: () => import('../views/category.vue')
  },
  {
    path: '/categoryForm',
    component: () => import('../views/categoryForm.vue')
  },
  {
    path: '/org',
    component: () => import('../views/org.vue')
  },
  {
    path: '/orgForm',
    component: () => import('../views/orgForm.vue')
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
    path: '/account/search',
    component: () => import('../views/account/search.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router