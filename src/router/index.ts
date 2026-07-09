import { createRouter, createWebHistory } from 'vue-router'

import VeeValidateZodPage from '@/components/VeeValidateZodPage.vue'
import VeeValidateYupPage from '@/components/VeeValidateYupPage.vue'
import VeeValidateValibotPage from '@/components/VeeValidateValibotPage.vue'
import VeeValidateRulesPage from '@/components/VeeValidateRulesPage.vue'
import FormKitTemplatePage from '@/components/FormKitTemplatePage.vue'
import FormKitSchemaPage from '@/components/FormKitSchemaPage.vue'
import TanStackPage from '@/components/TanStackPage.vue'
import ReglePage from '@/components/ReglePage.vue'

const routes = [
  { path: '/', redirect: '/veevalidate-zod' },
  { path: '/veevalidate-zod', name: 'veevalidate-zod', component: VeeValidateZodPage },
  { path: '/veevalidate-yup', name: 'veevalidate-yup', component: VeeValidateYupPage },
  {
    path: '/veevalidate-valibot',
    name: 'veevalidate-valibot',
    component: VeeValidateValibotPage,
  },
  {
    path: '/veevalidate-rules',
    name: 'veevalidate-rules',
    component: VeeValidateRulesPage,
  },
  {
    path: '/formkit-template',
    name: 'formkit-template',
    component: FormKitTemplatePage,
  },
  { path: '/formkit-schema', name: 'formkit-schema', component: FormKitSchemaPage },
  { path: '/tanstack', name: 'tanstack', component: TanStackPage },
  { path: '/regle', name: 'regle', component: ReglePage },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
