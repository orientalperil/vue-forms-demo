<script setup>
import FormPage from '@/components/FormPage.vue'
import RegisterForm from '@/forms/veevalidate/RegisterForm.vue'
</script>

<template>
  <FormPage
    title="VeeValidate · Zod"
    tagline="useForm + useField, headless. Zod schema validation (via @vee-validate/zod). DRF field errors via setErrors; non-field errors in a separate ref."
    docs-url="https://vee-validate.logaretm.com/v4/"
  >
    <RegisterForm />
  </FormPage>
</template>
