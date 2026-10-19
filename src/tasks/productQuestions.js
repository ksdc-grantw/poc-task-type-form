import { Model } from 'survey-core'
import '../surveyjs/customQuestions.js'

// Questions in a form schema that need products chosen when a Task is created.
// `defaultProducts` is the form's default set (possibly empty, meaning the task must choose).
// A question with default products but no flag (older forms) still counts as product-related.
export function productQuestions(schema) {
  return new Model(schema)
    .getAllQuestions()
    .filter((q) => q.productRelated || q.productRefs?.length)
    .map((q) => ({
      name: q.name,
      title: q.title,
      mode: q.productMode === 'each' ? 'each' : 'single',
      defaultProducts: q.productRefs ?? [],
    }))
}
