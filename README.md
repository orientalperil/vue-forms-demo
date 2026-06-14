# Headless Forms Demo — VeeValidate · FormKit · TanStack Form

A runnable Vite 8 + Vue 3 + Vuetify 4 app showing the same user-registration
form built three ways with headless form libraries, each with a `Submitter`
class that maps Django REST Framework error responses onto the library's error
API. Ships with a mock DRF backend so it runs with no server.

## Requirements

- Node.js **20.19+** or **22.12+** (Vite 8 requirement)
- npm (or pnpm/yarn)

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run preview  # preview the build
```

Three tabs at the top switch between VeeValidate, FormKit, and TanStack Form.
On each page, the "Simulated response" dropdown selects which DRF reply the mock
backend returns on submit, so you can exercise every error path:

- **Success (201)** — form resets, success alert
- **Field errors (400)** — per-field messages on username/email/password
- **Non-field error (400)** — form-level message + a field error on role
- **APIException detail (403)** — single form-level message from `detail`
- **Nested serializer error (400)** — `profile.bio` mapped to the bio field
- **Network failure** — no `response` body; generic fallback message

## Project structure

```
src/
  main.js                      app entry; registers Vuetify, Router, FormKit
  App.vue                      shell + tab navigation
  plugins/
    vuetify.js                 Vuetify 4 instance (MD3 theme)
    formkit.js                 FormKit config + Vuetify bridge registration
  router/index.js              routes for the three pages
  shared/
    api.js                     API client (mock by default; real axios noted)
    mockBackend.js             fake DRF responses + scenario selector
  components/
    FormPage.vue               shared page frame
    ScenarioPicker.vue         backend-response selector
    {VeeValidate,FormKit,TanStack}Page.vue
  forms/
    veevalidate/  RegisterForm.vue + VeeValidateSubmitter.js
    formkit/      RegisterForm.vue + FormKitSubmitter.js + VuetifyInput.vue
    tanstack/     RegisterForm.vue + TanStackSubmitter.js
```

## How each library maps DRF errors

| Concern | VeeValidate | FormKit | TanStack Form |
|---|---|---|---|
| Per-field errors | `form.setErrors({ field: [...] })` | `node.setErrors(_, { field: [...] })` | return `{ fields: { field } }` |
| Non-field / `detail` | separate `ref` + `<v-alert>` | `node.setErrors([...])` form-level | return `{ form }` |
| Multiple msgs/field | native `string[]` | native `string[]` | joined to one string |
| Nested (`profile.bio`) | dotted path | dotted name | dotted name |
| Submission lives in | `action()` after validate | `action()` after validate | inside `onSubmitAsync` |
| Errors clear on edit | on revalidate | automatic | automatic |

### The one real architectural difference

VeeValidate and FormKit keep the original Vueform control flow: validate, submit
in `action()`, then on throw push messages into the form. TanStack Form wants the
API call *inside* `onSubmitAsync`, returning errors declaratively as
`{ form, fields }`. The `Submitter` there parses the DRF response into that shape.
FormKit's `setErrors(formLevel, fieldErrors)` is the closest analog to Vueform's
per-element message bags.

## Switching to a real backend

1. In `src/shared/api.js`, comment out the mock export and uncomment the axios
   instance.
2. Delete `src/shared/mockBackend.js` and remove `ScenarioPicker` usage if you
   don't want the selector.
3. Enable the `/api` proxy in `vite.config.js`, or set `VITE_API_BASE_URL`.

No `Submitter` changes are needed — the mock is shaped like axios on purpose.

## Caveats

- The FormKit `VuetifyInput` bridge is intentionally minimal; extend it for
  prefix/suffix slots, hints, etc.
- TanStack joins multiple messages per field with a space; switch to a list if
  you prefer.
- All three flatten only one level of nested serializer errors.
- Pinned versions reflect what was current at creation: Vite 8, Vue 3.5,
  Vuetify 4.1, vee-validate 4.15 (with Zod 3 — the vee-validate Zod adapter
  does not yet support Zod 4), FormKit 2.1, @tanstack/vue-form 1.x.
