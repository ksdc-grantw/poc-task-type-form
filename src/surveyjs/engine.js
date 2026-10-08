import { lazy } from 'react'
import { Version as SURVEYJS_VERSION } from 'survey-core'
import { createTaskTypeApi } from '../shared/createTaskTypeApi.js'
import { SEED } from './seed.js'

const api = createTaskTypeApi({ storageKey: 'poc.taskTypes.v7', seed: SEED })

function countQuestions(schema) {
  const walk = (elements = []) =>
    elements.reduce((n, el) => {
      if (el.type === 'panel') return n + walk(el.elements)
      if (el.type === 'paneldynamic') return n + 1 + walk(el.templateElements)
      return n + (el.type === 'html' ? 0 : 1)
    }, 0)
  return (schema?.pages ?? []).reduce((n, p) => n + walk(p.elements), 0)
}

// The version only increments when the form definition actually changes.
function buildForm(prev, schema) {
  const changed = !prev || JSON.stringify(prev.schema) !== JSON.stringify(schema)
  return {
    version: prev ? prev.version + (changed ? 1 : 0) : 1,
    surveyjsVersion: SURVEYJS_VERSION,
    schema,
  }
}

const engine = {
  id: 'surveyjs',
  label: 'SurveyJS',
  basePath: '/surveyjs',
  api,
  FormDesigner: lazy(() => import('./FormDesigner.jsx')),
  FormPreview: lazy(() => import('./FormPreview.jsx')),
  countQuestions,
  buildForm,
}

export default engine
