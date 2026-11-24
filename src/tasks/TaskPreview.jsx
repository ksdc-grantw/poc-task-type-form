import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import { PlainLight } from 'survey-core/themes'
import 'survey-core/survey-core.css'
import engine from '../surveyjs/engine.js'
import '../surveyjs/customQuestions.js'
import { taskApi } from './taskApi.js'
import TaskPayloads from './TaskPayloads.jsx'
import { externalTaskPayload } from './taskPayloads.js'

// The form as the agent would see it on the device.
function buildModel(schema, instruction) {
  const model = new Model(schema)
  model.applyTheme(PlainLight)
  if (instruction) {
    for (const [name, value] of Object.entries(instruction.variables ?? {})) model.setVariable(name, value)
  }
  return model
}

export default function TaskPreview() {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [taskType, setTaskType] = useState(null)
  const [model, setModel] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    taskApi
      .get(id)
      .then(async (t) => {
        const taskType = await engine.api.getTaskType(t.taskTypeId)
        if (cancelled) return
        const schema = taskType.form?.schema
        if (!schema) throw new Error('This task has no form.')
        setTask(t)
        setTaskType(taskType)
        setModel(buildModel(schema, t.instruction))
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
            {task?.instruction && (
              <p className="whitespace-pre-line border-b border-slate-200 bg-slate-50 p-4 text-sm">{task.instruction.text}</p>
            )}
            <Survey model={model} />
          </div>
        </div>
      )}
      {task && taskType && (
        <div className="mt-6">
          <TaskPayloads saved={task} savedTitle={`GET /tasks/${task.id}`} external={externalTaskPayload(task, taskType)} />
        </div>
      )}
    </main>
  )
}
