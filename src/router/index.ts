import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/home/index.vue'
import LoginPage from '@/views/login/index.vue'
import DashboardPage from '@/views/dashboard/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage,
      redirect: '/dashboard/component1',
      children: [
        {
          path: 'component1',
          name: 'dashboard-component1',
          component: () => import('@/views/dashboard/components/Component1.vue')
        },
        {
          path: 'model',
          name: 'dashboard-component2',
          component: () => import('@/views/dashboard/components/Component2.vue')
        },
        {
          path: 'component3',
          name: 'dashboard-component3',
          component: () => import('@/views/dashboard/components/Component3.vue')
        },
        {
          path: 'component4',
          name: 'dashboard-component4',
          component: () => import('@/views/dashboard/components/Component4.vue')
        }
      ]
    }
  ],
})

export default router
