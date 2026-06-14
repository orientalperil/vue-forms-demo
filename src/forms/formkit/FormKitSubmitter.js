/**
 * Submitter for FormKit (headless usage via <FormKit type="form"> + custom inputs).
 *
 * FormKit has the best-matched error API for a DRF backend:
 *
 *   node.setErrors(formLevelErrors, inputErrors)
 *     - formLevelErrors: string | string[]              -> rendered at form top
 *     - inputErrors:     { fieldName: string|string[] } -> rendered per field
 *
 * That maps almost 1:1 onto DRF:
 *   detail / non_field_errors  -> formLevelErrors
 *   { field: [...] }           -> inputErrors
 *
 * This is the closest analog to the original Vueform code, where
 * `messageBag.prepend` handled top-level messages and per-element message bags
 * handled field messages.
 */
export class FormKitSubmitter {
  /**
   * @param {import('@formkit/core').FormKitNode} node  the form's root node
   */
  constructor(node) {
    this.node = node
    this.submit = this.submit.bind(this)
  }

  setNode(node) {
    this.node = node
  }

  handleError(error) {
    const data = error?.response?.data
    if (!data) {
      this.node?.setErrors(['Something went wrong. Please try again.'])
      return
    }

    // Case 1: APIException-style { detail }
    if (data.detail) {
      this.node?.setErrors([data.detail])
      return
    }

    // Case 2 + 3: serializer errors.
    const { non_field_errors: nonField, ...fieldErrors } = data

    const formLevel = nonField
      ? Array.isArray(nonField)
        ? nonField
        : [nonField]
      : []

    // FormKit keys inputErrors by the input's `name`. Flatten one level of
    // nesting into dotted names (matches FormKit group/nested input names).
    const inputErrors = {}
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (Array.isArray(messages)) {
        inputErrors[field] = messages
      } else if (messages && typeof messages === 'object') {
        for (const [sub, subMessages] of Object.entries(messages)) {
          inputErrors[`${field}.${sub}`] = Array.isArray(subMessages)
            ? subMessages
            : [subMessages]
        }
      } else if (messages != null) {
        inputErrors[field] = [String(messages)]
      }
    }

    // Single call sets both buckets. FormKit clears these automatically when
    // the user edits the offending field.
    this.node?.setErrors(formLevel, inputErrors)
  }

  async action(_data) {}
  async success(_data) {}
  async error(_error) {}
  async finally() {}

  /**
   * Pass as the form's @submit handler:
   *   <FormKit type="form" @submit="submitter.submit">
   * FormKit only fires @submit after its own validation passes, sets the form's
   * loading/disabled state for the duration of the returned promise, and passes
   * (data, node).
   */
  async submit(data, node) {
    if (node) this.node = node
    this.node?.clearErrors()
    try {
      await this.action(data)
      await this.success(data)
    } catch (error) {
      this.handleError(error)
      await this.error(error)
    } finally {
      await this.finally()
    }
  }
}
