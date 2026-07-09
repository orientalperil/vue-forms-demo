<script setup lang="ts">
// Schema-driven FormKit: the same fields are described as a JSON-ish schema
// array and rendered with <FormKitSchema>. Each node's `$formkit` picks the
// (Vuetify-bridged) input type; the rest are that input's props. All wiring is
// shared in RegisterFormBody.
import { FormKitSchema } from '@formkit/vue'
import RegisterFormBody from '@/forms/formkit-shared/RegisterFormBody.vue'

const roleItems = [
  { title: 'Viewer', value: 'viewer' },
  { title: 'Editor', value: 'editor' },
  { title: 'Admin', value: 'admin' },
]

const registerSchema = [
  {
    $formkit: 'vtext',
    name: 'username',
    label: 'Username',
    validation: 'required|length:3,150',
    vuetifyProps: { autocomplete: 'username' },
  },
  {
    $formkit: 'vtext',
    name: 'email',
    label: 'Email',
    inputType: 'email',
    validation: 'required|email',
    vuetifyProps: { autocomplete: 'email' },
  },
  {
    $formkit: 'vtext',
    name: 'password',
    label: 'Password',
    inputType: 'password',
    validation: 'required|length:8',
    vuetifyProps: { autocomplete: 'new-password' },
  },
  {
    $formkit: 'vtext',
    name: 'password_confirm',
    label: 'Confirm password',
    inputType: 'password',
    validation: 'required|confirm:password',
    validationLabel: 'Password confirmation',
    vuetifyProps: { autocomplete: 'new-password' },
  },
  {
    $formkit: 'vselect',
    name: 'role',
    label: 'Role',
    validation: 'required',
    items: roleItems,
  },
  {
    // Nested under a `profile` group so the field's path is `profile.bio`.
    // That matches the DRF payload we POST ({ profile: { bio } }) and lets the
    // backend's nested serializer error ({ profile: { bio: [...] } }) resolve
    // back onto this field.
    $formkit: 'group',
    name: 'profile',
    children: [
      {
        $formkit: 'vtextarea',
        name: 'bio',
        label: 'Bio',
        validation: 'length:0,500',
        vuetifyProps: { autoGrow: true, rows: 3 },
      },
    ],
  },
  {
    $formkit: 'vcheckbox',
    name: 'accept_terms',
    label: 'I accept the terms and conditions',
    validation: 'accepted',
    value: false,
  },
]
</script>

<template>
  <RegisterFormBody>
    <FormKitSchema :schema="registerSchema" />
  </RegisterFormBody>
</template>
