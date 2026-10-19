import { SEED as TASK_TYPE_SEED } from '../surveyjs/seed.js'
import { TASK_TYPES_KEY } from '../surveyjs/engine.js'
import { TASKS_KEY } from '../tasks/taskApi.js'
import { productQuestions } from '../tasks/productQuestions.js'
import { PRODUCTS } from '../products/productApi.js'

const TASK_COUNT = 15
const DAY_MS = 24 * 60 * 60 * 1000

// Storage keys from earlier versions, which used to auto-seed on first load.
const STALE_KEYS = ['poc.taskTypes.v15', 'poc.agentTemplates.v1', 'poc.tasks.v5', 'poc.formio.taskTypes.v1']

export const removeStaleData = () => STALE_KEYS.forEach((k) => localStorage.removeItem(k))

function buildTasks() {
  const types = TASK_TYPE_SEED.filter((t) => t.status === 'ACTIVE')
  return Array.from({ length: TASK_COUNT }, (_, i) => {
    const type = types[i % types.length]
    const questions = type.form?.schema ? productQuestions(type.form.schema) : []
    return {
      id: i + 1,
      createdAt: new Date(Date.now() - (TASK_COUNT - i) * 0.4 * DAY_MS).toISOString(),
      taskTypeId: type.id,
      taskTypeName: type.name,
      formVersion: type.form?.version ?? null,
      productBindings: Object.fromEntries(
        questions.map((q) => [
          q.name,
          { mode: q.mode, products: q.defaultProducts.length ? q.defaultProducts : PRODUCTS.slice(0, 2) },
        ]),
      ),
    }
  })
}

export function populateMockData() {
  localStorage.setItem(TASK_TYPES_KEY, JSON.stringify(TASK_TYPE_SEED))
  localStorage.setItem(TASKS_KEY, JSON.stringify(buildTasks()))
}

export function clearMockData() {
  ;[TASK_TYPES_KEY, TASKS_KEY].forEach((k) => localStorage.removeItem(k))
}
