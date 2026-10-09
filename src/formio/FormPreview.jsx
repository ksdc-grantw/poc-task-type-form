import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Formio } from '@formio/js'
import { useEngine } from '../shared/EngineContext.js'
import './formio.css'

const SUBMIT = { type: 'button', action: 'submit', key: 'submit', label: 'Submit', theme: 'primary', input: true }

// Renders a FORM task type with the Form.io renderer only (no builder), inside a phone-sized
// frame, the way an agent would see it on a device.
export default function FormPreview() {
  const { api, basePath } = useEngine()
  const { id } = useParams()
  const host = useRef(null)
  const [taskType, setTaskType] = useState(null)
  const [error, setError] = useState(null)
  const [run, setRun] = useState(0)

  useEffect(() => {
    let cancelled = false
    api
      .getTaskType(id)
      .then((record) => {
        if (cancelled) return
        if (!record.form?.schema) throw new Error('This task type has no form.')
        setTaskType(record)
      })
      .catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [api, id])

  useEffect(() => {
    if (!taskType) return
    let cancelled = false
    let instance = null
    const { schema } = taskType.form
    Formio.createForm(host.current, { ...schema, components: [...schema.components, SUBMIT] })
      .then((form) => {
        if (cancelled) return form.destroy(true)
        instance = form
      })
      .catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
      instance?.destroy(true)
    }
  }, [taskType, run])

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to={basePath} className="text-sm text-blue-600 hover:underline">
            ← Task Types
          </Link>
          <h2 className="text-xl font-semibold">{taskType ? taskType.name : 'Preview'}</h2>
          {taskType && <p className="text-sm text-slate-500">Form v{taskType.form.version}</p>}
        </div>
        {taskType && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRun((n) => n + 1)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
            >
              Restart
            </button>
            <Link
              to={`${basePath}/task-types/${id}`}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Edit
            </Link>
          </div>
        )}
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!error && !taskType && <p className="text-slate-400">Loading...</p>}

      {taskType && (
        <div className="mx-auto h-[740px] w-[380px] rounded-[2.5rem] border-[10px] border-slate-800 bg-slate-800 shadow-xl">
          <div className="h-full overflow-y-auto rounded-[1.75rem] bg-white p-4">
            <div ref={host} className="formio-scope" />
          </div>
        </div>
      )}
    </main>
  )
}
