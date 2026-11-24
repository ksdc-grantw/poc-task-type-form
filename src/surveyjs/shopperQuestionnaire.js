import { Serializer } from 'survey-core'

// Shopper Questionnaire: a dynamic panel whose first question is the product dropdown. The
// products chosen in the designer become that dropdown's choices (value = product id, text =
// description), written into the form JSON so renderers need no product lookup.
if (!Serializer.findProperty('paneldynamic', 'shopperQuestionnaire')) {
  Serializer.addProperty('paneldynamic', { name: 'shopperQuestionnaire:boolean', default: false, visible: false })
}
if (!Serializer.findProperty('paneldynamic', 'shopperProductRefs')) {
  Serializer.addProperty('paneldynamic', {
    name: 'shopperProductRefs',
    type: 'productrefs',
    displayName: 'Products',
    category: 'general',
    visibleIf: (obj) => !!obj?.shopperQuestionnaire,
  })
}

export const setShopperProducts = (question, products) => {
  question.shopperProductRefs = products
  const productQuestion = question.template.questions[0]
  if (productQuestion) productQuestion.choices = products.map((p) => ({ value: p.id, text: p.description }))
}
