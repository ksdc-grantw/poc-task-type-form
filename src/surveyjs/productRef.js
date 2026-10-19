import { Serializer } from 'survey-core'

// Relates a question to products. productRelated is the single switch: the question is answered
// for products chosen from the catalogue. productRefs are optional default products: empty means
// the task creator must choose them; populated means they may accept or override them.
// productMode: "single" = one answer for the whole set; "each" = repeated per product.
// It has no default (a default is omitted from the form JSON), so it is always written
// explicitly: the designer sets it when productRelated is switched on.
// Any renderer must register these properties too.
const whenRelated = (obj) => !!obj?.productRelated
if (!Serializer.findProperty('question', 'productRelated')) {
  Serializer.addProperty('question', {
    name: 'productRelated',
    type: 'boolean',
    default: false,
    displayName: 'Related to Product',
    category: 'general',
  })
}
if (!Serializer.findProperty('question', 'productRefs')) {
  // Custom type, edited with buttons and a modal (see productRefEditor.js).
  Serializer.addProperty('question', {
    name: 'productRefs',
    type: 'productrefs',
    displayName: 'Default products',
    category: 'general',
    dependsOn: ['productRelated'],
    visibleIf: whenRelated,
  })
}
if (!Serializer.findProperty('question', 'productMode')) {
  Serializer.addProperty('question', {
    name: 'productMode',
    displayName: 'Product answers',
    category: 'general',
    dependsOn: ['productRelated'],
    visibleIf: whenRelated,
    choices: [
      { value: 'single', text: 'One answer for all products' },
      { value: 'each', text: 'Repeat for each product' },
    ],
  })
}
