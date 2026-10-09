import { FUNCTIONS, SINGLE_INSTANCE } from './constants.js'

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock backend for task types, persisted in localStorage under the given key.
// Each form engine gets its own storage key and seed, so the apps stay independent.
export function createTaskTypeApi({ storageKey, seed }) {
  const read = () => {
    const raw = localStorage.getItem(storageKey)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(storageKey, JSON.stringify(seed))
    return seed
  }
  const write = (items) => localStorage.setItem(storageKey, JSON.stringify(items))

  return {
    async listTaskTypes() {
      await delay()
      return read()
    },

    async resetTaskTypes() {
      localStorage.setItem(storageKey, JSON.stringify(seed))
      await delay()
      return seed
    },

    async getTaskType(id) {
      await delay()
      const found = read().find((t) => t.id === Number(id))
      if (!found) throw new Error(`Task type ${id} not found`)
      return found
    },

    // POST /task-types
    async createTaskType(payload) {
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
    },

    // PUT /task-types/:id. Name and function are locked, so they are ignored here.
    async updateTaskType(id, payload) {
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
    },
  }
}
