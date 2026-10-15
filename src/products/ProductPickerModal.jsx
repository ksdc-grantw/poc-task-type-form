import { useMemo, useState } from 'react'
import { listByLevel, resolveRef } from './productApi.js'

const LEVEL_LABEL = { product: 'product', line: 'product line', category: 'category' }
const LEVELS = ['category', 'line', 'product']

// Where the browser starts: the selected item's parent line and category.
function initialPath(item) {
  const line = item?.level === 'product' ? listByLevel('line').find((l) => l.id === item.parentId) : item?.level === 'line' ? item : null
  const category = item?.level === 'category' ? item : line ? listByLevel('category').find((c) => c.id === line.parentId) : null
  return { categoryId: category?.id ?? null, lineId: item?.level === 'product' ? item.parentId : item?.level === 'line' ? item.id : null }
}

function Column({ title, rows, selectedId, onSelect, empty }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col border-r border-slate-200 last:border-r-0">
      <p className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium uppercase text-slate-500">
        {title}
      </p>
      <ul className="min-h-0 flex-1 overflow-y-auto text-sm">
        {rows.length === 0 && <li className="px-3 py-2 text-slate-400">{empty}</li>}
        {rows.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onSelect(r)}
              className={`block w-full px-3 py-1.5 text-left hover:bg-slate-100 ${
                r.id === selectedId ? 'bg-blue-50 font-medium text-blue-800' : ''
              }`}
            >
              {r.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Browse category > line > product (or search), then confirm one item. With a `level`, only
// that level can be chosen; without one, any level can (used by the form designer).
export default function ProductPickerModal({ level, initialRef, onSelect, onClose }) {
  const depth = level ? LEVELS.indexOf(level) : 2
  const noun = level ? LEVEL_LABEL[level] : 'product, line or category'
  const canPick = (l) => !level || level === l
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => resolveRef(initialRef) ?? null)
  const [categoryId, setCategoryId] = useState(() => initialPath(selected).categoryId)
  const [lineId, setLineId] = useState(() => initialPath(selected).lineId)

  const categories = listByLevel('category')
  const lines = useMemo(() => listByLevel('line').filter((l) => l.parentId === categoryId), [categoryId])
  const products = useMemo(() => listByLevel('product').filter((p) => p.parentId === lineId), [lineId])
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    const pool = level ? listByLevel(level) : LEVELS.flatMap(listByLevel)
    return pool.filter((i) => i.path.toLowerCase().includes(q))
  }, [level, query])

  const pickCategory = (c) => {
    setCategoryId(c.id)
    setLineId(null)
    if (canPick('category')) setSelected(c)
  }
  const pickLine = (l) => {
    setLineId(l.id)
    if (canPick('line')) setSelected(l)
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 p-4">
      <div role="dialog" aria-modal="true" className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold">Select a {noun}</h3>
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${noun}...`}
            className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex h-72 min-h-0 border-b border-slate-200">
          {results ? (
            <ul className="flex-1 overflow-y-auto text-sm">
              {results.length === 0 && <li className="px-4 py-3 text-slate-400">No matches</li>}
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(r)}
                    className={`block w-full px-4 py-1.5 text-left hover:bg-slate-100 ${
                      r.id === selected?.id ? 'bg-blue-50 font-medium text-blue-800' : ''
                    }`}
                  >
                    {r.path}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <Column title="Category" rows={categories} selectedId={selected?.level === 'category' ? selected.id : categoryId} onSelect={pickCategory} />
              {depth >= 1 && (
                <Column
                  title="Product line"
                  rows={lines}
                  selectedId={selected?.level === 'line' ? selected.id : lineId}
                  onSelect={pickLine}
                  empty="Choose a category"
                />
              )}
              {depth >= 2 && (
                <Column title="Product" rows={products} selectedId={selected?.id} onSelect={setSelected} empty="Choose a product line" />
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <p className="truncate text-sm text-slate-500">{selected ? selected.path : 'Nothing selected'}</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="button"
              disabled={!selected}
              onClick={() => onSelect(selected)}
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
