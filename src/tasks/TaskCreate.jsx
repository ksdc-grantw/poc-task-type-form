import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import engine from '../surveyjs/engine.js'
import { taskApi } from './taskApi.js'
import TaskPayloads from './TaskPayloads.jsx'
import { externalTaskPayload } from './taskPayloads.js'
import { RESPONSE_TYPES, responseVariables } from '../surveyjs/instructionSchema.js'

export default function TaskCreate() {
  const navigate = useNavigate()
  const [taskTypes, setTaskTypes] = useState(null)
  const [taskTypeId, setTaskTypeId] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [instruction, setInstruction] = useState('')
  const [responses, setResponses] = useState([])
  const toggleResponse = (key) =>
    setResponses((r) => (r.includes(key) ? r.filter((k) => k !== key) : [...r, key]))

  useEffect(() => {
    engine.api.listTaskTypes().then((all) => setTaskTypes(all.filter((t) => t.status === 'ACTIVE')))
  }, [])

  const taskType = taskTypes?.find((t) => t.id === Number(taskTypeId))
  const isInstruction = taskType?.function === 'INSTRUCTION'

  const choose = (id) => {
    setTaskTypeId(id)
    setError(null)
  }

  const payload = useMemo(
    () =>
      taskType && {
        taskTypeId: taskType.id,
        taskTypeName: taskType.name,
        formVersion: taskType.form?.version ?? null,
        ...(isInstruction && { instruction: { text: instruction.trim(), variables: responseVariables(responses) } }),
      },
    [taskType, isInstruction, instruction, responses],
  )

  const save = async () => {
    if (!taskType) return setError('Choose a task type')
    if (isInstruction && !instruction.trim()) return setError('Enter the instruction')
    if (isInstruction && responses.length === 0) return setError('Choose at least one response type')
    setSaving(true)
    try {
      await taskApi.create(payload)
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
        <fieldset className="space-y-3">
          <legend className="text-sm text-slate-500">
            Shown for comparison with the existing form; not captured in this POC.
          </legend>
          {['Customer Location', 'Occurrence', 'Assignee'].map((label) => (
            <label key={label} className="block text-sm">
              <span className="mb-1 block font-medium">{label}</span>
              <input
                type="text"
                readOnly
                disabled
                className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-slate-500"
              />
            </label>
          ))}
        </fieldset>

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

        {isInstruction && (
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Instruction</span>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={4}
                placeholder="What should the agent do?"
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <fieldset className="text-sm">
              <legend className="mb-1 font-medium">Required response(s)</legend>
              <div className="flex gap-4">
                {Object.entries(RESPONSE_TYPES).map(([key, { label }]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input type="checkbox" checked={responses.includes(key)} onChange={() => toggleResponse(key)} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {payload && (
          <TaskPayloads saved={payload} savedTitle="POST /tasks" external={externalTaskPayload(payload, taskType)} />
        )}

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
