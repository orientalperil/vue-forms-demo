<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const tabs = [
  { value: 'veevalidate', label: 'VeeValidate · Zod' },
  { value: 'veevalidate-yup', label: 'VeeValidate · Yup' },
  { value: 'veevalidate-valibot', label: 'VeeValidate · Valibot' },
  { value: 'veevalidate-rules', label: 'VeeValidate · Rules' },
  { value: 'formkit', label: 'FormKit' },
  { value: 'tanstack', label: 'TanStack Form' },
  { value: 'regle', label: 'Regle' },
]

const current = computed({
  get: () => route.name,
  set: (name) => router.push({ name }),
})
</script>

<template>
  <v-app>
    <v-app-bar flat border="b" color="surface">
      <v-container class="d-flex align-center py-0" style="max-width: 980px">
        <v-icon icon="mdi-form-select" class="me-2" color="primary" />
        <span class="text-subtitle-1 font-weight-bold me-6">Headless Forms</span>
        <v-tabs v-model="current" color="primary" density="comfortable">
          <v-tab v-for="t in tabs" :key="t.value" :value="t.value">
            {{ t.label }}
          </v-tab>
        </v-tabs>
      </v-container>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
