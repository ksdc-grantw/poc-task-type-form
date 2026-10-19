import { useMemo, useState } from 'react'
import { listFilters, matchProducts } from './productApi.js'

// Tick filter tags on the left; the products they match are listed on the right and
// pre-selected. The selection follows the filters (narrowing a filter drops products that
// no longer match), and a product the user unticks stays unticked while it keeps matching.
// With no filters ticked, the selection is whatever the question already had.
export default function ProductPickerModal({ initial = [], onSelect, onClose }) {
  const filters = useMemo(() => listFilters(), [])
  const [active, setActive] = useState({})
  const [base, setBase] = useState(() => new Map(initial.map((p) => [p.id, p])))
  const [unticked, setUnticked] = useState(() => new Set())

  const matches = useMemo(() => matchProducts(active), [active])
  const hasFilters = matches.length > 0 || Object.values(active).some((v) => v.size > 0)
  const selectedList = (hasFilters ? matches : [...base.values()]).filter((p) => !unticked.has(p.id))
  const selectedIds = new Set(selectedList.map((p) => p.id))

  const toggleFilter = (field, value) => {
    const values = new Set(active[field])
    if (values.has(value)) values.delete(value)
    else values.add(value)
    setActive({ ...active, [field]: values })
  }

  const toggleProduct = (product) =>
    setUnticked((prev) => {
      const next = new Set(prev)
      if (next.has(product.id)) next.delete(product.id)
      else next.add(product.id)
      return next
    })
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 p-4">
      <div role="dialog" aria-modal="true" className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold">Select products</h3>
          <p className="text-sm text-slate-500">Choose filters to list matching products. Matches are pre-selected; untick any you don&apos;t want.</p>
        </div>

        <div className="flex h-80 min-h-0 border-b border-slate-200">
          <div className="w-64 shrink-0 overflow-y-auto border-r border-slate-200 text-sm">
            {filters.map((group) => (
              <fieldset key={group.field} className="border-b border-slate-100 px-3 py-2">
                <legend className="text-xs font-medium uppercase text-slate-500">{group.label}</legend>
                {group.values.map((value) => (
                  <label key={value} className="flex items-center gap-2 py-0.5">
                    <input type="checkbox" checked={!!active[group.field]?.has(value)} onChange={() => toggleFilter(group.field, value)} />
                    <span className="truncate">{value}</span>
                  </label>
                ))}
              </fieldset>
            ))}
          </div>

          <ul className="min-w-0 flex-1 overflow-y-auto text-sm">
            {matches.length === 0 && (
              <li className="px-4 py-3 text-slate-400">{hasFilters ? 'No products match these filters' : 'Pick a filter to list products'}</li>
            )}
            {matches.map((p) => (
              <li key={p.id}>
                <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100">
                  <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleProduct(p)} />
                  <span className="truncate">{p.description}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-sm text-slate-500">
            {selectedList.length === 0 ? 'Nothing selected' : `${selectedList.length} product${selectedList.length === 1 ? '' : 's'} selected`}
            {selectedList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setBase(new Map())
                  setUnticked(new Set(matches.map((p) => p.id)))
                }}
                className="ml-3 text-blue-600 hover:underline"
              >
                Clear
              </button>
            )}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedList.length === 0}
              onClick={() => onSelect(selectedList)}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
