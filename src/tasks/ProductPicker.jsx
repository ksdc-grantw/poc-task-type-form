import { useState } from 'react'
import ProductPickerModal from '../products/ProductPickerModal.jsx'
import { makeRef } from '../products/productApi.js'

// Shows the chosen product and opens the picker modal to choose or change it.
export default function ProductPicker({ level, value, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between gap-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
        {value ? (
          <span>
            <span className="font-medium">{value.name}</span>
            <span className="ml-2 text-slate-500">{value.path}</span>
          </span>
        ) : (
          <span className="text-slate-400">Nothing selected</span>
        )}
        <button type="button" onClick={() => setOpen(true)} className="shrink-0 text-blue-600 hover:underline">
          {value ? 'Change' : 'Select...'}
        </button>
      </div>
      {open && (
        <ProductPickerModal
          level={level}
          initialRef={value ? makeRef(value) : undefined}
          onClose={() => setOpen(false)}
          onSelect={(p) => {
            onChange(p)
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}
