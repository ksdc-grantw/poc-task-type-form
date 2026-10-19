import { lazy, Suspense, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes } from 'react-router'
import { clearMockData, populateMockData, removeStaleData } from './shared/mockData.js'

removeStaleData()

// One entry per form engine. Each is a self-contained app mounted under its own path.
const ENGINES = [
  { id: 'surveyjs', label: 'Task Types', path: '/surveyjs', App: lazy(() => import('./surveyjs/SurveyJsApp.jsx')) },
  // Not chosen: kept in place but hidden from the nav.
  { id: 'formio', label: 'Form.io', path: '/formio', disabled: true, App: lazy(() => import('./formio/FormioApp.jsx')) },
]

const AgentTemplatesApp = lazy(() => import('./agentTemplates/AgentTemplatesApp.jsx'))
const TasksApp = lazy(() => import('./tasks/TasksApp.jsx'))

const tabCls = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

export default function App() {
  const [dataVersion, setDataVersion] = useState(0)

  const populate = () => {
    if (!window.confirm('Replace all task types and tasks with mock data?')) return
    populateMockData()
    setDataVersion((v) => v + 1)
  }
  const clear = () => {
    if (!window.confirm('Clear all task types and tasks?')) return
    clearMockData()
    setDataVersion((v) => v + 1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold">
            poc-form-task-type
          </Link>
          <nav className="flex gap-1">
            {ENGINES.filter((e) => !e.disabled).map((e) => (
              <NavLink key={e.id} to={e.path} className={tabCls}>
                {e.label}
              </NavLink>
            ))}
            <NavLink to="/tasks" className={tabCls}>
              Tasks
            </NavLink>
            <NavLink to="/agent-templates" end className={tabCls}>
              Agent Templates
            </NavLink>
            <NavLink to="/agent-templates/dashboard" className={tabCls}>
              Dashboard
            </NavLink>
            <button
              type="button"
              onClick={populate}
              className="ml-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Populate mock data
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Clear data
            </button>
            <a
              href="https://github.com/ksdc-grantw/poc-task-type-form"
              target="_blank"
              rel="noreferrer"
              className="rounded px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              GitHub ↗
            </a>
          </nav>
        </div>
      </header>
      <Suspense fallback={<p className="p-6 text-slate-400">Loading...</p>}>
        <Routes key={dataVersion}>
          <Route path="/" element={<Navigate to={ENGINES[0].path} replace />} />
          {ENGINES.map(({ id, path, App: EngineApp }) => (
            <Route key={id} path={`${path}/*`} element={<EngineApp />} />
          ))}
          <Route path="/tasks/*" element={<TasksApp />} />
          <Route path="/agent-templates/*" element={<AgentTemplatesApp />} />
        </Routes>
      </Suspense>
    </div>
  )
}
