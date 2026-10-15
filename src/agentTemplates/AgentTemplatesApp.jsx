import { Route, Routes } from 'react-router'
import AgentTemplateEditor from './AgentTemplateEditor.jsx'
import AgentTemplateList from './AgentTemplateList.jsx'
import AgentTemplatePreview from './AgentTemplatePreview.jsx'
import Dashboard from './Dashboard.jsx'

export default function AgentTemplatesApp() {
  return (
    <Routes>
      <Route index element={<AgentTemplateList />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path=":id" element={<AgentTemplateEditor />} />
      <Route path=":id/preview" element={<AgentTemplatePreview />} />
    </Routes>
  )
}
