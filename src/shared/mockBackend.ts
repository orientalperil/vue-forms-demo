/**
 * Mock DRF backend.
 *
 * The three Submitters are written against axios + a real Django REST Framework
 * server, but so the demo runs with zero backend, this module fakes the network
 * layer. It returns / throws objects shaped EXACTLY like axios success and error
 * responses (`error.response.data`, `error.response.status`), so the Submitters
 * need no changes to talk to it.
 *
 * A scenario selector (see useScenario) lets the UI choose which DRF response to
 * simulate: a clean success, field validation errors, a non_field_errors clash,
 * an APIException with `detail`, or a network failure.
 *
 * To use a REAL backend instead: delete this file, swap the import in
 * src/shared/api.ts back to a plain axios instance, and (optionally) enable the
 * dev proxy in vite.config.ts.
 */
import { ref } from 'vue'

import type { ApiClient, ApiError, DrfErrorData } from './types.ts'

export const SCENARIOS = {
  SUCCESS: 'success',
  FIELD_ERRORS: 'field_errors',
  NON_FIELD: 'non_field_errors',
  DETAIL: 'detail',
  NESTED: 'nested',
  NETWORK: 'network',
}

export const SCENARIO_LABELS = {
  [SCENARIOS.SUCCESS]: 'Success (201)',
  [SCENARIOS.FIELD_ERRORS]: 'Field errors (400)',
  [SCENARIOS.NON_FIELD]: 'Non-field error (400)',
  [SCENARIOS.DETAIL]: 'APIException detail (403)',
  [SCENARIOS.NESTED]: 'Nested serializer error (400)',
  [SCENARIOS.NETWORK]: 'Network failure',
}

// Shared reactive selection, surfaced in the UI via a <v-select>.
const scenario = ref(SCENARIOS.FIELD_ERRORS)
export function useScenario() {
  return scenario
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Build an axios-style error so `error.response.data` works downstream.
function makeAxiosError(status: number, data: DrfErrorData): ApiError {
  const err = new Error(`Request failed with status code ${status}`) as Error & ApiError
  err.isAxiosError = true
  err.response = { status, data }
  return err
}

/**
 * Mimics axios.post. Resolves on success, rejects with an axios-shaped error
 * otherwise — driven by the currently selected scenario.
 */
async function post(_url: string, _body: Record<string, unknown>) {
  await delay(700) // simulate latency so loading states are visible

  switch (scenario.value) {
    case SCENARIOS.SUCCESS:
      return { status: 201, data: { id: 42, ..._body } }

    case SCENARIOS.FIELD_ERRORS:
      throw makeAxiosError(400, {
        username: ['A user with that username already exists.'],
        email: ['Enter a valid email address.'],
        password: [
          'This password is too common.',
          'This password is entirely numeric.',
        ],
      })

    case SCENARIOS.NON_FIELD:
      throw makeAxiosError(400, {
        non_field_errors: ["The two password fields didn't match."],
        role: ['"superuser" is not a valid choice.'],
      })

    case SCENARIOS.DETAIL:
      throw makeAxiosError(403, {
        detail: 'You do not have permission to perform this action.',
      })

    case SCENARIOS.NESTED:
      throw makeAxiosError(400, {
        profile: { bio: ['This field may not be blank.'] },
        email: ['Enter a valid email address.'],
      })

    case SCENARIOS.NETWORK:
    default: {
      // A network error in axios has no `response`.
      const err = new Error('Network Error') as Error & ApiError
      err.isAxiosError = true
      err.request = {}
      throw err
    }
  }
}

export const mockApi: ApiClient = { post }
