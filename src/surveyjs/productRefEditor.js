import { PropertyGridEditorCollection } from 'survey-creator-core'
import { countProducts, resolveRef } from '../products/productApi.js'

// Property grid editor for productRef: a read-only label with the total number of
// products under the selected item. The Select/Clear buttons and the modal are added in FormDesigner.
PropertyGridEditorCollection.register({
  fit: (prop) => prop.type === 'productref',
  getJSON: () => ({ type: 'text', readOnly: true }),
  onCreated: (obj, question) => {
    question.valueFromDataCallback = (ref) => `${countProducts(resolveRef(ref))} selected`
  },
})
