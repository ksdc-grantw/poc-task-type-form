import { useState } from 'react'
import ProductPickerModal from '../products/ProductPickerModal.jsx'

// Shows the chosen set of products and opens the picker modal to choose or change it.
// `value` is an array of products. When `locked`, the set is listed but cannot be changed.
export default function ProductPicker({ value = [], onChange, locked = false }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between gap-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
        {value.length ? (
          <span>
            <span className="font-medium">{value.map((p) => p.description).join(', ')}</span>
            <span className="ml-2 text-slate-500">
              {value.length} product{value.length === 1 ? '' : 's'}
              {locked && ' · set by the task type'}
            </span>
          </span>
        ) : (
          <span className="text-slate-400">Nothing selected</span>
        )}
        {!locked && (
          <button type="button" onClick={() => setOpen(true)} className="shrink-0 text-blue-600 hover:underline">
            {value.length ? 'Change' : 'Select...'}
          </button>
        )}
      </div>
      {open && (
        <ProductPickerModal
          initial={value}
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
