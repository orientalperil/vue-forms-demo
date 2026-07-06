<script setup>
import { toTypedSchema } from '@vee-validate/yup'
import { object, string, boolean, ref as yupRef } from 'yup'

import RegisterFormBody from '@/forms/veevalidate-shared/RegisterFormBody.vue'

// Same shape as the Zod variant, expressed with Yup. All wiring is shared.
const schema = object({
  username: string()
    .required('Username is required')
    .min(3, 'At least 3 characters')
    .max(150),
  email: string().required('Email is required').email('Enter a valid email address'),
  password: string().required('Password is required').min(8, 'At least 8 characters'),
  passwordConfirm: string()
    .required('Confirm your password')
    .oneOf([yupRef('password')], 'Passwords do not match'),
  role: string()
    .required('Pick a role')
    .oneOf(['viewer', 'editor', 'admin'], 'Pick a role'),
  // Nested to match the DRF payload ({ profile: { bio } }); the field path is
  // `profile.bio`, so the backend's nested serializer error resolves onto it.
  profile: object({
    bio: string().max(500, 'Keep it under 500 characters'),
  }),
  acceptTerms: boolean().oneOf([true], 'You must accept the terms'),
})

const validationSchema = toTypedSchema(schema)
</script>

<template>
  <RegisterFormBody :validation-schema="validationSchema" />
</template>
