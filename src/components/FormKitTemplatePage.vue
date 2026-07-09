<script setup lang="ts">
import FormPage from '@/components/FormPage.vue'
import RegisterForm from '@/forms/formkit-template/RegisterForm.vue'
</script>

<template>
  <FormPage
    title="FormKit · Template"
    tagline="Headless via a Vuetify bridge input. Fields are written as <FormKit> elements with validation in the string DSL. node.setErrors(formLevel, fieldErrors) maps DRF errors almost 1:1."
    docs-url="https://formkit.com/"
  >
    <RegisterForm />
  </FormPage>
</template>
