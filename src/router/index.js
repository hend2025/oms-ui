import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
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
  },
  {
    path: '/matterForm',
    name: 'MatterForm',
    component: () => import('../views/matterForm.vue'),
  },
  {
    path: '/org',
    name: 'org',
    component: () => import('../views/org.vue')
  },
  {
    path: '/orgForm',
    name: 'orgForm',
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router