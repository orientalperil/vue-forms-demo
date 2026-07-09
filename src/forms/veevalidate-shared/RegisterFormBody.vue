<script setup lang="ts">
/**
 * Shared body for every VeeValidate variant (Zod / Yup / Valibot / native rules).
 *
 * Everything that doesn't depend on HOW validation is expressed lives here:
 * useForm + useField wiring, the submitter, autofill, and the Vuetify template.
 * Each variant is a thin wrapper that supplies only its validation, via one of
 * two props:
 *   - validationSchema: a typed schema (Zod/Yup/Valibot) for useForm, or
 *   - fieldRules:       a per-field rule map (e.g. 'required|min:3') for the
 *                       native @vee-validate/rules variant.
 */
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import type { TypedSchema } from 'vee-validate'

import { api } from '@/shared/api.ts'
import { makeSampleUser } from '@/shared/sampleData.ts'
import type { RegisterFormValues, Role } from '@/shared/types.ts'
import { VeeValidateSubmitter } from './VeeValidateSubmitter.ts'

/** Per-field rule strings for the native-rules variant, keyed by field name. */
interface FieldRules {
  username?: string
  email?: string
  password?: string
  passwordConfirm?: string
  role?: string
  bio?: string
  acceptTerms?: string
}

const props = withDefaults(
  defineProps<{
    // Schema variants (Zod/Yup/Valibot) pass a typed schema here. Each library
    // infers a slightly different value type, so this stays the un-parameterized
    // `TypedSchema` (i.e. `<any>`); the canonical shape is pinned on useForm below.
    validationSchema?: TypedSchema
    // The native-rules variant passes per-field rule strings here instead.
    fieldRules?: FieldRules
  }>(),
  { validationSchema: undefined, fieldRules: () => ({}) },
)

// --- Headless form ----------------------------------------------------------
const veeForm = useForm<RegisterFormValues>({
  validationSchema: props.validationSchema,
  initialValues: {
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: null,
    profile: { bio: '' },
    acceptTerms: false,
  },
})
const { handleSubmit, isSubmitting } = veeForm

// useField per input — the headless part. The optional second arg carries
// per-field rules (only the native-rules variant uses it); schema variants
// leave it undefined and validate through the form-level schema above.
const { value: username, errorMessage: usernameError } = useField<string>(
  'username',
  props.fieldRules.username,
)
const { value: email, errorMessage: emailError } = useField<string>(
  'email',
  props.fieldRules.email,
)
const { value: password, errorMessage: passwordError } = useField<string>(
  'password',
  props.fieldRules.password,
)
const { value: passwordConfirm, errorMessage: passwordConfirmError } = useField<string>(
  'passwordConfirm',
  props.fieldRules.passwordConfirm,
)
const { value: role, errorMessage: roleError } = useField<Role | null>(
  'role',
  props.fieldRules.role,
)
const { value: bio, errorMessage: bioError } = useField<string>(
  'profile.bio',
  props.fieldRules.bio,
)
const { value: acceptTerms, errorMessage: acceptTermsError } = useField<boolean>(
  'acceptTerms',
  props.fieldRules.acceptTerms,
)

// --- Submitter --------------------------------------------------------------
const formError = ref<string[]>([])
const successMessage = ref('')

class RegisterSubmitter extends VeeValidateSubmitter<RegisterFormValues> {
  async action(values: RegisterFormValues) {
    await api.post('/users/', {
      username: values.username,
      email: values.email,
      password: values.password,
      password_confirm: values.passwordConfirm,
      role: values.role,
      profile: values.profile, // { bio } — nested field profile.bio
      accept_terms: values.acceptTerms,
    })
  }

  async success() {
    successMessage.value = 'Account created.'
    veeForm.resetForm()
  }
}

const submitter = new RegisterSubmitter(veeForm, formError)
const onSubmit = handleSubmit((values) => {
  successMessage.value = ''
  return submitter.submit(values)
})

function fillSample() {
  const { bio, ...sample } = makeSampleUser()
  // bio lives at the nested path profile.bio (matches the DRF payload).
  veeForm.setValues({ ...sample, profile: { bio } })
}

const roleItems = [
  { title: 'Viewer', value: 'viewer' },
  { title: 'Editor', value: 'editor' },
  { title: 'Admin', value: 'admin' },
]
</script>

<template>
  <v-form @submit.prevent="onSubmit">
    <v-alert
      v-if="formError.length"
      type="error"
      variant="tonal"
      class="mb-4"
      density="comfortable"
    >
      <div v-for="(msg, i) in formError" :key="i">{{ msg }}</div>
    </v-alert>

    <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
      {{ successMessage }}
    </v-alert>

    <v-text-field
      v-model="username"
      label="Username"
      :error-messages="usernameError ? [usernameError] : []"
      autocomplete="username"
    />

    <v-text-field
      v-model="email"
      label="Email"
      type="email"
      :error-messages="emailError ? [emailError] : []"
      autocomplete="email"
    />

    <v-text-field
      v-model="password"
      label="Password"
      type="password"
      :error-messages="passwordError ? [passwordError] : []"
      autocomplete="new-password"
    />

    <v-text-field
      v-model="passwordConfirm"
      label="Confirm password"
      type="password"
      :error-messages="passwordConfirmError ? [passwordConfirmError] : []"
      autocomplete="new-password"
    />

    <v-select
      v-model="role"
      label="Role"
      :items="roleItems"
      :error-messages="roleError ? [roleError] : []"
    />

    <v-textarea
      v-model="bio"
      label="Bio"
      :error-messages="bioError ? [bioError] : []"
      auto-grow
      rows="3"
    />

    <v-checkbox
      v-model="acceptTerms"
      label="I accept the terms and conditions"
      :error-messages="acceptTermsError ? [acceptTermsError] : []"
    />

    <div class="d-flex flex-column ga-2">
      <v-btn type="submit" color="primary" :loading="isSubmitting" block size="large">
        Create account
      </v-btn>

      <v-btn type="button" variant="text" block @click="fillSample">
        Fill with sample data
      </v-btn>
    </div>
  </v-form>
</template>
