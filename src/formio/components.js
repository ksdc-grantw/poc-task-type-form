// Component definitions for the Form.io engine. Form.io's component schemas are plain objects,
// so the same helpers build both the builder toolbox entries and the seed data.

// Mock principal product catalogue. In a real app this would come from the backend.
export const PRODUCTS = [
  { value: '6001234500011', label: 'Cola 330ml' },
  { value: '6001234500028', label: 'Cola 2L' },
  { value: '6001234500035', label: 'Lemon 330ml' },
  { value: '6001234500042', label: 'Water 500ml' },
  { value: '6001234500059', label: 'Energy Drink 250ml' },
]

const withInput = (schema) => ({ input: true, ...schema })

export const textField = (key, label, extra) => withInput({ type: 'textfield', key, label, ...extra })
export const textArea = (key, label, extra) => withInput({ type: 'textarea', key, label, ...extra })
export const yesNo = (key, label, extra) => withInput({ type: 'checkbox', key, label, ...extra })
export const number = (key, label, extra) => withInput({ type: 'number', key, label, ...extra })
export const checkboxes = (key, label, values, extra) =>
  withInput({ type: 'selectboxes', key, label, values: values.map((v) => ({ label: v, value: v })), ...extra })
export const radio = (key, label, values, extra) =>
  withInput({ type: 'radio', key, label, values: values.map((v) => ({ label: v, value: v })), ...extra })
export const dropdown = (key, label, choices, extra) =>
  withInput({
    type: 'select',
    key,
    label,
    dataSrc: 'values',
    data: { values: choices.map((c) => (typeof c === 'string' ? { label: c, value: c } : c)) },
    ...extra,
  })

// Photo: a file component limited to images, with the camera enabled.
export const photo = (key, label, extra) =>
  withInput({
    type: 'file',
    key,
    label,
    storage: 'base64',
    image: true,
    filePattern: 'image/*',
    webcam: true,
    ...extra,
  })

export const product = (key = 'product', label = 'Product', extra) =>
  dropdown(key, label, PRODUCTS, { placeholder: 'Select a product...', ...extra })

// Price Check is a container, so its answer is { product, shelfPrice, promoPrice, tagCorrect }.
export const priceCheck = (key = 'priceCheck', label = 'Price check') =>
  withInput({
    type: 'container',
    key,
    label,
    tree: false,
    components: [
      product('product', 'Product', { validate: { required: true } }),
      number('shelfPrice', 'Shelf price', { validate: { required: true, min: 0 }, decimalLimit: 2 }),
      number('promoPrice', 'Promo price (if any)', { validate: { min: 0 }, decimalLimit: 2 }),
      yesNo('tagCorrect', 'Is the price tag correct?'),
    ],
  })
