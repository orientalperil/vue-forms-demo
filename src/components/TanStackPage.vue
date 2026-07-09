<script setup lang="ts">
import FormPage from '@/components/FormPage.vue'
import RegisterForm from '@/forms/tanstack/RegisterForm.vue'
</script>

<template>
  <FormPage
    title="TanStack Form"
    tagline="form.Field scoped slots, headless. Submission runs inside onSubmitAsync; the Submitter returns { form, fields } to place DRF errors."
    docs-url="https://tanstack.com/form/latest"
  >
    <RegisterForm />
  </FormPage>
</template>
