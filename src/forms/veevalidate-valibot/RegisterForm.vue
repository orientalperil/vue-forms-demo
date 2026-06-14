<script setup>
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import * as v from 'valibot'

import { api } from '@/shared/api.js'
import { makeSampleUser } from '@/shared/sampleData.js'
import { VeeValidateSubmitter } from '../veevalidate/VeeValidateSubmitter.js'

// --- Schema -----------------------------------------------------------------
// Same shape as the Zod example, expressed with Valibot's pipe-based API. The
// cross-field password check uses forward() + partialCheck() so the issue lands
// on the passwordConfirm field.
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

// --- Headless form ----------------------------------------------------------
const veeForm = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: undefined,
    bio: '',
    acceptTerms: false,
  },
})
const { handleSubmit, isSubmitting } = veeForm

const { value: username, errorMessage: usernameError } = useField('username')
const { value: email, errorMessage: emailError } = useField('email')
const { value: password, errorMessage: passwordError } = useField('password')
const { value: passwordConfirm, errorMessage: passwordConfirmError } =
  useField('passwordConfirm')
const { value: role, errorMessage: roleError } = useField('role')
const { value: bio, errorMessage: bioError } = useField('bio')
const { value: acceptTerms, errorMessage: acceptTermsError } = useField('acceptTerms')

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
      profile: { bio: values.bio },
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
  veeForm.setValues(makeSampleUser())
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
