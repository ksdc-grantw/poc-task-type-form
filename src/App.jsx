import { lazy, Suspense } from 'react'
import { Link, NavLink, Navigate, Route, Routes } from 'react-router'

// One entry per form engine. Each is a self-contained app mounted under its own path.
const ENGINES = [
  { id: 'surveyjs', label: 'SurveyJS', path: '/surveyjs', App: lazy(() => import('./surveyjs/SurveyJsApp.jsx')) },
]

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
            {ENGINES.map((e) => (
              <NavLink key={e.id} to={e.path} className={tabCls}>
                {e.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <Suspense fallback={<p className="p-6 text-slate-400">Loading...</p>}>
        <Routes>
          <Route path="/" element={<Navigate to={ENGINES[0].path} replace />} />
          {ENGINES.map(({ id, path, App: EngineApp }) => (
            <Route key={id} path={`${path}/*`} element={<EngineApp />} />
          ))}
        </Routes>
      </Suspense>
    </div>
  )
}
