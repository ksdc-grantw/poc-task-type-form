import { BASE_SEED } from '../shared/baseSeed.js'
import { checkboxes, dropdown, photo, radio, textArea, yesNo } from './components.js'

const FORMIO_VERSION = '5.6.1'
const required = { validate: { required: true } }

const form = (version, components) => ({
  version,
  formioVersion: FORMIO_VERSION,
  schema: { display: 'form', components },
})

// The same demo task types as the SurveyJS engine, in Form.io's own schema.
export const SEED = [
  ...BASE_SEED,
  {
    id: 5,
    name: 'Promo Display Compliance',
    function: 'FORM',
    status: 'ACTIVE',
    daysPriorToDueDate: 1,
    daysToExpiry: 2,
    form: form(1, [
      yesNo('displayPresent', 'Is the promotional display set up?', required),
      dropdown('displayType', 'Display type', ['Gondola end', 'Floor stand', 'Counter unit', 'Fridge branding']),
      photo('displayPhoto', 'Photo of the display'),
      textArea('reasonMissing', 'If the display is not set up, why not?'),
    ]),
  },
  {
    id: 6,
    name: 'Stock Availability Check',
    function: 'FORM',
    status: 'ACTIVE',
    daysPriorToDueDate: 0,
    daysToExpiry: 1,
    form: form(1, [
      radio('outOfStockCause', 'Main cause of out-of-stocks', [
        'Not ordered',
        'Delivery late',
        'Stock in backroom',
        'Delisted',
      ]),
    ]),
  },
  {
    id: 7,
    name: 'Store Visit Feedback',
    function: 'FORM',
    status: 'INACTIVE',
    daysPriorToDueDate: 0,
    daysToExpiry: 3,
    form: form(2, [
      checkboxes('topics', 'Topics discussed', ['Pricing', 'Promotions', 'Deliveries', 'Merchandising', 'New products']),
      yesNo('followUp', 'Does the store need a follow-up call?'),
      textArea('notes', 'Other notes'),
    ]),
  },
  {
    id: 8,
    name: 'Shelf & Customer Photos',
    function: 'FORM',
    status: 'ACTIVE',
    daysPriorToDueDate: 0,
    daysToExpiry: 1,
    form: form(1, [
      photo('shelfPhotos', 'Shelf photos', { description: 'Up to 5 photos, one per bay.', multiple: true, ...required }),
      yesNo('customerConsent', 'Did a customer agree to be photographed?'),
      photo('customerPhotos', 'Customer photos', { description: 'Only if the customer agreed.', multiple: true }),
      textArea('notes', 'Notes'),
    ]),
  },
  {
    id: 9,
    name: 'Returns Bay Inspection',
    function: 'FORM',
    status: 'ACTIVE',
    daysPriorToDueDate: 0,
    daysToExpiry: 2,
    form: form(1, [
      photo('returnsBayPhotos', 'Returns bay inspection', {
        description:
          "Photograph the whole returns bay, then take close-ups of: our products waiting to be returned (labels and expiry dates readable), damaged or leaking stock, expired stock still on the shelf, and any of our stock mixed in with other suppliers' returns. Also photograph blocked access, a missing returns label, or a missing returns form.",
        multiple: true,
        ...required,
      }),
    ]),
  },
]
