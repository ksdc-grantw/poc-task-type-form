import { Serializer } from 'survey-core'

// Relates a question to a product, product line or category. Stored as "level:id"
// (see productApi.js). A question with a value is product-related: the value is the form's
// default, which task creation may override at the same level.
// Any renderer must register this property too.
if (!Serializer.findProperty('question', 'productRef')) {
  // Custom type, edited with buttons and a modal (see productRefEditor.js).
  Serializer.addProperty('question', {
    name: 'productRef',
    type: 'productref',
    displayName: 'Related to Product',
    category: 'general',
  })
}
