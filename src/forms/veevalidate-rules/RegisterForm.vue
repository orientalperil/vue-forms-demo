<script setup>
import RegisterFormBody from '@/forms/veevalidate-shared/RegisterFormBody.vue'
// Registers the global rules + messages referenced by name below.
import './rules.js'

// No schema this time: each field gets a rule string built from VeeValidate's
// native global rules (required, min, max, email, confirmed, plus our is_true).
// All wiring is shared in RegisterFormBody.
const fieldRules = {
  username: 'required|min:3|max:150',
  email: 'required|email',
  password: 'required|min:8',
  passwordConfirm: 'required|confirmed:@password',
  role: 'required',
  bio: 'max:500',
  acceptTerms: 'is_true',
}
</script>

<template>
  <RegisterFormBody :field-rules="fieldRules" />
</template>
