import { createContext, useContext } from 'react'

// An engine describes one form technology (SurveyJS, Form.io, ...):
//   id, label, basePath      identity and route prefix
//   api                      mock backend from createTaskTypeApi
//   FormDesigner             lazy component: { initialSchema, initialTab, onChange }
//   FormPreview              lazy component: standalone phone-frame preview
//   countQuestions(schema)   number of answerable questions in a form definition
//   buildForm(prev, schema)  the `form` object stored on the task type (version bump, library version, ...)
// The form definition (`form.schema`) is opaque to the shared code, so engines can use any structure.
const EngineContext = createContext(null)

export const EngineProvider = EngineContext.Provider

export function useEngine() {
  const engine = useContext(EngineContext)
  if (!engine) throw new Error('useEngine must be used inside an EngineProvider')
  return engine
}
