/**
 * Submitter for VeeValidate (Vue 3, composition API via useForm).
 *
 * VeeValidate gives us a flat, path-keyed error model:
 *   - setErrors({ field: 'msg' | ['msg', ...] })   // bulk
 *   - setFieldError(path, msg)                      // single
 *
 * There is no first-class "form-level / non-field" error slot, so we surface
 * `detail` and `non_field_errors` through a separate ref (`formError`) that the
 * component renders in a <v-alert>. This mirrors how the old Vueform code did
 * `form.messageBag.prepend(...)` for top-level messages.
 *
 * Subclass and override action/success/error/finally — same contract as the
 * original Vueform Submitter.
 */
import type { Ref } from 'vue'

import type { ApiError, RegisterFormValues } from '@/shared/types.ts'

/**
 * The slice of VeeValidate's form context this Submitter uses. Typing just
 * `setErrors` structurally keeps the Submitter decoupled from VeeValidate's
 * heavily-generic `FormContext<TValues>` — any real form context satisfies it.
 */
interface VeeForm {
  setErrors(fields: Record<string, string | string[] | undefined>): void
}

export class VeeValidateSubmitter<TValues = RegisterFormValues> {
  form: VeeForm
  formError: Ref<string[]>

  constructor(form: VeeForm, formError: Ref<string[]>) {
    this.form = form
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

    // Build a single setErrors payload (VeeValidate accepts string | string[]).
    // Flatten one level of nesting (profile.bio) into dotted paths.
    const flat: Record<string, string[]> = {}
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (Array.isArray(messages)) {
        flat[field] = messages
      } else if (messages && typeof messages === 'object') {
        for (const [sub, subMessages] of Object.entries(messages)) {
          flat[`${field}.${sub}`] = Array.isArray(subMessages)
            ? subMessages
            : [subMessages]
        }
      } else if (messages != null) {
        flat[field] = [String(messages)]
      }
    }
    if (Object.keys(flat).length > 0) {
      this.form.setErrors(flat)
    }
  }

  async action(_values: TValues): Promise<void> {}
  async success(_values: TValues): Promise<void> {}
  async error(_error: unknown): Promise<void> {}
  async finally(): Promise<void> {}

  /**
   * Pass to VeeValidate's handleSubmit:
   *   const onSubmit = handleSubmit(submitter.submit)
   * handleSubmit only invokes this after client-side validation passes and
   * manages isSubmitting for the duration.
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
