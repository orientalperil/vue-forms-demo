/**
 * Realistic sample values for the register form.
 *
 * Shared by all three form implementations (VeeValidate, FormKit, TanStack) so
 * the "Fill with sample data" button produces consistent, valid input that
 * passes every field's validation. Returns fresh values on each call (the
 * username/email are randomized) so repeated submits don't collide.
 */

const FIRST_NAMES = [
  'Ava', 'Noah', 'Mia', 'Liam', 'Ella', 'Owen', 'Zoe', 'Leo', 'Iris', 'Kai',
]
const LAST_NAMES = [
  'Carter', 'Reyes', 'Nguyen', 'Patel', 'Brooks', 'Flores', 'Hayes', 'Walsh',
]
const BIOS = [
  'Frontend engineer who likes accessible UI and strong typing.',
  'Product designer turned developer. Coffee, keyboards, and clean forms.',
  'Backend dev exploring Vue. Building side projects on the weekend.',
  'Full-stack tinkerer interested in design systems and DX.',
]
const ROLES = ['viewer', 'editor', 'admin']

function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

export function makeSampleUser() {
  const first = pick(FIRST_NAMES)
  const last = pick(LAST_NAMES)
  const suffix = Math.floor(100 + Math.random() * 900)
  const username = `${first.toLowerCase()}.${last.toLowerCase()}${suffix}`
  const password = 'Sample-Pass-123'

  return {
    username,
    email: `${username}@example.com`,
    password,
    passwordConfirm: password,
    role: pick(ROLES),
    bio: pick(BIOS),
    acceptTerms: true,
  }
}
