<script setup>
import ScenarioPicker from '@/components/ScenarioPicker.vue'

defineProps({
  title: { type: String, required: true },
  tagline: { type: String, default: '' },
  docsUrl: { type: String, default: '' },
})
</script>

<template>
  <v-container class="py-8" style="max-width: 720px">
    <div class="mb-6">
      <div class="d-flex align-center justify-space-between flex-wrap ga-2">
        <h1 class="text-h4 font-weight-bold">{{ title }}</h1>
        <v-btn
          v-if="docsUrl"
          :href="docsUrl"
          target="_blank"
          rel="noopener"
          variant="text"
          size="small"
          append-icon="mdi-open-in-new"
        >
          Docs
        </v-btn>
      </div>
      <p v-if="tagline" class="text-body-2 text-medium-emphasis mt-1">
        {{ tagline }}
      </p>
    </div>

    <ScenarioPicker />

    <v-card elevation="2" class="pa-6 rounded-xl">
      <slot />
    </v-card>
  </v-container>
</template>
