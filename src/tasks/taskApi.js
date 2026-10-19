export const TASKS_KEY = 'poc.tasks.v6'
const KEY = TASKS_KEY
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

const read = () => JSON.parse(localStorage.getItem(KEY) ?? '[]')
const write = (tasks) => localStorage.setItem(KEY, JSON.stringify(tasks))

// Mock backend for Tasks. A Task is a task type plus (for FORM types) the product chosen
// for each product-specific question:
// productBindings[questionName] = { mode: 'single' | 'each', products: [...] }
// where products is a snapshot of the chosen product objects.
export const taskApi = {
  async list() {
    await delay()
    return read()
  },

  async get(id) {
    await delay()
    const found = read().find((t) => t.id === Number(id))
    if (!found) throw new Error(`Task ${id} not found`)
    return found
  },

  // POST /tasks
  async create(payload) {
    await delay()
    const tasks = read()
    const created = {
      id: Math.max(0, ...tasks.map((t) => t.id)) + 1,
      createdAt: new Date().toISOString(),
      ...payload,
    }
    write([...tasks, created])
    return created
  },
}
