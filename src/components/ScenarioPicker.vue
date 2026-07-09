<script setup lang="ts">
/**
 * Lets the user choose which DRF response the mock backend simulates, so every
 * error-handling path in each Submitter is demonstrable without a real server.
 */
import { computed } from 'vue'
import { useScenario, SCENARIOS, SCENARIO_LABELS } from '@/shared/mockBackend.ts'

const scenario = useScenario()

const items = computed(() =>
  Object.values(SCENARIOS).map((value) => ({
    value,
    title: SCENARIO_LABELS[value],
  })),
)
</script>

<template>
  <v-sheet color="surface" class="pa-4 rounded-lg border mb-6">
    <div class="text-caption text-medium-emphasis mb-2">
      Mock backend response — pick what the fake DRF server returns on submit
    </div>
    <v-select
      v-model="scenario"
      :items="items"
      label="Simulated response"
      variant="outlined"
      density="comfortable"
      hide-details
    />
    <div class="text-caption text-medium-emphasis mt-2">
      Fill the form and submit to see how each library renders this response.
      Field-level scenarios target <code>username</code>, <code>email</code>,
      <code>password</code>; nested targets <code>profile.bio</code>.
    </div>
  </v-sheet>
</template>
