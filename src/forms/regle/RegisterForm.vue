<script setup lang="ts">
import { ref } from 'vue'
import { useRegle } from '@regle/core'
import {
  required,
  email,
  minLength,
  maxLength,
  sameAs,
  withMessage,
} from '@regle/rules'

import { api } from '@/shared/api.ts'
import { makeSampleUser } from '@/shared/sampleData.ts'
import type { RegisterFormValues } from '@/shared/types.ts'
import { RegleSubmitter } from './RegleSubmitter.ts'

// --- Form state -------------------------------------------------------------
// We own the reactive state ref and bind inputs to it; Regle watches it for
// validation. r$ is the read side (errors, validity, server-error channel).
function emptyState(): RegisterFormValues {
  return {
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: null,
    profile: { bio: '' },
    acceptTerms: false,
  }
}
const state = ref(emptyState())

// --- Rules: structure mirrors the state, one entry per field ----------------
const { r$ } = useRegle(
  state,
  {
    username: {
      required: withMessage(required, 'Username is required'),
      minLength: withMessage(minLength(3), 'At least 3 characters'),
      maxLength: maxLength(150),
    },
    email: {
      required: withMessage(required, 'Email is required'),
      email: withMessage(email, 'Enter a valid email address'),
    },
    password: {
      required: withMessage(required, 'Password is required'),
      minLength: withMessage(minLength(8), 'At least 8 characters'),
    },
    passwordConfirm: {
      required: withMessage(required, 'Confirm your password'),
      // Cross-field: compare against the sibling value via a getter.
      sameAs: withMessage(
        sameAs(() => state.value.password),
        'Passwords do not match',
      ),
    },
    role: {
      required: withMessage(required, 'Pick a role'),
    },
    profile: {
      bio: {
        maxLength: withMessage(maxLength(500), 'Keep it under 500 characters'),
      },
    },
    acceptTerms: {
      // No built-in "accepted" rule — an inline boolean check does it.
      accepted: withMessage(
        (value: unknown) => value === true,
        'You must accept the terms',
      ),
    },
  },
)

// --- Submitter --------------------------------------------------------------
const formError = ref<string[]>([])
const successMessage = ref('')

class RegisterSubmitter extends RegleSubmitter<RegisterFormValues> {
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
    Object.assign(state.value, emptyState())
    r$.$reset()
  }
}

const submitter = new RegisterSubmitter(r$, formError)
const isSubmitting = ref(false)

async function onSubmit() {
  successMessage.value = ''
  formError.value = []
  // Clear last submit's server errors BEFORE validating. External errors count
  // toward $invalid, so a stale one would make $validate() report the form
  // invalid and block resubmission.
  r$.$clearExternalErrors()
  // Regle is explicit: run validation first, only submit if it passes.
  const { valid, data } = await r$.$validate()
  if (!valid) return
  isSubmitting.value = true
  try {
    // Regle's validated `data` is a deep-optional "safe output" type; once valid
    // it matches the canonical shape, so narrow it for the Submitter.
    await submitter.submit(data as RegisterFormValues)
  } finally {
    isSubmitting.value = false
  }
}

function fillSample() {
  const { bio, ...sample } = makeSampleUser()
  Object.assign(state.value, sample)
  // bio lives at the nested path profile.bio (matches the DRF payload).
  state.value.profile.bio = bio
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
      v-model="state.username"
      label="Username"
      :error-messages="r$.username.$errors"
      autocomplete="username"
    />

    <v-text-field
      v-model="state.email"
      label="Email"
      type="email"
      :error-messages="r$.email.$errors"
      autocomplete="email"
    />

    <v-text-field
      v-model="state.password"
      label="Password"
      type="password"
      :error-messages="r$.password.$errors"
      autocomplete="new-password"
    />

    <v-text-field
      v-model="state.passwordConfirm"
      label="Confirm password"
      type="password"
      :error-messages="r$.passwordConfirm.$errors"
      autocomplete="new-password"
    />

    <v-select
      v-model="state.role"
      label="Role"
      :items="roleItems"
      :error-messages="r$.role.$errors"
    />

    <v-textarea
      v-model="state.profile.bio"
      label="Bio"
      :error-messages="r$.profile.bio.$errors"
      auto-grow
      rows="3"
    />

    <v-checkbox
      v-model="state.acceptTerms"
      label="I accept the terms and conditions"
      :error-messages="r$.acceptTerms.$errors"
    />

    <div class="d-flex flex-column ga-2">
      <v-btn
        type="submit"
        color="primary"
        :loading="isSubmitting"
        block
        size="large"
      >
        Create account
      </v-btn>

      <v-btn type="button" variant="text" block @click="fillSample">
        Fill with sample data
      </v-btn>
    </div>
  </v-form>
</template>
