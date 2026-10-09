import { lazy } from 'react'
import { createTaskTypeApi } from '../shared/createTaskTypeApi.js'
import { SEED } from './seed.js'

const api = createTaskTypeApi({ storageKey: 'poc.formio.taskTypes.v1', seed: SEED })

// Form.io components can nest (containers, panels, columns, ...), so walk the tree.
// Layout-only components don't produce answers.
const LAYOUT_TYPES = ['panel', 'columns', 'fieldset', 'content', 'htmlelement', 'well', 'table', 'tabs']

function countQuestions(schema) {
  const walk = (components = []) =>
    components.reduce((n, c) => {
      if (c.type === 'button') return n
      if (LAYOUT_TYPES.includes(c.type)) {
        const children = c.components ?? (c.columns ?? []).flatMap((col) => col.components ?? [])
        return n + walk(children)
      }
      return n + 1
    }, 0)
  return walk(schema?.components)
}

// The version only increments when the form definition actually changes.
function buildForm(prev, schema) {
  const changed = !prev || JSON.stringify(prev.schema) !== JSON.stringify(schema)
  return {
    version: prev ? prev.version + (changed ? 1 : 0) : 1,
    formioVersion: '5.6.1',
    schema,
  }
}

const engine = {
  id: 'formio',
  label: 'Form.io',
  basePath: '/formio',
  api,
  FormDesigner: lazy(() => import('./FormDesigner.jsx')),
  FormPreview: lazy(() => import('./FormPreview.jsx')),
  countQuestions,
  buildForm,
}

export default engine
