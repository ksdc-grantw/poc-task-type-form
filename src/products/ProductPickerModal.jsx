import { useMemo, useState } from 'react'
import { expandProducts, listByLevel, makeRef, parseRefs } from './productApi.js'

const LEVELS = ['category', 'line', 'product']

// One row: a checkbox toggles the item into the selection; the name drills into its children.
function Row({ item, checked, active, onToggle, onOpen, showPath }) {
  return (
    <li className={`flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 ${active ? 'bg-blue-50' : ''}`}>
      <input type="checkbox" checked={checked} onChange={() => onToggle(item)} aria-label={`Select ${item.name}`} />
      <button
        type="button"
        onClick={() => (onOpen ? onOpen(item) : onToggle(item))}
        className={`min-w-0 flex-1 truncate text-left ${active ? 'font-medium text-blue-800' : ''}`}
      >
        {showPath ? item.path : item.name}
      </button>
    </li>
  )
}

function Column({ title, rows, selected, activeId, onToggle, onOpen, empty }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col border-r border-slate-200 last:border-r-0">
      <p className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium uppercase text-slate-500">
        {title}
      </p>
      <ul className="min-h-0 flex-1 overflow-y-auto text-sm">
        {rows.length === 0 && <li className="px-3 py-2 text-slate-400">{empty}</li>}
        {rows.map((r) => (
          <Row key={r.id} item={r} checked={selected.has(makeRef(r))} active={r.id === activeId} onToggle={onToggle} onOpen={onOpen} />
        ))}
      </ul>
    </div>
  )
}

// Browse category > line > product (or search) and tick any number of items. A ticked
// category or line stands for every product beneath it.
export default function ProductPickerModal({ initialRefs, onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Map(parseRefs(initialRefs).map((i) => [makeRef(i), i])))
  const [categoryId, setCategoryId] = useState(null)
  const [lineId, setLineId] = useState(null)

  const categories = listByLevel('category')
  const lines = useMemo(() => listByLevel('line').filter((l) => l.parentId === categoryId), [categoryId])
  const products = useMemo(() => listByLevel('product').filter((p) => p.parentId === lineId), [lineId])
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? LEVELS.flatMap(listByLevel).filter((i) => i.path.toLowerCase().includes(q)) : null
  }, [query])

  const toggle = (item) =>
    setSelected((prev) => {
      const next = new Map(prev)
      const key = makeRef(item)
      if (next.has(key)) next.delete(key)
      else next.set(key, item)
      return next
    })
  const productCount = expandProducts([...selected.values()]).length
  const keys = new Set(selected.keys())

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 p-4">
      <div role="dialog" aria-modal="true" className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold">Select products</h3>
          <p className="text-sm text-slate-500">Tick products, product lines or categories. Ticking a line or category includes every product under it.</p>
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, lines or categories..."
            className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex h-72 min-h-0 border-b border-slate-200">
          {results ? (
            <ul className="flex-1 overflow-y-auto text-sm">
              {results.length === 0 && <li className="px-4 py-3 text-slate-400">No matches</li>}
              {results.map((r) => (
                <Row key={makeRef(r)} item={r} checked={keys.has(makeRef(r))} onToggle={toggle} showPath />
              ))}
            </ul>
          ) : (
            <>
              <Column
                title="Category"
                rows={categories}
                selected={keys}
                activeId={categoryId}
                onToggle={toggle}
                onOpen={(c) => {
                  setCategoryId(c.id)
                  setLineId(null)
                }}
              />
              <Column
                title="Product line"
                rows={lines}
                selected={keys}
                activeId={lineId}
                onToggle={toggle}
                onOpen={(l) => setLineId(l.id)}
                empty="Open a category"
              />
              <Column title="Product" rows={products} selected={keys} onToggle={toggle} empty="Open a product line" />
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-sm text-slate-500">
            {selected.size === 0 ? 'Nothing selected' : `${selected.size} item${selected.size === 1 ? '' : 's'} = ${productCount} product${productCount === 1 ? '' : 's'}`}
            {selected.size > 0 && (
              <button type="button" onClick={() => setSelected(new Map())} className="ml-3 text-blue-600 hover:underline">
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
              disabled={selected.size === 0}
              onClick={() => onSelect([...selected.values()])}
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
