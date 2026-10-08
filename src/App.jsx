import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router'
import TaskTypeList from './components/TaskTypeList.jsx'

const TaskTypeEditor = lazy(() => import('./components/TaskTypeEditor.jsx'))
const FormPreview = lazy(() => import('./components/FormPreview.jsx'))

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="px-6 py-4">
          <Link to="/" className="text-lg font-semibold">
            poc-form-task-type
          </Link>
        </div>
      </header>
      <Suspense fallback={<p className="p-6 text-slate-400">Loading...</p>}>
        <Routes>
          <Route
            path="/"
            element={
              <main className="mx-auto w-full max-w-5xl px-6 py-8">
                <TaskTypeList />
              </main>
            }
          />
          <Route path="/task-types/new" element={<TaskTypeEditor />} />
          <Route path="/task-types/:id" element={<TaskTypeEditor />} />
          <Route path="/task-types/:id/preview" element={<FormPreview />} />
        </Routes>
      </Suspense>
    </div>
  )
}