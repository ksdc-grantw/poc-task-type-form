import { useEffect, useMemo, useRef, useState } from 'react'
import { Model } from 'survey-core'
import { VisualizationPanel } from 'survey-analytics'
import 'survey-core/survey-core.css'
import 'survey-analytics/survey.analytics.css'
import '../surveyjs/customQuestions.js'
import { agentTemplateApi } from './api.js'
import { workEventApi } from './workEventApi.js'

const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString()
const fmt = (iso) => new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

const DATE_RANGES = [
  { id: 'all', label: 'All time', days: null },
  { id: 'today', label: 'Today', days: 0 },
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '14d', label: 'Last 14 days', days: 14 },
]

function Filter({ label, value, onChange, children }) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
      >
        {children}
      </select>
    </label>
  )
}

function Charts({ template, events }) {
  const ref = useRef(null)

  useEffect(() => {
    const survey = new Model(template.form.schema)
    const panel = new VisualizationPanel(
      survey.getAllQuestions(),
      events.map((e) => e.data),
      { allowHideQuestions: false },
    )
    panel.render(ref.current)
    return () => panel.clear()
  }, [template, events])

  return <div ref={ref} />
}

function EventsTable({ events }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-2 font-medium">Completed</th>
            <th className="px-4 py-2 font-medium">Agent</th>
            <th className="px-4 py-2 font-medium">Location</th>
            <th className="px-4 py-2 font-medium">Lat / Long</th>
            <th className="px-4 py-2 font-medium">Photos</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {events.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50">
              <td className="px-4 py-2 whitespace-nowrap">{fmt(e.capturedAt)}</td>
              <td className="px-4 py-2">{e.userName}</td>
              <td className="px-4 py-2">{e.siteName}</td>
              <td className="px-4 py-2 text-slate-500 tabular-nums">
                {e.lat.toFixed(5)}, {e.long.toFixed(5)}
              </td>
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  {(e.data.photos ?? []).map((p) => (
                    <img key={p.name} src={p.content} alt={p.name} className="h-8 w-10 rounded border border-slate-200 object-cover" />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Dashboard() {
  const [templates, setTemplates] = useState(null)
  const [events, setEvents] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [siteName, setSiteName] = useState('')
  const [userId, setUserId] = useState('')
  const [range, setRange] = useState('all')
  const [now] = useState(Date.now)

  useEffect(() => {
    Promise.all([agentTemplateApi.list(), workEventApi.list()]).then(([t, e]) => {
      setTemplates(t)
      setEvents(e)
      setSelectedId(t[0]?.id ?? null)
    })
  }, [])

  const selected = templates?.find((t) => t.id === selectedId)
  const templateEvents = useMemo(() => events?.filter((e) => e.templateId === selectedId) ?? [], [events, selectedId])

  const sites = useMemo(() => [...new Set(events?.map((e) => e.siteName))].sort(), [events])
  const agents = useMemo(
    () => [...new Map(events?.map((e) => [e.userId, e.userName])).entries()].sort((a, b) => a[1].localeCompare(b[1])),
    [events],
  )

  const filtered = useMemo(() => {
    const days = DATE_RANGES.find((r) => r.id === range).days
    const since = days === null ? null : now - days * 24 * 60 * 60 * 1000
    return templateEvents.filter(
      (e) =>
        (!siteName || e.siteName === siteName) &&
        (!userId || e.userId === userId) &&
        (days === null || (days === 0 ? isToday(e.capturedAt) : new Date(e.capturedAt).getTime() >= since)),
    )
  }, [templateEvents, siteName, userId, range, now])

  if (!templates || !events) return <p className="p-6 text-slate-400">Loading...</p>

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <h2 className="text-xl font-semibold">Work Events Dashboard</h2>
      <p className="mb-6 text-sm text-slate-500">Mock Work Events completed by Agents from the Agent Templates.</p>

      <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
        <Filter label="Template" value={selectedId} onChange={setSelectedId}>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Filter>
        <Filter label="Site" value={siteName} onChange={setSiteName}>
          <option value="">All sites</option>
          {sites.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Filter>
        <Filter label="Agent" value={userId} onChange={setUserId}>
          <option value="">All agents</option>
          {agents.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Filter>
        <Filter label="Date" value={range} onChange={setRange}>
          {DATE_RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </Filter>
      </div>

      {selected && (
        <>
          <h3 className="mb-3 text-lg font-semibold">
            {selected.name} <span className="text-sm font-normal text-slate-500">{filtered.length} of {templateEvents.length} Work Events</span>
          </h3>
          {filtered.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-400">No Work Events match these filters.</p>
          ) : (
            <>
              <Charts template={selected} events={filtered} />
              <h4 className="mt-8 mb-3 text-base font-semibold">Work Events</h4>
              <EventsTable events={filtered} />
            </>
          )}
        </>
      )}
    </main>
  )
}
