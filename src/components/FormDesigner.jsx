import { useEffect, useState } from 'react'
import { ComponentCollection, SvgRegistry } from 'survey-core'
import { UIPreset } from 'survey-creator-core'
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react'
import { PlainLight } from 'survey-core/themes'
import 'survey-core/survey-core.css'
import 'survey-creator-core/survey-creator-core.css'
import preset from '../config/preset.json'
import '../survey/customQuestions.js'

// Tabs, toolbox, property grid and options all come from the UI preset.
const uiPreset = new UIPreset(preset)

const PHOTO_LOCKED_PROPERTIES = ['acceptedCategories', 'acceptedTypes']

// Question names are random IDs, generated once and never edited (the name field is hidden
// in the preset). The designer's default (lowest unused number) reuses names after a
// delete, which would let reports confuse an old question with a new one.
const DEFAULT_TITLE = 'Enter question title'

const newQuestionName = (taken) => {
  let name
  do {
    name = `q_${Math.random().toString(36).slice(2, 10).padEnd(8, '0')}`
  } while (taken.has(name))
  return name
}

// The Creator has no built-in number icon, so the "Number" toolbox item uses this "#" icon.
SvgRegistry.registerIcon(
  'icon-toolbox-number-24x24',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 8.25H20V9.75H4ZM4 14.25H20V15.75H4ZM9.25 4H10.75L8.75 20H7.25ZM15.25 4H16.75L14.75 20H13.25Z"/></svg>',
)

export default function FormDesigner({ initialSchema, initialTab, onChange }) {
  const [creator] = useState(() => {
    const c = new SurveyCreator({ collapseOnDrag: true, showCreatorThemeSettings: false })
    uiPreset.applyTo(c)
    // Fixed Creator UI theme; the "Creator Settings" (gear) button is hidden above.
    c.applyCreatorTheme(PlainLight)
    // Photo questions are always images only, so hide the file-type settings for them.
    c.onPropertyShowing.add((_, options) => {
      if (options.element.photoOnly && PHOTO_LOCKED_PROPERTIES.includes(options.property.name)) {
        options.show = false
      }
    })
    if (initialSchema) c.JSON = initialSchema
    // Converting a question's type keeps its name; every other way of adding gets a new ID
    // (copies must not share their original's name).
    c.onQuestionAdded.add((sender, options) => {
      if (options.reason === 'ELEMENT_CONVERTED') return
      const taken = new Set(sender.survey.getAllQuestions().map((q) => q.name))
      const question = options.question
      question.name = newQuestionName(taken)
      // Without a title the form shows the (random) name. Custom types keep their own default title.
      const isCopy = options.reason === 'ELEMENT_COPIED'
      const isCustomType = !!ComponentCollection.Instance.getCustomQuestionByName(question.getType())
      if (!isCopy && !isCustomType && !question.locTitle.getJson()) question.title = DEFAULT_TITLE
    })
    // e.g. "preview" when opened from the list's "Open Preview" link.
    if (initialTab) c.activeTab = initialTab
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
