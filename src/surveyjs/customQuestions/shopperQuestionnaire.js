import { defineCustomQuestion } from './defineCustomQuestion.js'

const ratingScale = (rateMax, minRateDescription, maxRateDescription) => ({
  type: 'rating',
  rateMin: 1,
  rateMax,
  minRateDescription,
  maxRateDescription,
})

const likingChoices = ['The Smell', 'The Chilli Taste', 'The Saltiness', 'The Colour']

// Shopper Questionnaire: a dynamic panel per product. The chosen products become the choices of
// its first question, the product dropdown.
export default defineCustomQuestion({
  name: 'shopperquestionnaire',
  title: 'Shopper Questionnaire',
  // A shopping bag with a tick.
  icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4 8H20L19 21H5ZM5.6 9.5H18.4L17.6 19.5H6.4Z"/><path d="M8.25 8V6.5A3.75 3.75 0 0 1 15.75 6.5V8H14.25V6.5A2.25 2.25 0 0 0 9.75 6.5V8ZM9 14.2 10.06 13.14 11.25 14.33 13.94 11.64 15 12.7 11.25 16.45Z"/></svg>',
  marker: { on: 'paneldynamic', name: 'shopperQuestionnaire' },
  products: {
    on: 'paneldynamic',
    name: 'shopperProductRefs',
    visibleIf: (obj) => !!obj?.shopperQuestionnaire,
    apply: (question, products) => {
      question.shopperProductRefs = products
      const productQuestion = question.template.questions[0]
      if (productQuestion) productQuestion.choices = products.map((p) => ({ value: p.id, text: p.description }))
    },
  },
  // Applies to every dynamic panel; this is the only one that offers the min/max counts.
  displayNames: { minPanelCount: 'Minimum products', maxPanelCount: 'Maximum products' },
  json: {
    type: 'paneldynamic',
    title: 'Shopper Questionnaire',
    shopperQuestionnaire: true,
    templateTitle: '{panel.product}',
    panelCount: 1,
    minPanelCount: 1,
    addPanelText: 'Add product',
    templateElements: [
      { type: 'dropdown', name: 'product', title: 'Product', isRequired: true, choices: [] },
      { name: 'liking', title: 'How much did you like this product?', ...ratingScale(5, 'Disliked it a lot', 'Liked it a lot') },
      {
        type: 'dropdown',
        name: 'likeMost',
        title: 'What do you like the MOST about this product?',
        choices: likingChoices,
        showOtherItem: true,
      },
      {
        type: 'dropdown',
        name: 'likeLeast',
        title: 'What do you like the LEAST about this product?',
        choices: likingChoices,
        showOtherItem: true,
      },
      { name: 'texture', title: 'How would you rate the texture of this product?', ...ratingScale(5, 'Very soft', 'Very hard') },
      { type: 'text', name: 'textureDislike', title: 'What do you like the least about the texture of this product?' },
      {
        type: 'dropdown',
        name: 'serving',
        title: 'How are you serving this product?',
        choices: ['With rice', 'With pap', 'With paste', 'With samp', 'As a thickener'],
        showOtherItem: true,
      },
      {
        name: 'recommend',
        title: 'How likely are you to recommend this product to a friend?',
        ...ratingScale(10, 'Very unlikely', 'Very likely'),
      },
    ],
  },
})
