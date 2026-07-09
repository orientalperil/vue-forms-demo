/**
 * Submitter for Regle (Vue 3, useRegle composable).
 *
 * Regle exposes server errors through a dedicated, Regle-owned channel:
 *   r$.$setExternalErrors({ field: ['msg'], nested: { sub: ['msg'] } })
 *   r$.$clearExternalErrors()
 *
 * External errors surface in each field's `$errors` array (rendered like
 * built-in rule errors) AND count toward `$invalid`. Because of that, the
 * component clears them via `$clearExternalErrors()` *before* re-validating on
 * the next submit — otherwise a stale message would keep `$validate()` invalid
 * and block resubmission. (Letting Regle own them, rather than passing your own
 * `externalErrors` ref to useRegle, is what makes that clear actually take.)
 *
 * Regle has no first-class form-level / non-field error slot (like VeeValidate),
 * so we surface `detail` and `non_field_errors` through a separate `formError`
 * ref that the component renders in a <v-alert>.
 *
 * Subclass and override action/success/error/finally — same contract as the
 * other Submitters.
 */
import type { Ref } from 'vue'

import type { ApiError, RegisterFormValues } from '@/shared/types.ts'

/** Regle's external-error tree: field -> messages, one level of nesting deep. */
type RegleErrorTree = Record<string, string[] | Record<string, string[]>>

/**
 * The slice of Regle's `r$` this Submitter uses. Typing just the external-error
 * setter structurally keeps the Submitter off Regle's heavily-generic `r$` type.
 */
interface RegleServerErrors {
  $setExternalErrors(errors: RegleErrorTree): void
}

export class RegleSubmitter<TValues = RegisterFormValues> {
  r$: RegleServerErrors
  formError: Ref<string[]>

  constructor(r$: RegleServerErrors, formError: Ref<string[]>) {
    this.r$ = r$
    this.formError = formError
    this.submit = this.submit.bind(this)
  }

  handleError(error: unknown) {
    const data = (error as ApiError | undefined)?.response?.data
    if (!data) {
      // Network error, timeout, CORS, etc. — no structured body.
      this.formError.value = ['Something went wrong. Please try again.']
      return
    }

    // Case 1: APIException-style { detail: "..." }
    if (data.detail) {
      this.formError.value = [data.detail]
      return
    }

    // Case 2 + 3: serializer errors. Split non-field from field errors.
    const { non_field_errors: nonField, ...fieldErrors } = data

    if (nonField) {
      this.formError.value = Array.isArray(nonField) ? nonField : [nonField]
    }

    // Build Regle's external-error tree. Each field maps to a string[]; a
    // nested serializer error (profile.bio) becomes a nested object, which
    // Regle merges into the matching field path.
    const tree: RegleErrorTree = {}
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (Array.isArray(messages)) {
        tree[field] = messages
      } else if (messages && typeof messages === 'object') {
        const nested: Record<string, string[]> = {}
        for (const [sub, subMessages] of Object.entries(messages)) {
          nested[sub] = Array.isArray(subMessages) ? subMessages : [subMessages]
        }
        tree[field] = nested
      } else if (messages != null) {
        tree[field] = [String(messages)]
      }
    }
    if (Object.keys(tree).length > 0) {
      this.r$.$setExternalErrors(tree)
    }
  }

  async action(_values: TValues): Promise<void> {}
  async success(_values: TValues): Promise<void> {}
  async error(_error: unknown): Promise<void> {}
  async finally(): Promise<void> {}

  /**
   * Call after client validation passes (the component clears external errors
   * and runs r$.$validate() first):
   *   const { valid, data } = await r$.$validate()
   *   if (valid) await submitter.submit(data)
   */
  async submit(values: TValues) {
    this.formError.value = []
    try {
      await this.action(values)
      await this.success(values)
    } catch (error) {
      this.handleError(error)
      await this.error(error)
    } finally {
      await this.finally()
    }
  }
}
