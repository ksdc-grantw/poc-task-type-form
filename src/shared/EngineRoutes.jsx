import { Route, Routes } from 'react-router'
import { EngineProvider } from './EngineContext.js'
import TaskTypeEditor from './TaskTypeEditor.jsx'
import TaskTypeList from './TaskTypeList.jsx'

// Routes for one engine, relative to the engine's base path.
export default function EngineRoutes({ engine }) {
  const { FormPreview } = engine
  return (
    <EngineProvider value={engine}>
      <Routes>
        <Route
          index
          element={
            <main className="mx-auto w-full max-w-5xl px-6 py-8">
              <TaskTypeList />
            </main>
          }
        />
        <Route path="task-types/new" element={<TaskTypeEditor />} />
        <Route path="task-types/:id" element={<TaskTypeEditor />} />
        <Route path="task-types/:id/preview" element={<FormPreview />} />
      </Routes>
    </EngineProvider>
  )
}
