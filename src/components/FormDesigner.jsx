import { useEffect, useState } from 'react'
import { Serializer, SvgRegistry } from 'survey-core'
import { UIPreset } from 'survey-creator-core'
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react'
import { PlainLight } from 'survey-core/themes'
import 'survey-core/survey-core.css'
import 'survey-creator-core/survey-creator-core.css'
import preset from '../config/preset.json'

// Tabs, toolbox, property grid and options all come from the UI preset.
const uiPreset = new UIPreset(preset)

// Marks a file question created from the "Photo" toolbox item. The flag is saved in the
// schema so renderers can recognise photo fields; any renderer must register it too.
if (!Serializer.findProperty('file', 'photoOnly')) {
  Serializer.addProperty('file', { name: 'photoOnly:boolean', default: false, visible: false })
}
const PHOTO_LOCKED_PROPERTIES = ['acceptedCategories', 'acceptedTypes']

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
