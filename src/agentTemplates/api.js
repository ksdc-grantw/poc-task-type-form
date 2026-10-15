import { SEED } from './seed.js'

const STORAGE_KEY = 'poc.agentTemplates.v1'
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

const read = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) return JSON.parse(raw)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED))
  return SEED
}

// Mock backend for the agent templates table, persisted in localStorage.
export const agentTemplateApi = {
  async list() {
    await delay()
    return read()
  },

  async reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED))
    await delay()
    return SEED
  },

  async get(id) {
    await delay()
    const found = read().find((t) => t.id === id)
    if (!found) throw new Error(`Agent template ${id} not found`)
    return found
  },

  // The id is immutable; the form version only increments when the schema changes.
  async update(id, { name, description, schema }) {
    await delay()
    const items = read()
    const index = items.findIndex((t) => t.id === id)
    if (index === -1) throw new Error(`Agent template ${id} not found`)
    const prev = items[index]
    const changed = JSON.stringify(prev.form.schema) !== JSON.stringify(schema)
    items[index] = {
      ...prev,
      name,
      description,
      form: { ...prev.form, version: prev.form.version + (changed ? 1 : 0), schema },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    return items[index]
  },
}
