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

import { parseDrfError } from 'django-rest-framework-helpers/submitters/parseDrfError'
import type { RegisterFormValues } from '@/shared/types.ts'

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
    // Form-level messages go to our own ref (VeeValidate has no non-field
    // slot); dotted field paths go to setErrors, which accepts string[].
    const { formLevel, fields } = parseDrfError(error)
    this.formError.value = formLevel
    if (Object.keys(fields).length > 0) {
      this.form.setErrors(fields)
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
