<script setup>
import FormPage from '@/components/FormPage.vue'
import RegisterForm from '@/forms/regle/RegisterForm.vue'
</script>

<template>
  <FormPage
    title="Regle"
    tagline="useRegle composable, headless. Rules mirror your state object. Server errors via the externalErrors channel ($setExternalErrors); non-field errors in a separate ref."
    docs-url="https://reglejs.dev/"
  >
    <RegisterForm />
  </FormPage>
</template>
