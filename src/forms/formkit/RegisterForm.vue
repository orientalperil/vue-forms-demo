<script setup>
import { ref } from 'vue'
import { getNode } from '@formkit/core'

import { api } from '@/shared/api.js'
import { makeSampleUser } from '@/shared/sampleData.js'
import { FormKitSubmitter } from './FormKitSubmitter.js'

// FormKit validation is expressed via the `validation` prop on each input
// (string DSL). Cross-field password match uses the `confirm` rule.

const successMessage = ref('')

class RegisterSubmitter extends FormKitSubmitter {
  async action(data) {
    await api.post('/users/', {
      username: data.username,
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm,
      role: data.role,
      profile: { bio: data.bio },
      accept_terms: data.accept_terms,
    })
  }

  async success() {
    successMessage.value = 'Account created.'
    getNode('registerForm')?.reset()
  }
}

// Node is wired in via @submit's second arg; start with whatever exists.
const submitter = new RegisterSubmitter(getNode('registerForm'))

function onSubmit(data, node) {
  successMessage.value = ''
  return submitter.submit(data, node)
}

function fillSample() {
  const sample = makeSampleUser()
  // FormKit uses snake_case names for the confirm + terms fields.
  getNode('registerForm')?.input({
    username: sample.username,
    email: sample.email,
    password: sample.password,
    password_confirm: sample.passwordConfirm,
    role: sample.role,
    bio: sample.bio,
    accept_terms: sample.acceptTerms,
  })
}

const roleItems = [
  { title: 'Viewer', value: 'viewer' },
  { title: 'Editor', value: 'editor' },
  { title: 'Admin', value: 'admin' },
]
</script>

<template>
  <!--
    type="form" gives a submit button, loading state, and form-level error
    rendering. We pass :actions="false" and supply our own Vuetify button so the
    UI stays consistent.
  -->
  <FormKit
    id="registerForm"
    type="form"
    :actions="false"
    @submit="onSubmit"
    #default="{ state }"
  >
    <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
      {{ successMessage }}
    </v-alert>

    <!-- Form-level (non_field_errors / detail) messages render here. -->
    <FormKitMessages />

    <FormKit
      type="vtext"
      name="username"
      label="Username"
      validation="required|length:3,150"
      :vuetify-props="{ autocomplete: 'username' }"
    />

    <FormKit
      type="vtext"
      name="email"
      label="Email"
      input-type="email"
      validation="required|email"
      :vuetify-props="{ autocomplete: 'email' }"
    />

    <FormKit
      type="vtext"
      name="password"
      label="Password"
      input-type="password"
      validation="required|length:8"
      :vuetify-props="{ autocomplete: 'new-password' }"
    />

    <FormKit
      type="vtext"
      name="password_confirm"
      label="Confirm password"
      input-type="password"
      validation="required|confirm:password"
      validation-label="Password confirmation"
      :vuetify-props="{ autocomplete: 'new-password' }"
    />

    <FormKit
      type="vselect"
      name="role"
      label="Role"
      validation="required"
      :items="roleItems"
    />

    <FormKit
      type="vtextarea"
      name="bio"
      label="Bio"
      validation="length:0,500"
      :vuetify-props="{ autoGrow: true, rows: 3 }"
    />

    <FormKit
      type="vcheckbox"
      name="accept_terms"
      label="I accept the terms and conditions"
      validation="accepted"
      :value="false"
    />

    <div class="d-flex flex-column ga-2">
      <v-btn
        type="submit"
        color="primary"
        :loading="state.loading"
        :disabled="state.loading"
        block
        size="large"
      >
        Create account
      </v-btn>

      <v-btn type="button" variant="text" block @click="fillSample">
        Fill with sample data
      </v-btn>
    </div>
  </FormKit>
</template>
