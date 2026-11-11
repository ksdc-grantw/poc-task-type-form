import { useState } from 'react'

function Section({ title, value }) {
  return (
    <section>
      <p className="mb-1 text-xs font-medium uppercase text-slate-400">{title}</p>
      <pre className="max-h-96 overflow-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  )
}

export default function TaskPayloads({ saved, savedTitle, external }) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
      >
        {show ? 'Hide payload' : 'Show payload'}
      </button>
      {show && (
        <div className="space-y-4">
          <Section title={savedTitle} value={saved} />
          <Section title="Sent to external systems" value={external} />
        </div>
      )}
    </div>
  )
}
