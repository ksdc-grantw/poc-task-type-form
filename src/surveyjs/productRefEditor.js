import { PropertyGridEditorCollection } from 'survey-creator-core'

// Property grid editor for productRefs: a read-only label with the number of selected products.
PropertyGridEditorCollection.register({
  fit: (prop) => prop.type === 'productrefs',
  getJSON: () => ({ type: 'text', readOnly: true }),
  onCreated: (obj, question) => {
    question.valueFromDataCallback = (refs) => `${refs?.length ?? 0} selected`
  },
})
