import { ComponentCollection } from 'survey-core'
import './photoOnly.js'

// Mock principal product catalogue. In a real app this would come from the backend
// (e.g. `choicesByUrl`), not be hard-coded.
export const PRODUCTS = [
  { value: '6001234500011', text: 'Cola 330ml' },
  { value: '6001234500028', text: 'Cola 2L' },
  { value: '6001234500035', text: 'Lemon 330ml' },
  { value: '6001234500042', text: 'Water 500ml' },
  { value: '6001234500059', text: 'Energy Drink 250ml' },
]

// Custom question types. Any renderer (preview page, device app) must register the same
// definitions, otherwise questions of these types are skipped.
const CUSTOM_QUESTIONS = [
  // Specialized question: a single built-in question (dropdown) with locked settings.
  // Saved as { "type": "product" }; the answer is the product code.
  {
    name: 'product',
    title: 'Product',
    iconName: 'icon-toolbox-tagbox-24x24',
    defaultQuestionTitle: 'Product',
    questionJSON: {
      type: 'dropdown',
      placeholder: 'Select a product...',
      choices: PRODUCTS,
    },
  },
  // Composite question: several fields that are added, moved and saved as one question.
  // Saved as { "type": "pricecheck" }; the answer is
  // { product, shelfPrice, promoPrice, tagCorrect }.
  {
    name: 'pricecheck',
    title: 'Price Check',
    iconName: 'icon-toolbox-multipletext-24x24',
    defaultQuestionTitle: 'Price check',
    elementsJSON: [
      { type: 'product', name: 'product', title: 'Product', isRequired: true },
      { type: 'text', name: 'shelfPrice', title: 'Shelf price', inputType: 'number', min: 0, step: 0.01, isRequired: true },
      { type: 'text', name: 'promoPrice', title: 'Promo price (if any)', inputType: 'number', min: 0, step: 0.01, startWithNewLine: false },
      { type: 'boolean', name: 'tagCorrect', title: 'Is the price tag correct?' },
    ],
  },
]

for (const definition of CUSTOM_QUESTIONS) {
  if (!ComponentCollection.Instance.getCustomQuestionByName(definition.name)) {
    ComponentCollection.Instance.add(definition)
  }
}
