import { Serializer } from 'survey-core'

// Merchandising Survey: a matrixdropdown whose rows are the products chosen in the designer
// (row value = product id, row text = product description). The rows are written into the form
// JSON like a hand-built matrix, so renderers need no product lookup. Changing the products
// means editing the task type. Uses its own properties (not productRelated/productRefs) so that
// Task creation does not ask for products. Any renderer must register these properties too.
if (!Serializer.findProperty('matrixdropdown', 'merchSurvey')) {
  Serializer.addProperty('matrixdropdown', { name: 'merchSurvey:boolean', default: false, visible: false })
}
if (!Serializer.findProperty('matrixdropdown', 'merchProductRefs')) {
  Serializer.addProperty('matrixdropdown', {
    name: 'merchProductRefs',
    type: 'productrefs',
    displayName: 'Products',
    category: 'general',
    visibleIf: (obj) => !!obj?.merchSurvey,
  })
}

export const setMerchProducts = (question, products) => {
  question.merchProductRefs = products
  question.rows = products.map((p) => ({ value: p.id, text: p.description }))
}
