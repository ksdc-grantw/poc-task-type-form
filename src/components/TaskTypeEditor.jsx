import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { Version as SURVEYJS_VERSION } from 'survey-core'
import {
  FUNCTIONS,
  SINGLE_INSTANCE,
  createTaskType,
  getTaskType,
  listTaskTypes,
  updateTaskType,
} from '../api/taskTypes.js'

const FormDesigner = lazy(() => import('./FormDesigner.jsx'))

const MAX_PDF_BYTES = 2 * 1024 * 1024

const EMPTY = {
  name: '',
  function: 'FORM',
  status: 'ACTIVE',
  daysPriorToDueDate: 0,
  daysToExpiry: 0,
  attachment: null,
}

function countQuestions(schema) {
  const walk = (elements = []) =>
    elements.reduce((n, el) => {
      if (el.type === 'panel') return n + walk(el.elements)
      if (el.type === 'paneldynamic') return n + 1 + walk(el.templateElements)
      return n + (el.type === 'html' ? 0 : 1)
    }, 0)
  return (schema?.pages ?? []).reduce((n, p) => n + walk(p.elements), 0)
}

function buildPayload(values, schema, existing) {
  const payload = {
    name: values.name.trim(),
    function: values.function,
    status: values.status,
    daysPriorToDueDate: Number(values.daysPriorToDueDate),
    daysToExpiry: Number(values.daysToExpiry),
  }
  if (values.function === 'PDF') payload.attachment = values.attachment
  if (values.function === 'FORM') {
    const prev = existing?.form
    const changed = !prev || JSON.stringify(prev.schema) !== JSON.stringify(schema)
    payload.form = {
      version: prev ? prev.version + (changed ? 1 : 0) : 1,
      surveyjsVersion: SURVEYJS_VERSION,
      schema,
    }
  }
  if (existing) {
    // Name and function are locked after creation.
    delete payload.name
    delete payload.function
  }
  return payload
}

function validate(values, schema, existing) {
  const errors = []
  if (!values.name.trim()) errors.push('Name is required')
  for (const key of ['daysPriorToDueDate', 'daysToExpiry']) {
    const n = Number(values[key])
    if (values[key] === '' || !Number.isInteger(n) || n < 0) errors.push(`${key} must be a whole number >= 0`)
  }
  if (values.function === 'PDF' && !existing && !values.attachment) errors.push('A PDF attachment is required')
  if (values.function === 'FORM' && countQuestions(schema) === 0) errors.push('The form needs at least one question')
  return errors
}

const inputCls =
  'mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm disabled:bg-slate-100 disabled:text-slate-500'

function Field({ label, children }) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {label}
      {children}
    </label>
  )
}

export default function TaskTypeEditor() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') ?? undefined
  const isNew = !id
  const navigate = useNavigate()

  const [existing, setExisting] = useState(null)
  const [others, setOthers] = useState([])
  const [values, setValues] = useState(EMPTY)
  const [schema, setSchema] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState([])
  const [showPayload, setShowPayload] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = isNew ? listTaskTypes().then((all) => ({ all })) : getTaskType(id).then((record) => ({ record }))
    load
      .then(({ all, record }) => {
        if (cancelled) return
        if (all) setOthers(all)
        if (record) {
          setExisting(record)
          setValues({ ...EMPTY, ...record })
          setSchema(record.form?.schema ?? null)
        }
      })
      .catch((e) => !cancelled && setErrors([e.message]))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id, isNew])

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  const changeFunction = (e) => {
    const fn = e.target.value
    setValues((v) => ({
      ...v,
      function: fn,
      name: SINGLE_INSTANCE.includes(fn) ? FUNCTIONS[fn] : SINGLE_INSTANCE.includes(v.function) ? '' : v.name,
    }))
  }

  const pickPdf = (e) => {
    const file = e.target.files?.[0]
    if (!file) return setValues((v) => ({ ...v, attachment: null }))
    if (file.type !== 'application/pdf') return setErrors(['Attachment must be a PDF'])
    if (file.size > MAX_PDF_BYTES) return setErrors(['Attachment must be 2 MB or less'])
    setErrors([])
    setValues((v) => ({ ...v, attachment: { fileName: file.name, size: file.size } }))
  }

  const payload = useMemo(() => buildPayload(values, schema, existing), [values, schema, existing])

  const save = async () => {
    const problems = validate(values, schema, existing)
    setErrors(problems)
    if (problems.length) return
    setSaving(true)
    try {
      console.info(isNew ? 'POST /task-types' : `PUT /task-types/${id}`, payload)
      if (isNew) await createTaskType(payload)
      else await updateTaskType(id, payload)
      navigate('/')
    } catch (e) {
      setErrors([e.message])
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="p-6 text-slate-400">Loading...</p>

  const locked = !isNew
  const nameFixed = locked || SINGLE_INSTANCE.includes(values.function)
  const isForm = values.function === 'FORM'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link to="/" className="text-sm text-slate-500 hover:underline">
              ← Task Types
            </Link>
            <h2 className="text-xl font-semibold">{isNew ? 'New Task Type' : existing?.name}</h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPayload((s) => !s)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
            >
              {showPayload ? 'Hide payload' : 'Show payload'}
            </button>
            <Link to="/" className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100">
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

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
          <Field label="Name">
            <input className={inputCls} value={values.name} onChange={set('name')} disabled={nameFixed} />
          </Field>
          <Field label="Function">
            <select className={inputCls} value={values.function} onChange={changeFunction} disabled={locked}>
              {Object.entries(FUNCTIONS).map(([code, label]) => (
                <option
                  key={code}
                  value={code}
                  disabled={isNew && SINGLE_INSTANCE.includes(code) && others.some((t) => t.function === code)}
                >
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className={inputCls} value={values.status} onChange={set('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </Field>
          <Field label="Days Prior to Due Date">
            <input type="number" min="0" className={inputCls} value={values.daysPriorToDueDate} onChange={set('daysPriorToDueDate')} />
          </Field>
          <Field label="Days to Expiry">
            <input type="number" min="0" className={inputCls} value={values.daysToExpiry} onChange={set('daysToExpiry')} />
          </Field>
          {values.function === 'PDF' && (
            <Field label={`Attachment (PDF, max 2 MB)${values.attachment ? ` - current: ${values.attachment.fileName}` : ''}`}>
              <input type="file" accept="application/pdf" className={inputCls} onChange={pickPdf} />
            </Field>
          )}
        </div>

        {errors.length > 0 && (
          <ul className="mt-4 list-disc rounded-md bg-red-50 py-2 pl-8 text-sm text-red-700">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        {isForm && (
          <div className="min-h-[600px] min-w-0 flex-1">
            <Suspense fallback={<p className="p-6 text-slate-400">Loading form designer...</p>}>
              <FormDesigner initialSchema={schema ?? undefined} initialTab={initialTab} onChange={setSchema} />
            </Suspense>
          </div>
        )}
        {!isForm && !showPayload && (
          <p className="p-6 text-sm text-slate-400">No form designer for this function.</p>
        )}
        {showPayload && (
          <aside className={`${isForm ? 'w-[28rem] border-l' : 'flex-1'} overflow-auto border-slate-200 bg-slate-900 p-4`}>
            <p className="mb-2 text-xs font-medium uppercase text-slate-400">
              {isNew ? 'POST /task-types' : `PUT /task-types/${id}`}
            </p>
            <pre className="text-xs text-slate-100">{JSON.stringify(payload, null, 2)}</pre>
          </aside>
        )}
      </div>
    </div>
  )
}
