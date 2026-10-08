// Mock backend for task types, persisted in localStorage.
const STORAGE_KEY = 'poc.taskTypes.v7'

export const FUNCTIONS = {
  PDF: 'PDF',
  PHOTO: 'Take Photo',
  LOCATION: 'Save Location',
  ORDPAD: 'Order Pad',
  FORM: 'Form',
}

const SEED = [
  {
    id: 1,
    name: 'Fridge Compliance Survey',
    function: 'PDF',
    status: 'ACTIVE',
    daysPriorToDueDate: 2,
    daysToExpiry: 3,
    attachment: { fileName: 'fridge-compliance.pdf', size: 482113 },
  },
  {
    id: 2,
    name: 'Shelf Photo',
    function: 'PHOTO',
    status: 'ACTIVE',
    daysPriorToDueDate: 0,
    daysToExpiry: 1,
  },
  {
    id: 3,
    name: 'Save Location',
    function: 'LOCATION',
    status: 'ACTIVE',
    daysPriorToDueDate: 0,
    daysToExpiry: 7,
  },
  {
    id: 4,
    name: 'Order Pad',
    function: 'ORDPAD',
    status: 'INACTIVE',
    daysPriorToDueDate: 1,
    daysToExpiry: 2,
  },
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

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

function read() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) return JSON.parse(raw)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED))
  return SEED
}

export async function listTaskTypes() {
  await delay()
  return read()
}

export async function resetTaskTypes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED))
  await delay()
  return SEED
}

// Only one task type of each of these functions may exist; the name is fixed to the label.
export const SINGLE_INSTANCE = ['LOCATION', 'ORDPAD']

const write = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items))

export async function getTaskType(id) {
  await delay()
  const found = read().find((t) => t.id === Number(id))
  if (!found) throw new Error(`Task type ${id} not found`)
  return found
}

// POST /task-types
export async function createTaskType(payload) {
  await delay()
  const items = read()
  if (items.some((t) => t.name.toLowerCase() === payload.name.toLowerCase())) {
    throw new Error(`A task type named "${payload.name}" already exists`)
  }
  if (SINGLE_INSTANCE.includes(payload.function) && items.some((t) => t.function === payload.function)) {
    throw new Error(`Only one ${FUNCTIONS[payload.function]} task type is allowed`)
  }
  const created = { id: Math.max(0, ...items.map((t) => t.id)) + 1, ...payload }
  write([...items, created])
  return created
}

// PUT /task-types/:id. Name and function are locked, so they are ignored here.
export async function updateTaskType(id, payload) {
  await delay()
  const items = read()
  const index = items.findIndex((t) => t.id === Number(id))
  if (index === -1) throw new Error(`Task type ${id} not found`)
  // eslint-disable-next-line no-unused-vars
  const { name, function: fn, ...editable } = payload
  const updated = { ...items[index], ...editable }
  items[index] = updated
  write(items)
  return updated
}
