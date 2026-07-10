import { defaultConfig } from '@formkit/vue'
import { createInput } from '@formkit/vue'
import { Input } from 'formkit-heads/vuetify'

// Register the Vuetify bridge once and expose it under several friendly type
// names so the form schema reads naturally (type="vtext", "vselect", ...).
// The bridge maps each type name to the matching Vuetify component, so the
// `type` alone picks what renders. createInput gives our component the full
// FormKit lifecycle (validation, messages, commit) for free.
const vuetifyInput = createInput(Input, {
  props: ['vuetifyProps', 'inputType', 'items'],
})

export const formkitConfig = defaultConfig({
  inputs: {
    vtext: vuetifyInput,
    vselect: vuetifyInput,
    vtextarea: vuetifyInput,
    vcheckbox: vuetifyInput,
  },
})
