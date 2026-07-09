<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

import RegisterFormBody from '@/forms/veevalidate-shared/RegisterFormBody.vue'

// Only the schema differs between variants; all wiring lives in RegisterFormBody.
const schema = z
  .object({
    username: z.string().min(3, 'At least 3 characters').max(150),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'At least 8 characters'),
    passwordConfirm: z.string(),
    role: z.enum(['viewer', 'editor', 'admin'], {
      errorMap: () => ({ message: 'Pick a role' }),
    }),
    // Nested to match the DRF payload ({ profile: { bio } }); the field path is
    // `profile.bio`, so the backend's nested serializer error resolves onto it.
    profile: z.object({
      bio: z.string().max(500, 'Keep it under 500 characters').optional().or(z.literal('')),
    }),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms' }),
    }),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })

const validationSchema = toTypedSchema(schema)
</script>

<template>
  <RegisterFormBody :validation-schema="validationSchema" />
</template>
