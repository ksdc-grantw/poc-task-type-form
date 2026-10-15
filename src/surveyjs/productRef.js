import { Serializer } from 'survey-core'

// Relates a question to a set of products, lines or categories, stored as an array of
// "level:id" refs (see productApi.js). A question with refs is product-related: they are
// is the form's default set, which task creation may override.
// productMode: "single" = one answer for the whole set; "each" = repeated per product.
// It has no default (a default is omitted from the form JSON), so it is always written
// explicitly: the designer sets it when products are chosen.
// Any renderer must register these properties too.
if (!Serializer.findProperty('question', 'productMode')) {
  Serializer.addProperty('question', {
    name: 'productMode',
    displayName: 'Product answers',
    category: 'general',
    choices: [
      { value: 'single', text: 'One answer for all products' },
      { value: 'each', text: 'Repeat for each product' },
    ],
  })
}
if (!Serializer.findProperty('question', 'productRefs')) {
  // Custom type, edited with buttons and a modal (see productRefEditor.js).
  Serializer.addProperty('question', {
    name: 'productRefs',
    type: 'productrefs',
    displayName: 'Related to Product',
    category: 'general',
  })
}
