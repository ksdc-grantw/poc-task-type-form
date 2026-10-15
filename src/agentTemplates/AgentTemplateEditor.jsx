import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { agentTemplateApi } from './api.js'
import { BASE_PATH } from './constants.js'

const FormDesigner = lazy(() => import('../surveyjs/FormDesigner.jsx'))

const inputCls = 'mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm disabled:bg-slate-100 disabled:text-slate-500'

export default function AgentTemplateEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [template, setTemplate] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [schema, setSchema] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    agentTemplateApi
      .get(id)
      .then((record) => {
        if (cancelled) return
        setTemplate(record)
        setName(record.name)
        setDescription(record.description)
        setSchema(record.form.schema)
      })
      .catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [id])

  const save = async () => {
    if (!name.trim()) return setError('Name is required')
    setSaving(true)
    try {
      await agentTemplateApi.update(id, { name: name.trim(), description: description.trim(), schema })
      navigate(BASE_PATH)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (!template) return <p className="p-6 text-slate-400">{error ?? 'Loading...'}</p>

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link to={BASE_PATH} className="text-sm text-slate-500 hover:underline">
              ← Agent Templates
            </Link>
            <h2 className="text-xl font-semibold">{template.name}</h2>
          </div>
          <div className="flex gap-2">
            <Link to={BASE_PATH} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100">
              Cancel
            </Link>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="block text-xs font-medium text-slate-600">
            ID
            <input className={inputCls} value={template.id} disabled />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Name
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Description
            <input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
        </div>
        {error && <p className="mt-4 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      </div>

      <div className="min-h-[600px] min-w-0 flex-1">
        <Suspense fallback={<p className="p-6 text-slate-400">Loading form designer...</p>}>
          <FormDesigner initialSchema={template.form.schema} onChange={setSchema} />
        </Suspense>
      </div>
    </div>
  )
}
