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
export class TanStackSubmitter {
  constructor() {
    this.submit = this.submit.bind(this)
  }

  /**
   * Convert a DRF error response into TanStack's { form, fields } shape.
   * @returns {{ form?: string, fields?: Record<string,string> }}
   */
  parseError(error) {
    const data = error?.response?.data
    if (!data) {
      return { form: 'Something went wrong. Please try again.' }
    }

    // Case 1: APIException-style { detail }
    if (data.detail) {
      return { form: data.detail }
    }

    // Case 2 + 3: serializer errors.
    const { non_field_errors: nonField, ...fieldErrors } = data

    const result = {}
    if (nonField) {
      result.form = Array.isArray(nonField) ? nonField.join(' ') : String(nonField)
    }

    const fields = {}
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (Array.isArray(messages)) {
        fields[field] = messages.join(' ')
      } else if (messages && typeof messages === 'object') {
        // Flatten nested serializer -> dotted field names (e.g. 'profile.bio').
        for (const [sub, subMessages] of Object.entries(messages)) {
          fields[`${field}.${sub}`] = Array.isArray(subMessages)
            ? subMessages.join(' ')
            : String(subMessages)
        }
      } else if (messages != null) {
        fields[field] = String(messages)
      }
    }
    if (Object.keys(fields).length > 0) {
      result.fields = fields
    }
    return result
  }

  async action(_value) {}
  async success(_value) {}
  async error(_error) {}
  async finally() {}

  /**
   * Use as the form's onSubmitAsync validator:
   *   validators: { onSubmitAsync: ({ value }) => submitter.submit(value) }
   * Returns null on success, or the { form, fields } object on failure.
   * TanStack manages isSubmitting/canSubmit around this automatically.
   */
  async submit(value) {
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
