import { useEffect, useRef } from 'react'
import { Formio } from '@formio/js'
import './formio.css'
import { builderOptions } from './builderConfig.js'

const EMPTY_FORM = { display: 'form', components: [] }

// Wraps the Form.io builder. `initialSchema` is only read on mount; edits are reported through
// `onChange` with a copy of the builder's form JSON.
export default function FormDesigner({ initialSchema, onChange }) {
  const host = useRef(null)
  const latest = useRef({ initialSchema, onChange })

  useEffect(() => {
    let builder = null
    let cancelled = false
    const { initialSchema: schema } = latest.current

    Formio.builder(host.current, structuredClone(schema ?? EMPTY_FORM), builderOptions).then((instance) => {
      if (cancelled) return instance.destroy(true)
      builder = instance
      builder.on('change', () => latest.current.onChange(structuredClone(builder.schema)))
    })

    return () => {
      cancelled = true
      builder?.destroy(true)
    }
  }, [])

  return <div ref={host} className="formio-scope h-full overflow-auto bg-white p-3" />
}
