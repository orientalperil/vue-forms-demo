<script setup lang="ts">
import FormPage from '@/components/FormPage.vue'
import RegisterForm from '@/forms/veevalidate-valibot/RegisterForm.vue'
</script>

<template>
  <FormPage
    title="VeeValidate · Valibot"
    tagline="Same headless useForm + useField setup as the Zod example, but the schema is written with Valibot's pipe API (via @vee-validate/valibot). DRF field errors via setErrors; non-field errors in a separate ref."
    docs-url="https://vee-validate.logaretm.com/v4/guide/composition-api/typed-schema/#valibot"
  >
    <RegisterForm />
  </FormPage>
</template>
