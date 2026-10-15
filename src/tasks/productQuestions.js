import { Model } from 'survey-core'
import { findProduct } from '../products/productApi.js'
import '../surveyjs/customQuestions.js'

// Questions in a form schema that need a product chosen when a Task is created.
// `defaultProduct` is the form's default for the question (if any), which the task may override.
export function productQuestions(schema) {
  return new Model(schema)
    .getAllQuestions()
    .filter((q) => q.productScope && q.productScope !== 'none')
    .map((q) => ({
      name: q.name,
      title: q.title,
      level: q.productScope,
      defaultProduct: q.productRef ? findProduct(q.productScope, q.productRef) : undefined,
    }))
}
