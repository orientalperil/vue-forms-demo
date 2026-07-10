<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const tabs = [
  { value: 'veevalidate-zod', label: 'VeeValidate · Zod' },
  { value: 'veevalidate-yup', label: 'VeeValidate · Yup' },
  { value: 'veevalidate-valibot', label: 'VeeValidate · Valibot' },
  { value: 'veevalidate-rules', label: 'VeeValidate · Rules' },
  { value: 'formkit-template', label: 'FormKit · Template' },
  { value: 'formkit-schema', label: 'FormKit · Schema' },
  { value: 'tanstack', label: 'TanStack Form' },
  { value: 'regle', label: 'Regle' },
]

const current = computed<string | undefined>({
  get: () => route.name as string | undefined,
  set: (name) => {
    if (name) router.push({ name })
  },
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

<style>
/*
 * The FormKit variants bridge every field to a Vuetify component that renders
 * its own label AND its own error messages (via :label / :error-messages in
 * formkit-heads' Input). FormKit's default input schema still emits its own label and
 * help sections per field, producing a doubled label. Hide them so Vuetify is
 * the sole renderer.
 */
.formkit-outer .formkit-label,
.formkit-outer .formkit-help {
  display: none;
}

/*
 * FormKit renders unstyled message lists both per-field (in .formkit-outer) and
 * at the form level (type="form" appends one under .formkit-form for
 * non_field_errors / detail). Everything is already shown by Vuetify — field
 * errors via :error-messages, form-level errors via our <v-alert> — so hide
 * FormKit's own lists everywhere to avoid unstyled duplicates.
 */
.formkit-messages {
  display: none;
}
</style>
