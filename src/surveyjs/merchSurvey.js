import { Serializer } from 'survey-core'

// Merchandising Survey: a matrixdropdown whose rows are the products chosen in the designer
// (row value = product id, row text = product description). The rows are written into the form
// JSON like a hand-built matrix, so renderers need no product lookup. Changing the products
// means editing the task type. Uses its own properties (not productRelated/productRefs) so that
// Task creation does not ask for products. Any renderer must register these properties too.
// Dynamic Merchandising Survey: the same, but a matrixdynamic where the agent adds rows and picks
// each row's product from the first column's dropdown, whose choices are the chosen products.
if (!Serializer.findProperty('matrixdropdownbase', 'merchSurvey')) {
  Serializer.addProperty('matrixdropdownbase', { name: 'merchSurvey:boolean', default: false, visible: false })
}
if (!Serializer.findProperty('matrixdropdownbase', 'merchProductRefs')) {
  Serializer.addProperty('matrixdropdownbase', {
    name: 'merchProductRefs',
    type: 'productrefs',
    displayName: 'Products',
    category: 'general',
    visibleIf: (obj) => !!obj?.merchSurvey,
  })
}

export const setMerchProducts = (question, products) => {
  question.merchProductRefs = products
  const items = products.map((p) => ({ value: p.id, text: p.description }))
  if (question.getType() === 'matrixdynamic') question.columns[0].choices = items
  else question.rows = items
}
