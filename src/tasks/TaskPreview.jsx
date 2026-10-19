import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import { PlainLight } from 'survey-core/themes'
import 'survey-core/survey-core.css'
import engine from '../surveyjs/engine.js'
import '../surveyjs/customQuestions.js'
import { taskApi } from './taskApi.js'

// The form as the agent would see it on the device. A "single" product question is labelled
// with its products; an "each" question becomes a locked dynamic panel with one panel per product.
function transformElements(elements, bindings) {
  return (elements ?? []).map((el) => {
    const binding = bindings[el.name]
    if (el.elements) return { ...el, elements: transformElements(el.elements, bindings) }
    if (!binding) return el
    // eslint-disable-next-line no-unused-vars
    const { productRefs, productMode, productRelated, ...rest } = el
    if (binding.mode === 'each') {
      return {
        type: 'paneldynamic',
        name: el.name,
        title: el.title,
        description: el.description,
        isRequired: el.isRequired,
        templateTitle: '{panel.productName}',
        templateElements: [{ ...rest, name: 'answer', title: 'Answer', description: undefined, isRequired: el.isRequired }],
        panelCount: binding.products.length,
        minPanelCount: binding.products.length,
        maxPanelCount: binding.products.length,
        allowAddPanel: false,
        allowRemovePanel: false,
      }
    }
    const names = binding.products.map((p) => p.description).join(', ')
    return { ...rest, description: [`Products: ${names}`, el.description].filter(Boolean).join('\n') }
  })
}

function buildModel(schema, bindings = {}) {
  const pages = (schema.pages ?? []).map((p) => ({ ...p, elements: transformElements(p.elements, bindings) }))
  const model = new Model({ ...schema, pages })
  model.applyTheme(PlainLight)
  for (const [name, b] of Object.entries(bindings)) {
    if (b.mode === 'each') {
      model.setValue(name, b.products.map((p) => ({ productId: p.id, productName: p.description })))
    }
  }
  return model
}

export default function TaskPreview() {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [model, setModel] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    taskApi
      .get(id)
      .then(async (t) => {
        const taskType = await engine.api.getTaskType(t.taskTypeId)
        if (cancelled) return
        if (!taskType.form?.schema) throw new Error('This task has no form.')
        setTask(t)
        setModel(buildModel(taskType.form.schema, t.productBindings))
      })
      .catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <Link to="/tasks" className="text-sm text-blue-600 hover:underline">
        ← Tasks
      </Link>
      <h2 className="mb-6 text-xl font-semibold">{task ? task.taskTypeName : 'Preview'}</h2>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!error && !model && <p className="text-slate-400">Loading...</p>}
      {model && (
        <div className="mx-auto h-[740px] w-[380px] rounded-[2.5rem] border-[10px] border-slate-800 bg-slate-800 shadow-xl">
          <div className="h-full overflow-y-auto rounded-[1.75rem] bg-white">
            <Survey model={model} />
          </div>
        </div>
      )}
    </main>
  )
}
