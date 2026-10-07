import { useEffect, useState } from 'react'
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react'
import 'survey-core/survey-core.css'
import 'survey-creator-core/survey-creator-core.css'

// Only question types the device can render. Image/file/signature types are left out
// because they embed base64 content in the schema (see README).
const QUESTION_TYPES = [
  'text',
  'comment',
  'radiogroup',
  'checkbox',
  'dropdown',
  'tagbox',
  'boolean',
  'rating',
  'ranking',
  // 'matrix',
  // 'matrixdropdown',
  // 'multipletext',
  'panel',
  // 'paneldynamic',
  // 'expression',
  // 'html',
]

const CREATOR_OPTIONS = {
  questionTypes: QUESTION_TYPES,
  showThemeTab: false,
  showTranslationTab: false,
  showJSONEditorTab: true,
  collapseOnDrag: true,
}

export default function FormDesigner({ initialSchema, onChange }) {
  const [creator] = useState(() => {
    const c = new SurveyCreator(CREATOR_OPTIONS)
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
