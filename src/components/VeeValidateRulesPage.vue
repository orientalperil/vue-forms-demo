<script setup>
import FormPage from '@/components/FormPage.vue'
import RegisterForm from '@/forms/veevalidate-rules/RegisterForm.vue'
</script>

<template>
  <FormPage
    title="VeeValidate · Native rules"
    tagline="No schema library — validation uses VeeValidate's own global rules (@vee-validate/rules) referenced by name per field, e.g. required|min:3. DRF field errors via setErrors; non-field errors in a separate ref."
    docs-url="https://vee-validate.logaretm.com/v4/guide/global-validators/"
  >
    <RegisterForm />
  </FormPage>
</template>
