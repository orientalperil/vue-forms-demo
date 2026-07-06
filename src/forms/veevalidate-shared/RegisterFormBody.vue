<script setup>
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

import { api } from '@/shared/api.js'
import { makeSampleUser } from '@/shared/sampleData.js'
import { VeeValidateSubmitter } from './VeeValidateSubmitter.js'

const props = defineProps({
  // Schema variants (Zod/Yup/Valibot) pass a typed schema here.
  validationSchema: { type: Object, default: undefined },
  // The native-rules variant passes per-field rule strings here instead.
  fieldRules: { type: Object, default: () => ({}) },
})

// --- Headless form ----------------------------------------------------------
const veeForm = useForm({
  validationSchema: props.validationSchema,
  initialValues: {
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: undefined,
    profile: { bio: '' },
    acceptTerms: false,
  },
})
const { handleSubmit, isSubmitting } = veeForm

// useField per input — the headless part. The optional second arg carries
// per-field rules (only the native-rules variant uses it); schema variants
// leave it undefined and validate through the form-level schema above.
const { value: username, errorMessage: usernameError } = useField(
  'username',
  props.fieldRules.username,
)
const { value: email, errorMessage: emailError } = useField('email', props.fieldRules.email)
const { value: password, errorMessage: passwordError } = useField(
  'password',
  props.fieldRules.password,
)
const { value: passwordConfirm, errorMessage: passwordConfirmError } = useField(
  'passwordConfirm',
  props.fieldRules.passwordConfirm,
)
const { value: role, errorMessage: roleError } = useField('role', props.fieldRules.role)
const { value: bio, errorMessage: bioError } = useField(
  'profile.bio',
  props.fieldRules.bio,
)
const { value: acceptTerms, errorMessage: acceptTermsError } = useField(
  'acceptTerms',
  props.fieldRules.acceptTerms,
)

// --- Submitter --------------------------------------------------------------
const formError = ref([])
const successMessage = ref('')

class RegisterSubmitter extends VeeValidateSubmitter {
  async action(values) {
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
