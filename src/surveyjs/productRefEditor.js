import { PropertyGridEditorCollection } from 'survey-creator-core'
import { expandProducts, parseRefs } from '../products/productApi.js'

// Property grid editor for productRefs: a read-only label with the total number of
// distinct products under the selected items.
PropertyGridEditorCollection.register({
  fit: (prop) => prop.type === 'productrefs',
  getJSON: () => ({ type: 'text', readOnly: true }),
  onCreated: (obj, question) => {
    question.valueFromDataCallback = (refs) => `${expandProducts(parseRefs(refs)).length} selected`
  },
})
