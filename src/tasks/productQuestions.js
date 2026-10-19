import { Model } from 'survey-core'
import '../surveyjs/customQuestions.js'

// Questions in a form schema that need products chosen when a Task is created.
// `defaultProducts` is the form's default set for the question, which the task may override.
export function productQuestions(schema) {
  return new Model(schema)
    .getAllQuestions()
    .filter((q) => q.productRefs?.length)
    .map((q) => ({
      name: q.name,
      title: q.title,
      mode: q.productMode === 'each' ? 'each' : 'single',
      defaultProducts: q.productRefs,
    }))
    .filter((q) => q.defaultProducts.length)
}
