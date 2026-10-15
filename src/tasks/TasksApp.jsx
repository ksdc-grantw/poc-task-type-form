import { Route, Routes } from 'react-router'
import TaskCreate from './TaskCreate.jsx'
import TaskList from './TaskList.jsx'
import TaskPreview from './TaskPreview.jsx'

export default function TasksApp() {
  return (
    <Routes>
      <Route index element={<TaskList />} />
      <Route path="new" element={<TaskCreate />} />
      <Route path=":id" element={<TaskPreview />} />
    </Routes>
  )
}
