import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Medications from '../views/Medications.vue'
import Calendar from '../views/Calendar.vue'
import SideEffects from '../views/SideEffects.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/medications',
    name: 'Medications',
    component: Medications
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: Calendar
  },
  {
    path: '/side-effects',
    name: 'SideEffects',
    component: SideEffects
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router