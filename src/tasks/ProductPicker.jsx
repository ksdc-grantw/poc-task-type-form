import { useEffect, useState } from 'react'
import { productApi } from '../products/productApi.js'

const LEVEL_LABEL = { product: 'product', line: 'product line', category: 'category' }

// Searchable picker over the remote product source, limited to one hierarchy level.
export default function ProductPicker({ level, value, onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)

  useEffect(() => {
    let cancelled = false
    productApi.search({ level, query }).then((r) => !cancelled && setResults(r))
    return () => {
      cancelled = true
    }
  }, [level, query])

  return (
    <div>
      {value ? (
        <div className="flex items-center justify-between rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm">
          <span>
            <span className="font-medium">{value.name}</span>
            <span className="ml-2 text-slate-500">{value.path}</span>
          </span>
          <button type="button" onClick={() => onChange(null)} className="text-blue-600 hover:underline">
            Change
          </button>
        </div>
      ) : (
        <div className="rounded-md border border-slate-300 bg-white">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${LEVEL_LABEL[level]}...`}
            className="w-full rounded-t-md border-b border-slate-200 px-3 py-2 text-sm outline-none"
          />
          <ul className="max-h-44 overflow-y-auto text-sm">
            {!results && <li className="px-3 py-2 text-slate-400">Loading...</li>}
            {results?.length === 0 && <li className="px-3 py-2 text-slate-400">No matches</li>}
            {results?.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onChange(r)}
                  className="block w-full px-3 py-1.5 text-left hover:bg-slate-100"
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="ml-2 text-slate-500">{r.path}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
