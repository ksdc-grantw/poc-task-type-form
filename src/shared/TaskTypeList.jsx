import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { FUNCTIONS } from './constants.js'
import { useEngine } from './EngineContext.js'

function StatusBadge({ status }) {
  const active = status === 'ACTIVE'
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        active ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function Content({ taskType }) {
  if (taskType.attachment) return <span>{taskType.attachment.fileName}</span>
  if (taskType.form) return <span>Form v{taskType.form.version}</span>
  return <span className="text-slate-400">—</span>
}

export default function TaskTypeList() {
  const { api, basePath } = useEngine()
  const [taskTypes, setTaskTypes] = useState(null)

  useEffect(() => {
    api.listTaskTypes().then(setTaskTypes)
  }, [api])

  const reset = () => {
    setTaskTypes(null)
    api.resetTaskTypes().then(setTaskTypes)
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Task Types</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            Reset mock data
          </button>
          <Link
            to={`${basePath}/task-types/new`}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            New Task Type
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Function</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 text-right font-medium">Days Prior</th>
              <th className="px-4 py-2 text-right font-medium">Days to Expiry</th>
              <th className="px-4 py-2 font-medium">Attachment / Form</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {taskTypes === null && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {taskTypes?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  No task types
                </td>
              </tr>
            )}
            {taskTypes?.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 font-medium">{t.name}</td>
                <td className="px-4 py-2">{FUNCTIONS[t.function] ?? t.function}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-2 text-right tabular-nums">{t.daysPriorToDueDate}</td>
                <td className="px-4 py-2 text-right tabular-nums">{t.daysToExpiry}</td>
                <td className="px-4 py-2">
                  <Content taskType={t} />
                </td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  {t.form && (
                    <Link to={`${basePath}/task-types/${t.id}/preview`} className="mr-4 text-blue-600 hover:underline">
                      Open Preview
                    </Link>
                  )}
                  <Link to={`${basePath}/task-types/${t.id}`} className="text-blue-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
