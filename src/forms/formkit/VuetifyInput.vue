<script setup>
/**
 * Bridges a FormKit `context` to a Vuetify input. This is the headless pattern
 * for FormKit: FormKit owns state/validation/errors, Vuetify owns rendering.
 *
 * Registered as custom input types in src/plugins/formkit.js, so the form can
 * write <FormKit type="vtext" name="email" ... />.
 *
 * `context` is injected by FormKit and exposes:
 *   context.value         - current value
 *   context.node.input()  - commit a new value
 *   context.messages      - validation + backend messages (keyed)
 *   context.label, etc.
 */
import { computed } from 'vue'
import { VTextField, VTextarea, VSelect, VCheckbox } from 'vuetify/components'

const props = defineProps({
  context: { type: Object, required: true },
})

const model = computed({
  get: () => props.context.value,
  set: (val) => props.context.node.input(val),
})

// FormKit stores messages in context.messages keyed by type; surface the
// visible error ones as plain strings for Vuetify's :error-messages.
const errorMessages = computed(() =>
  Object.values(props.context.messages ?? {})
    .filter((m) => m.visible && m.type === 'error')
    .map((m) => m.value),
)

// Map the FormKit input `type` (vtext/vselect/...) straight to a Vuetify
// component. The type is the single source of truth — no separate prop needed.
const componentMap = {
  vtext: VTextField,
  vtextarea: VTextarea,
  vselect: VSelect,
  vcheckbox: VCheckbox,
}
const component = computed(
  () => componentMap[props.context.node.props.type] ?? VTextField,
)
</script>

<template>
  <component
    :is="component"
    v-model="model"
    :label="context.label"
    :type="context.node.props.inputType"
    :items="context.node.props.items"
    :error-messages="errorMessages"
    v-bind="context.node.props.vuetifyProps"
    @blur="context.handlers.blur"
  />
</template>
