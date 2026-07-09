/**
 * Shared domain types used across the demo.
 *
 * Two things are modelled here: the register form's value shape, and the
 * Django REST Framework error body the mock backend returns. Every Submitter
 * parses the same `DrfErrorData` into its library's own error shape.
 */

/** The role choices offered by the register form's <v-select>. */
export type Role = 'viewer' | 'editor' | 'admin'

/**
 * Canonical (camelCase) register-form values, as held by the VeeValidate,
 * Regle, and TanStack variants. The FormKit variants use snake_case field
 * names to match the POST payload, so they only touch this shape via
 * `makeSampleUser()`.
 */
export interface RegisterFormValues {
  username: string
  email: string
  password: string
  passwordConfirm: string
  role: Role | null
  profile: { bio: string }
  acceptTerms: boolean
}

/**
 * A Django REST Framework error body. Field keys map to a list of messages; a
 * nested serializer maps to an object of the same shape one level deep.
 * `detail` (APIException) and `non_field_errors` are the two form-level
 * channels.
 */
export interface DrfErrorData {
  detail?: string
  non_field_errors?: string[] | string
  [field: string]: string | string[] | Record<string, string[]> | undefined
}

/**
 * The axios-shaped error the Submitters read. On an HTTP error `response.data`
 * holds the DRF body; a network failure has `request` but no `response`.
 */
export interface ApiError {
  isAxiosError?: boolean
  response?: { status: number; data: DrfErrorData }
  request?: unknown
}

/** Minimal client surface the Submitters use (the mock, or a real axios). */
export interface ApiClient {
  post(
    url: string,
    body: Record<string, unknown>,
  ): Promise<{ status: number; data: unknown }>
}
