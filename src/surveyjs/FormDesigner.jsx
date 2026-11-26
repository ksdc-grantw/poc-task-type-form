import { useEffect, useState } from 'react'
import { SurveyCreatorComponent } from 'survey-creator-react'
import 'survey-core/survey-core.css'
import 'survey-creator-core/survey-creator-core.css'
import { createDesigner } from './designer/createDesigner.js'
import { withoutDesignerOnlyOptions } from './designer/designerOnlyOptions.js'
import { useToolboxToggle } from './designer/toolboxToggle.js'
import ProductPickerModal from '../products/ProductPickerModal.jsx'

// The form designer. How it is set up is in designer/createDesigner.js; this component only
// hosts it: creates it once, reports every change through onChange, and shows the product
// picker when one of its buttons asks for it.
export default function FormDesigner({ initialSchema, initialTab, onChange, readOnly = false }) {
  // The open product picker: { initial: products ticked when it opens, apply(products) }.
  const [picker, setPicker] = useState(null)
  const [creator] = useState(() =>
    createDesigner({
      schema: initialSchema,
      initialTab,
      readOnly,
      pickProducts: (initial, apply) => setPicker({ initial, apply }),
    }),
  )
  const containerRef = useToolboxToggle(creator)

  // onModified fires after every edit; the form JSON is reported then (and once at the start).
  useEffect(() => {
    const report = () => onChange(withoutDesignerOnlyOptions(creator.JSON))
    creator.onModified.add(report)
    report()
    return () => creator.onModified.remove(report)
  }, [creator, onChange])

  return (
    <div ref={containerRef} className="h-full w-full">
      <SurveyCreatorComponent creator={creator} />
      {picker && (
        <ProductPickerModal
          initial={picker.initial}
          onClose={() => setPicker(null)}
          onSelect={(products) => {
            picker.apply(products)
            setPicker(null)
          }}
        />
      )}
    </div>
  )
}
