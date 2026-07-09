<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '@tanstack/vue-form'

import { api } from '@/shared/api.ts'
import { makeSampleUser } from '@/shared/sampleData.ts'
import type { RegisterFormValues } from '@/shared/types.ts'
import { TanStackSubmitter } from './TanStackSubmitter.ts'

const successMessage = ref('')

// The Submitter does the API call and returns DRF errors in TanStack's shape.
class RegisterSubmitter extends TanStackSubmitter<RegisterFormValues> {
  async action(value: RegisterFormValues) {
    await api.post('/users/', {
      username: value.username,
      email: value.email,
      password: value.password,
      password_confirm: value.passwordConfirm,
      role: value.role,
      profile: value.profile, // { bio } — the nested `profile.bio` field
      accept_terms: value.acceptTerms,
    })
  }

  async success() {
    successMessage.value = 'Account created.'
    form.reset()
  }
}

const submitter = new RegisterSubmitter()

const form = useForm({
  // Annotated so `role: null` widens to `Role | null` (not the literal `null`),
  // which keeps every field path — including `role` — in TanStack's typed API.
  defaultValues: {
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: null,
    profile: { bio: '' },
    acceptTerms: false,
  } as RegisterFormValues,
  validators: {
    // Server submission + DRF error mapping happens here. Returning the
    // { form, fields } object routes messages to the form and each field.
    onSubmitAsync: ({ value }) => {
      successMessage.value = ''
      return submitter.submit(value)
    },
  },
})

// Form-level (non_field_errors / detail) message, read reactively from store.
const formError = form.useStore((state) => {
  const onSubmit = state.errorMap.onSubmit
  if (!onSubmit) return null
  return typeof onSubmit === 'string' ? onSubmit : (onSubmit.form ?? null)
})

function fillSample() {
  const { bio, ...sample } = makeSampleUser()
  // setFieldValue is typed to the known field paths; the sample keys are plain
  // strings, so use a loosened alias for the dynamic bulk set.
  const setFieldValueLoose = form.setFieldValue as unknown as (
    name: string,
    value: unknown,
  ) => void
  for (const [name, value] of Object.entries(sample)) {
    setFieldValueLoose(name, value)
  }
  // bio lives at the nested path profile.bio (matches the DRF payload).
  form.setFieldValue('profile.bio', bio)
}

const roleItems = [
  { title: 'Viewer', value: 'viewer' },
  { title: 'Editor', value: 'editor' },
  { title: 'Admin', value: 'admin' },
]

// TanStack stores field errors as an array that may contain strings (server
// map) or objects (schema validators). Normalize to strings for Vuetify.
function toMessages(errors: readonly unknown[] | undefined): string[] {
  return (errors ?? []).filter(Boolean).map((e) => {
    if (typeof e === 'string') return e
    if (e && typeof e === 'object' && 'message' in e) {
      return String((e as { message: unknown }).message)
    }
    return String(e)
  })
}
</script>

<template>
  <form @submit.prevent.stop="form.handleSubmit">
    <v-alert
      v-if="formError"
      type="error"
      variant="tonal"
      class="mb-4"
      density="comfortable"
    >
      {{ formError }}
    </v-alert>

    <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
      {{ successMessage }}
    </v-alert>

    <!-- Each field is a headless scoped slot; we render Vuetify inside. -->
    <form.Field
      name="username"
      :validators="{
        onChange: ({ value }) =>
          !value
            ? 'Username is required'
            : value.length < 3
              ? 'At least 3 characters'
              : undefined,
      }"
    >
      <template #default="{ field }">
        <v-text-field
          :model-value="field.state.value"
          label="Username"
          autocomplete="username"
          :error-messages="toMessages(field.state.meta.errors)"
          @update:model-value="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>

    <form.Field
      name="email"
      :validators="{
        onChange: ({ value }) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ? undefined
            : 'Enter a valid email address',
      }"
    >
      <template #default="{ field }">
        <v-text-field
          :model-value="field.state.value"
          label="Email"
          type="email"
          autocomplete="email"
          :error-messages="toMessages(field.state.meta.errors)"
          @update:model-value="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>

    <form.Field
      name="password"
      :validators="{
        onChange: ({ value }) =>
          !value || value.length < 8 ? 'At least 8 characters' : undefined,
      }"
    >
      <template #default="{ field }">
        <v-text-field
          :model-value="field.state.value"
          label="Password"
          type="password"
          autocomplete="new-password"
          :error-messages="toMessages(field.state.meta.errors)"
          @update:model-value="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>

    <!-- Cross-field: compare against the sibling value via fieldApi. -->
    <form.Field
      name="passwordConfirm"
      :validators="{
        onChangeListenTo: ['password'],
        onChange: ({ value, fieldApi }) =>
          value !== fieldApi.form.getFieldValue('password')
            ? 'Passwords do not match'
            : undefined,
      }"
    >
      <template #default="{ field }">
        <v-text-field
          :model-value="field.state.value"
          label="Confirm password"
          type="password"
          autocomplete="new-password"
          :error-messages="toMessages(field.state.meta.errors)"
          @update:model-value="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>

    <form.Field
      name="role"
      :validators="{
        onChange: ({ value }) => (!value ? 'Pick a role' : undefined),
      }"
    >
      <template #default="{ field }">
        <v-select
          :model-value="field.state.value"
          label="Role"
          :items="roleItems"
          :error-messages="toMessages(field.state.meta.errors)"
          @update:model-value="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>

    <form.Field
      name="profile.bio"
      :validators="{
        onChange: ({ value }) =>
          value && value.length > 500 ? 'Keep it under 500 characters' : undefined,
      }"
    >
      <template #default="{ field }">
        <v-textarea
          :model-value="field.state.value"
          label="Bio"
          auto-grow
          rows="3"
          :error-messages="toMessages(field.state.meta.errors)"
          @update:model-value="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>

    <form.Field
      name="acceptTerms"
      :validators="{
        onChange: ({ value }) =>
          value !== true ? 'You must accept the terms' : undefined,
      }"
    >
      <template #default="{ field }">
        <v-checkbox
          :model-value="field.state.value"
          label="I accept the terms and conditions"
          :error-messages="toMessages(field.state.meta.errors)"
          @update:model-value="(v) => field.handleChange(v ?? false)"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>

    <div class="d-flex flex-column ga-2">
      <form.Subscribe>
        <template #default="{ canSubmit, isSubmitting }">
          <v-btn
            type="submit"
            color="primary"
            :loading="isSubmitting"
            :disabled="!canSubmit"
            block
            size="large"
          >
            Create account
          </v-btn>
        </template>
      </form.Subscribe>

      <v-btn type="button" variant="text" block @click="fillSample">
        Fill with sample data
      </v-btn>
    </div>
  </form>
</template>
