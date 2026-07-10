/**
 * Submitter for TanStack Form (Vue adapter).
 *
 * TanStack Form is architecturally different from Vueform/VeeValidate/FormKit
 * for server errors. The idiomatic place to handle backend validation is the
 * form's `onSubmitAsync` validator: you run the API call there, and if it fails
 * you RETURN an error object shaped like:
 *
 *   { form?: string, fields?: { [name]: string } }
 *
 * TanStack then routes `form` to the form-level error map
 * (state.errorMap.onSubmit.form) and each `fields[name]` to that field's error
 * map. There is no message-bag mutation; errors are described declaratively as
 * a return value.
 *
 * So this Submitter's job is to PARSE a DRF error into that return shape.
 * `submit()` returns the error object (or null on success) so it can be the
 * body of onSubmitAsync.
 *
 * Note: TanStack's field error map stores one value per channel, so multiple
 * messages for a field are joined with a space here.
 */
import { parseDrfError } from '@/shared/parseDrfError.ts'
import type { RegisterFormValues } from '@/shared/types.ts'

/** The { form, fields } shape TanStack routes to its form/field error maps. */
export interface TanStackSubmitError {
  form?: string
  fields?: Record<string, string>
}

export class TanStackSubmitter<TValue = RegisterFormValues> {
  constructor() {
    this.submit = this.submit.bind(this)
  }

  /** Convert a DRF error response into TanStack's { form, fields } shape. */
  parseError(error: unknown): TanStackSubmitError {
    // TanStack's error map stores one value per channel, so join each field's
    // (and the form-level) messages into a single space-separated string.
    const { formLevel, fields } = parseDrfError(error)

    const result: TanStackSubmitError = {}
    if (formLevel.length > 0) {
      result.form = formLevel.join(' ')
    }
    const joined: Record<string, string> = {}
    for (const [field, messages] of Object.entries(fields)) {
      joined[field] = messages.join(' ')
    }
    if (Object.keys(joined).length > 0) {
      result.fields = joined
    }
    return result
  }

  async action(_value: TValue): Promise<void> {}
  async success(_value: TValue): Promise<void> {}
  async error(_error: unknown): Promise<void> {}
  async finally(): Promise<void> {}

  /**
   * Use as the form's onSubmitAsync validator:
   *   validators: { onSubmitAsync: ({ value }) => submitter.submit(value) }
   * Returns null on success, or the { form, fields } object on failure.
   * TanStack manages isSubmitting/canSubmit around this automatically.
   */
  async submit(value: TValue): Promise<TanStackSubmitError | null> {
    try {
      await this.action(value)
      await this.success(value)
      return null
    } catch (error) {
      await this.error(error)
      return this.parseError(error)
    } finally {
      await this.finally()
    }
  }
}
