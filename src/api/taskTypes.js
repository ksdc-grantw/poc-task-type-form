// Mock backend for task types, persisted in localStorage.
const STORAGE_KEY = 'poc.taskTypes'

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
