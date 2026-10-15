import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import { PlainLight } from 'survey-core/themes'
import 'survey-core/survey-core.css'
import '../surveyjs/customQuestions.js'
import { agentTemplateApi } from './api.js'
import { BASE_PATH } from './constants.js'

function buildModel(schema) {
  const model = new Model(schema)
  model.applyTheme(PlainLight)
  return model
}

// Renders a template inside a phone-sized frame, the way an Agent would see it on the device.
export default function AgentTemplatePreview() {
  const { id } = useParams()
  const [template, setTemplate] = useState(null)
  const [model, setModel] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    agentTemplateApi
      .get(id)
      .then((record) => {
        if (cancelled) return
        setTemplate(record)
        setModel(buildModel(record.form.schema))
      })
      .catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to={BASE_PATH} className="text-sm text-blue-600 hover:underline">
            ← Agent Templates
          </Link>
          <h2 className="text-xl font-semibold">{template ? template.name : 'Preview'}</h2>
          {template && <p className="text-sm text-slate-500">Form v{template.form.version}</p>}
        </div>
        {template && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModel(buildModel(template.form.schema))}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
            >
              Restart
            </button>
            <Link
              to={`${BASE_PATH}/${id}`}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Edit
            </Link>
          </div>
        )}
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!error && !model && <p className="text-slate-400">Loading...</p>}

      {model && (
        <div className="mx-auto h-[740px] w-[380px] rounded-[2.5rem] border-[10px] border-slate-800 bg-slate-800 shadow-xl">
          <div className="h-full overflow-y-auto rounded-[1.75rem] bg-white">
            <h3 className="border-b border-slate-200 px-4 py-3 text-base font-semibold">{template.name}</h3>
            <Survey model={model} />
          </div>
        </div>
      )}
    </main>
  )
}
