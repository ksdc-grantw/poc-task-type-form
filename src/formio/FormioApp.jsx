import EngineRoutes from '../shared/EngineRoutes.jsx'
import engine from './engine.js'

export default function FormioApp() {
  return <EngineRoutes engine={engine} />
}
