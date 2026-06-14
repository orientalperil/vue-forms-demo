<script setup>
import FormPage from '@/components/FormPage.vue'
import RegisterForm from '@/forms/formkit-schema/RegisterForm.vue'
</script>

<template>
  <FormPage
    title="FormKit · Schema"
    tagline="Same fields and Vuetify bridge as the template variant, but declared as a FormKit schema array and rendered with <FormKitSchema>. Validation and DRF error handling are identical."
    docs-url="https://formkit.com/essentials/schema"
  >
    <RegisterForm />
  </FormPage>
</template>
