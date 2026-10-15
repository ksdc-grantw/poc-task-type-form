import { Serializer } from 'survey-core'
import { listByLevel } from '../products/productApi.js'

// Marks a question as being about a product, product line or category. The form stores the
// level, plus an optional default product (productRef) that task creation may override.
// Any renderer must register these properties too.
export const PRODUCT_SCOPES = [
  { value: 'none', text: 'Not product-specific' },
  { value: 'product', text: 'A product' },
  { value: 'line', text: 'A product line' },
  { value: 'category', text: 'A category' },
]

if (!Serializer.findProperty('question', 'productScope')) {
  Serializer.addProperty('question', {
    name: 'productScope',
    displayName: 'Related to',
    default: 'none',
    choices: PRODUCT_SCOPES,
    category: 'general',
  })
}

if (!Serializer.findProperty('question', 'productRef')) {
  Serializer.addProperty('question', {
    name: 'productRef',
    displayName: 'Default product',
    category: 'general',
    dependsOn: ['productScope'],
    visibleIf: (obj) => !!obj.productScope && obj.productScope !== 'none',
    choices: (obj) => [
      { value: '', text: 'None (choose at task creation)' },
      ...listByLevel(obj.productScope).map((i) => ({ value: i.id, text: i.path })),
    ],
  })
}
