import { useState } from 'react'
import ProductPickerModal from '../products/ProductPickerModal.jsx'
import { expandProducts, makeRefs } from '../products/productApi.js'

// Shows the chosen set of products and opens the picker modal to choose or change it.
// `value` is an array of items ({ level, id, name, path }).
export default function ProductPicker({ value = [], onChange }) {
  const [open, setOpen] = useState(false)
  const count = expandProducts(value).length

  return (
    <div>
      <div className="flex items-center justify-between gap-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
        {value.length ? (
          <span>
            <span className="font-medium">{value.map((i) => i.name).join(', ')}</span>
            <span className="ml-2 text-slate-500">
              {count} product{count === 1 ? '' : 's'}
            </span>
          </span>
        ) : (
          <span className="text-slate-400">Nothing selected</span>
        )}
        <button type="button" onClick={() => setOpen(true)} className="shrink-0 text-blue-600 hover:underline">
          {value.length ? 'Change' : 'Select...'}
        </button>
      </div>
      {open && (
        <ProductPickerModal
          initialRefs={makeRefs(value)}
          onClose={() => setOpen(false)}
          onSelect={(items) => {
            onChange(items)
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}
