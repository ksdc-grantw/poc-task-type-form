import { BASE_SEED } from '../shared/baseSeed.js'

export const SEED = [
  ...BASE_SEED,
  // Demo FORM task types: each targets a different goal and uses only preset toolbox types.
  {
    id: 5,
    name: 'Promo Display Compliance',
    function: 'FORM',
    status: 'ACTIVE',
    daysPriorToDueDate: 1,
    daysToExpiry: 2,
    form: {
      version: 1,
      surveyjsVersion: '3.2.0',
      schema: {
        pages: [
          {
            name: 'page1',
            elements: [
              { type: 'boolean', name: 'displayPresent', title: 'Is the promotional display set up?', isRequired: true },
              {
                type: 'dropdown',
                name: 'displayType',
                title: 'Display type',
                choices: ['Gondola end', 'Floor stand', 'Counter unit', 'Fridge branding'],
              },
              { type: 'file', name: 'displayPhoto', title: 'Photo of the display', photoOnly: true, acceptedCategories: ['image'] },
              { type: 'comment', name: 'reasonMissing', title: 'If the display is not set up, why not?' },
            ],
          },
        ],
      },
    },
  },
  {
    id: 6,
    name: 'Stock Availability Check',
    function: 'FORM',
    status: 'ACTIVE',
    daysPriorToDueDate: 0,
    daysToExpiry: 1,
    form: {
      version: 1,
      surveyjsVersion: '3.2.0',
      schema: {
        pages: [
          {
            name: 'page1',
            elements: [
              {
                type: 'radiogroup',
                name: 'outOfStockCause',
                title: 'Main cause of out-of-stocks',
                choices: ['Not ordered', 'Delivery late', 'Stock in backroom', 'Delisted'],
                showOtherItem: true,
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: 7,
    name: 'Store Visit Feedback',
    function: 'FORM',
    status: 'INACTIVE',
    daysPriorToDueDate: 0,
    daysToExpiry: 3,
    form: {
      version: 2,
      surveyjsVersion: '3.2.0',
      schema: {
        pages: [
          {
            name: 'page1',
            elements: [
              {
                type: 'checkbox',
                name: 'topics',
                title: 'Topics discussed',
                choices: ['Pricing', 'Promotions', 'Deliveries', 'Merchandising', 'New products'],
              },
              { type: 'boolean', name: 'followUp', title: 'Does the store need a follow-up call?' },
              { type: 'comment', name: 'notes', title: 'Other notes' },
            ],
          },
        ],
      },
    },
  },
  {
    id: 8,
    name: 'Shelf & Customer Photos',
    function: 'FORM',
    status: 'ACTIVE',
    daysPriorToDueDate: 0,
    daysToExpiry: 1,
    form: {
      version: 1,
      surveyjsVersion: '3.2.0',
      schema: {
        pages: [
          {
            name: 'page1',
            elements: [
              {
                type: 'file',
                name: 'shelfPhotos',
                title: 'Shelf photos',
                description: 'Up to 5 photos, one per bay.',
                isRequired: true,
                allowMultiple: true,
                photoOnly: true, acceptedCategories: ['image'],
                sourceType: 'file-camera',
              },
              { type: 'boolean', name: 'customerConsent', title: 'Did a customer agree to be photographed?' },
              {
                type: 'file',
                name: 'customerPhotos',
                title: 'Customer photos',
                description: 'Only if the customer agreed.',
                allowMultiple: true,
                photoOnly: true, acceptedCategories: ['image'],
                sourceType: 'camera',
              },
              { type: 'comment', name: 'notes', title: 'Notes' },
            ],
          },
        ],
      },
    },
  },
  {
    id: 9,
    name: 'Returns Bay Inspection',
    function: 'FORM',
    status: 'ACTIVE',
    daysPriorToDueDate: 0,
    daysToExpiry: 2,
    form: {
      version: 1,
      surveyjsVersion: '3.2.0',
      schema: {
        pages: [
          {
            name: 'page1',
            elements: [
              {
                type: 'file',
                name: 'returnsBayPhotos',
                title: 'Returns bay inspection',
                description:
                  'Photograph the whole returns bay, then take close-ups of: our products waiting to be returned (labels and expiry dates readable), damaged or leaking stock, expired stock still on the shelf, and any of our stock mixed in with other suppliers\' returns. Also photograph blocked access, a missing returns label, or a missing returns form.',
                isRequired: true,
                allowMultiple: true,
                photoOnly: true,
                acceptedCategories: ['image'],
                sourceType: 'file-camera',
              },
            ],
          },
        ],
      },
    },
  },
]
