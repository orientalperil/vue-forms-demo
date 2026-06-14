import { createRouter, createWebHistory } from 'vue-router'

import VeeValidatePage from '@/components/VeeValidatePage.vue'
import FormKitPage from '@/components/FormKitPage.vue'
import TanStackPage from '@/components/TanStackPage.vue'
import ReglePage from '@/components/ReglePage.vue'

const routes = [
  { path: '/', redirect: '/veevalidate' },
  { path: '/veevalidate', name: 'veevalidate', component: VeeValidatePage },
  { path: '/formkit', name: 'formkit', component: FormKitPage },
  { path: '/tanstack', name: 'tanstack', component: TanStackPage },
  { path: '/regle', name: 'regle', component: ReglePage },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
