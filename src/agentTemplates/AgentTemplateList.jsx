import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { agentTemplateApi } from './api.js'
import { BASE_PATH } from './constants.js'

const countQuestions = (schema) => (schema?.pages ?? []).reduce((n, p) => n + p.elements.length, 0)

export default function AgentTemplateList() {
  const [templates, setTemplates] = useState(null)

  useEffect(() => {
    agentTemplateApi.list().then(setTemplates)
  }, [])

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Agent Templates</h2>
          <p className="text-sm text-slate-500">Forms an Agent can start on their own, without an assigned Task.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Description</th>
              <th className="px-4 py-2 text-right font-medium">Questions</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {templates === null && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {templates?.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 font-medium">{t.name}</td>
                <td className="px-4 py-2 text-slate-600">{t.description}</td>
                <td className="px-4 py-2 text-right tabular-nums">{countQuestions(t.form.schema)}</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <Link to={`${BASE_PATH}/${t.id}/preview`} className="mr-4 text-blue-600 hover:underline">
                    Open Preview
                  </Link>
                  <Link to={`${BASE_PATH}/${t.id}`} className="text-blue-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
