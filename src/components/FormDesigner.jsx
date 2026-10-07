import { useEffect, useState } from 'react'
import { UIPreset } from 'survey-creator-core'
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react'
import { PlainLight } from 'survey-core/themes'
import 'survey-core/survey-core.css'
import 'survey-creator-core/survey-creator-core.css'
import preset from '../config/preset.json'

// Tabs, toolbox, property grid and options all come from the UI preset.
const uiPreset = new UIPreset(preset)

export default function FormDesigner({ initialSchema, onChange }) {
  const [creator] = useState(() => {
    const c = new SurveyCreator({ collapseOnDrag: true, showCreatorThemeSettings: false })
    uiPreset.applyTo(c)
    // Fixed Creator UI theme; the "Creator Settings" (gear) button is hidden above.
    c.applyCreatorTheme(PlainLight)
    if (initialSchema) c.JSON = initialSchema
    return c
  })

  useEffect(() => {
    const handler = () => onChange(creator.JSON)
    creator.onModified.add(handler)
    onChange(creator.JSON)
    return () => creator.onModified.remove(handler)
  }, [creator, onChange])

  return (
    <div className="h-full w-full">
      <SurveyCreatorComponent creator={creator} />
    </div>
  )
}
