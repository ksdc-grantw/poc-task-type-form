import { checkboxes, dropdown, number, photo, priceCheck, product, radio, textArea, textField, yesNo } from './components.js'

// Toolbox entries. Form.io builder groups hold components as { title, key, icon, schema }.
const entry = (title, icon, schema) => ({ title, key: schema.key, icon, schema })

// Same toolbox as the SurveyJS engine: a general "Questions" group and a "Custom" group.
const questions = {
  title: 'Questions',
  default: true,
  weight: 0,
  components: {
    singleLine: entry('Single-Line Input', 'font', textField('singleLine', 'Single-line input')),
    longText: entry('Long Text', 'align-left', textArea('longText', 'Long text')),
    checkboxes: entry('Checkboxes', 'check-square-o', checkboxes('checkboxes', 'Checkboxes', ['Item 1', 'Item 2', 'Item 3'])),
    radio: entry('Radio Button Group', 'dot-circle-o', radio('radio', 'Radio buttons', ['Item 1', 'Item 2', 'Item 3'])),
    dropdown: entry('Dropdown', 'th-list', dropdown('dropdown', 'Dropdown', ['Item 1', 'Item 2', 'Item 3'])),
    yesNo: entry('Yes/No', 'toggle-on', yesNo('yesNo', 'Yes/No')),
  },
}

const custom = {
  title: 'Custom',
  weight: 10,
  components: {
    number: entry('Number', 'hashtag', number('number', 'Number')),
    photo: entry('Photo', 'camera', photo('photo', 'Photo')),
    product: entry('Product', 'tag', product('product', 'Product')),
    priceCheck: entry('Price Check', 'shopping-cart', priceCheck('priceCheck', 'Price check')),
  },
}

// Hide the advanced tabs of the component settings dialog; the rest stays at Form.io defaults.
const HIDDEN_TABS = ['conditional', 'logic', 'layout'].map((key) => ({ key, ignore: true }))
const EDITABLE_TYPES = ['textfield', 'textarea', 'number', 'checkbox', 'selectboxes', 'radio', 'select', 'file', 'container']

export const builderOptions = {
  builder: {
    basic: false,
    advanced: false,
    layout: false,
    data: false,
    premium: false,
    questions,
    custom,
  },
  editForm: Object.fromEntries(EDITABLE_TYPES.map((type) => [type, HIDDEN_TABS])),
  noDefaultSubmitButton: true,
}
