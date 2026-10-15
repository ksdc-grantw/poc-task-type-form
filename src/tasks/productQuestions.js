import { Model } from 'survey-core'
import { resolveRef } from '../products/productApi.js'
import '../surveyjs/customQuestions.js'

// Questions in a form schema that need a product chosen when a Task is created.
// `defaultProduct` is the form's default for the question, which the task may override.
export function productQuestions(schema) {
  return new Model(schema)
    .getAllQuestions()
    .filter((q) => q.productRef)
    .map((q) => {
      const defaultProduct = resolveRef(q.productRef)
      return { name: q.name, title: q.title, level: defaultProduct?.level, defaultProduct }
    })
    .filter((q) => q.defaultProduct)
}
