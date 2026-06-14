<script setup>
// Template-driven FormKit: fields are written as <FormKit> elements, with
// validation in the string DSL on each. All wiring is shared in RegisterFormBody.
import RegisterFormBody from '@/forms/formkit-shared/RegisterFormBody.vue'

const roleItems = [
  { title: 'Viewer', value: 'viewer' },
  { title: 'Editor', value: 'editor' },
  { title: 'Admin', value: 'admin' },
]
</script>

<template>
  <RegisterFormBody>
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
  </RegisterFormBody>
</template>
