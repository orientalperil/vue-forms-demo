<script setup>
import FormPage from '@/components/FormPage.vue'
import RegisterForm from '@/forms/formkit/RegisterForm.vue'
</script>

<template>
  <FormPage
    title="FormKit"
    tagline="Headless via a Vuetify bridge input. node.setErrors(formLevel, fieldErrors) maps DRF errors almost 1:1 — closest to Vueform's message bags."
    docs-url="https://formkit.com/"
  >
    <RegisterForm />
  </FormPage>
</template>
