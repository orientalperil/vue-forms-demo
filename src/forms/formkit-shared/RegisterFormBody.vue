<script setup>
/**
 * Shared body for the FormKit variants (template-driven and schema-driven).
 *
 * Everything that doesn't depend on HOW the fields are declared lives here: the
 * <FormKit type="form"> wrapper, form-level messages, the submitter + DRF error
 * handling, autofill, and the submit button. Each variant supplies only the
 * fields, via the default slot — as <FormKit> elements (template) or a
 * <FormKitSchema> (schema). The field NAMES must match what fillSample / the
 * submitter expect (username, email, password, password_confirm, role, bio,
 * accept_terms).
 */
import { ref } from 'vue'
import { getNode } from '@formkit/core'

import { api } from '@/shared/api.js'
import { makeSampleUser } from '@/shared/sampleData.js'
import { FormKitSubmitter } from './FormKitSubmitter.js'

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
</script>

<template>
  <!--
    type="form" gives a submit button, loading state, and form-level error
    rendering. We pass :actions="false" and supply our own Vuetify button so the
    UI stays consistent. Fields come from the default slot (each variant differs
    only there).
  -->
  <FormKit
    id="registerForm"
    type="form"
    :actions="false"
    @submit="onSubmit"
    #default="{ state, messages }"
  >
    <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
      {{ successMessage }}
    </v-alert>

    <!--
      Form-level messages: FormKit's "incomplete" summary on a failed submit and
      DRF non_field_errors / detail (set via node.setErrors). These have no
      field to attach to, so render them here in a styled Vuetify alert instead
      of FormKit's default (unstyled) <FormKitMessages> list. `messages` comes
      from the form node's context and updates reactively as FormKit does.
    -->
    <v-alert
      v-if="Object.keys(messages).length"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      <div v-for="m in messages" :key="m.key">{{ m.value }}</div>
    </v-alert>

    <slot />

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
