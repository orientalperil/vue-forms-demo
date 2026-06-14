<script setup>
import { toTypedSchema } from '@vee-validate/valibot'
import * as v from 'valibot'

import RegisterFormBody from '@/forms/veevalidate-shared/RegisterFormBody.vue'

// Same shape as the Zod variant, expressed with Valibot's pipe API. The
// cross-field password check uses forward() + partialCheck() so the issue lands
// on the passwordConfirm field. All wiring is shared.
const schema = v.pipe(
  v.object({
    username: v.pipe(
      v.string(),
      v.minLength(3, 'At least 3 characters'),
      v.maxLength(150),
    ),
    email: v.pipe(v.string(), v.email('Enter a valid email address')),
    password: v.pipe(v.string(), v.minLength(8, 'At least 8 characters')),
    passwordConfirm: v.string(),
    role: v.picklist(['viewer', 'editor', 'admin'], 'Pick a role'),
    bio: v.pipe(v.string(), v.maxLength(500, 'Keep it under 500 characters')),
    acceptTerms: v.literal(true, 'You must accept the terms'),
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['passwordConfirm']],
      (input) => input.password === input.passwordConfirm,
      'Passwords do not match',
    ),
    ['passwordConfirm'],
  ),
)

const validationSchema = toTypedSchema(schema)
</script>

<template>
  <RegisterFormBody :validation-schema="validationSchema" />
</template>
