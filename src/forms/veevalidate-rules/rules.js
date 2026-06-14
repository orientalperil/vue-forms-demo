/**
 * VeeValidate "native rules" setup.
 *
 * Instead of a schema library, this variant uses VeeValidate's own global rules
 * (the @vee-validate/rules package) registered with defineRule and referenced by
 * name in a string DSL on each field, e.g. validation="required|min:3".
 *
 * Importing this module once registers the rules and a message generator. Only
 * fields that use these global rules are affected — the Zod/Yup/Valibot variants
 * keep getting their messages from their own schemas.
 */
import { defineRule, configure } from 'vee-validate'
import { required, email, min, max, confirmed } from '@vee-validate/rules'

defineRule('required', required)
defineRule('email', email)
defineRule('min', min)
defineRule('max', max)
defineRule('confirmed', confirmed)

// No built-in "must be true" rule for the terms checkbox — define one inline.
defineRule('is_true', (value) => value === true)

// Friendly messages keyed by rule name. Native rules are field-agnostic, so
// (unlike the schema variants) "required" reads the same on every field.
const MESSAGES = {
  required: 'This field is required',
  email: 'Enter a valid email address',
  min: (ctx) => `At least ${ctx.rule.params[0]} characters`,
  max: (ctx) => `Keep it under ${ctx.rule.params[0]} characters`,
  confirmed: 'Passwords do not match',
  is_true: 'You must accept the terms',
}

configure({
  generateMessage: (ctx) => {
    const msg = MESSAGES[ctx.rule?.name]
    return typeof msg === 'function' ? msg(ctx) : (msg ?? `${ctx.field} is invalid`)
  },
})
