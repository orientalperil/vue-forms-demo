<script setup lang="ts">
import FormPage from '@/components/FormPage.vue'
import RegisterForm from '@/forms/veevalidate-yup/RegisterForm.vue'
</script>

<template>
  <FormPage
    title="VeeValidate · Yup"
    tagline="Same headless useForm + useField setup as the Zod example, but the schema is written with Yup (via @vee-validate/yup). DRF field errors via setErrors; non-field errors in a separate ref."
    docs-url="https://vee-validate.logaretm.com/v4/guide/composition-api/typed-schema/#yup"
  >
    <RegisterForm />
  </FormPage>
</template>
