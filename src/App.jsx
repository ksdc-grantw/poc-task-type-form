import { lazy, Suspense } from 'react'
import { Link, NavLink, Navigate, Route, Routes } from 'react-router'

// One entry per form engine. Each is a self-contained app mounted under its own path.
const ENGINES = [
  { id: 'surveyjs', label: 'SurveyJS', path: '/surveyjs', App: lazy(() => import('./surveyjs/SurveyJsApp.jsx')) },
  // Not chosen: kept in place but its tab is disabled.
  { id: 'formio', label: 'Form.io', path: '/formio', disabled: true, App: lazy(() => import('./formio/FormioApp.jsx')) },
]

const AgentTemplatesApp = lazy(() => import('./agentTemplates/AgentTemplatesApp.jsx'))
const TasksApp = lazy(() => import('./tasks/TasksApp.jsx'))

const tabCls = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold">
            poc-form-task-type
          </Link>
          <nav className="flex gap-1">
            {ENGINES.map((e) =>
              e.disabled ? (
                <span
                  key={e.id}
                  aria-disabled="true"
                  title="Not selected"
                  className="cursor-not-allowed rounded-md px-3 py-1.5 text-sm font-medium text-slate-300"
                >
                  {e.label}
                </span>
              ) : (
                <NavLink key={e.id} to={e.path} className={tabCls}>
                  {e.label}
                </NavLink>
              ),
            )}
            <NavLink to="/tasks" className={tabCls}>
              Tasks
            </NavLink>
            <NavLink to="/agent-templates" end className={tabCls}>
              Agent Templates
            </NavLink>
            <NavLink to="/agent-templates/dashboard" className={tabCls}>
              Dashboard
            </NavLink>
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
        <Routes>
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
