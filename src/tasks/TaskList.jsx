import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { taskApi } from './taskApi.js'

export default function TaskList() {
  const [tasks, setTasks] = useState(null)

  useEffect(() => {
    taskApi.list().then(setTasks)
  }, [])

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <Link
          to="/tasks/new"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          New Task
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-2 font-medium">Task type</th>
              <th className="px-4 py-2 font-medium">Products</th>
              <th className="px-4 py-2 font-medium">Created</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!tasks && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {tasks?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No tasks yet.
                </td>
              </tr>
            )}
            {tasks?.map((t) => {
              const bound = Object.values(t.productBindings ?? {})
              return (
                <tr key={t.id}>
                  <td className="px-4 py-2 font-medium">{t.taskTypeName}</td>
                  <td className="px-4 py-2">
                    {bound.length === 0 ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <ul className="space-y-0.5">
                        {bound.map((b, i) => (
                          <li key={i}>
                            {b.products.map((x) => x.description).join(', ')}{' '}
                            <span className="text-slate-400">
                              ({b.products.length} product{b.products.length === 1 ? '' : 's'}, {b.mode})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">
                    <Link to={`/tasks/${t.id}`} className="text-blue-600 hover:underline">
                      Open Preview
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
