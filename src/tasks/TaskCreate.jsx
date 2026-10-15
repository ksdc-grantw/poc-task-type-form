import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import engine from '../surveyjs/engine.js'
import ProductPicker from './ProductPicker.jsx'
import { expandProducts, toSnapshot } from '../products/productApi.js'
import { productQuestions } from './productQuestions.js'
import { taskApi } from './taskApi.js'

const MODE_LABEL = { single: 'One answer for all products', each: 'Repeated for each product' }

export default function TaskCreate() {
  const navigate = useNavigate()
  const [taskTypes, setTaskTypes] = useState(null)
  const [taskTypeId, setTaskTypeId] = useState('')
  const [bindings, setBindings] = useState({})
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    engine.api.listTaskTypes().then((all) => setTaskTypes(all.filter((t) => t.status === 'ACTIVE')))
  }, [])

  const taskType = taskTypes?.find((t) => t.id === Number(taskTypeId))
  const questions = useMemo(
    () => (taskType?.form?.schema ? productQuestions(taskType.form.schema) : []),
    [taskType],
  )

  const choose = (id) => {
    setTaskTypeId(id)
    setError(null)
    const next = taskTypes?.find((t) => t.id === Number(id))
    const defaults = next?.form?.schema ? productQuestions(next.form.schema) : []
    setBindings(Object.fromEntries(defaults.map((q) => [q.name, q.defaultItems])))
  }

  const save = async () => {
    const missing = questions.filter((q) => !bindings[q.name]?.length)
    if (!taskType) return setError('Choose a task type')
    if (missing.length) return setError(`Choose products for: ${missing.map((q) => q.title).join(', ')}`)
    setSaving(true)
    try {
      // Snapshot the items and the products they expand to, so the Task doesn't change
      // if the catalogue does.
      const productBindings = Object.fromEntries(
        questions.map((q) => [
          q.name,
          {
            mode: q.mode,
            items: bindings[q.name].map(toSnapshot),
            products: expandProducts(bindings[q.name]).map(toSnapshot),
          },
        ]),
      )
      await taskApi.create({
        taskTypeId: taskType.id,
        taskTypeName: taskType.name,
        formVersion: taskType.form?.version ?? null,
        productBindings,
      })
      navigate('/tasks')
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link to="/tasks" className="text-sm text-blue-600 hover:underline">
        ← Tasks
      </Link>
      <h2 className="mb-6 text-xl font-semibold">New Task</h2>

      <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Task type</span>
          <select
            value={taskTypeId}
            onChange={(e) => choose(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">Select a task type...</option>
            {taskTypes?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        {taskType && questions.length === 0 && (
          <p className="text-sm text-slate-500">This task type has no product-specific questions.</p>
        )}

        {questions.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              These questions relate to products. Choose which ones each applies to for this Task.
            </p>
            {questions.map((q) => (
              <div key={q.name}>
                <p className="mb-1 text-sm font-medium">
                  {q.title}
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
                    {MODE_LABEL[q.mode]}
                  </span>
                </p>
                <ProductPicker
                  value={bindings[q.name]}
                  onChange={(v) => setBindings((b) => ({ ...b, [q.name]: v }))}
                />
              </div>
            ))}
          </div>
        )}

        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Create Task
          </button>
        </div>
      </div>
    </main>
  )
}
