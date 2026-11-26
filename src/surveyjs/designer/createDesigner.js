// Builds the form designer: a SurveyJS Creator (the drag-and-drop form editor) set up for
// non-technical form authors. Out of the box the Creator offers every SurveyJS feature; each
// step below narrows or extends it. Read top to bottom.
import { SvgRegistry } from 'survey-core'
import { UIPreset } from 'survey-creator-core'
import { SurveyCreator } from 'survey-creator-react'
import { PlainLight } from 'survey-core/themes'
import preset from '../preset.json'
import { withCustomQuestions } from '../customQuestions/index.js'
import '../productRefEditor.js'
import { withDesignerOnlyOptions } from './designerOnlyOptions.js'
import { questionNames } from './questionNames.js'
import { lockedPanels } from './lockedPanels.js'
import { productButtons } from './productButtons.js'

// The UI preset (preset.json, in the SurveyJS UI Preset Editor's format) says which tabs,
// toolbox items, property-grid properties and options the Creator shows. The Custom Questions'
// toolbox items are added from their definitions (customQuestions/).
const uiPreset = new UIPreset(withCustomQuestions(preset))

// The preset's "Number" toolbox item needs an icon; the Creator has none, so this is a "#".
SvgRegistry.registerIcon(
  'icon-toolbox-number-24x24',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 8.25H20V9.75H4ZM4 14.25H20V15.75H4ZM9.25 4H10.75L8.75 20H7.25ZM15.25 4H16.75L14.75 20H13.25Z"/></svg>',
)

// schema:       the form JSON to edit
// pickProducts: (initial, apply) => opens the product picker with `initial` ticked, and calls
//               apply(products) when the author confirms
export const createDesigner = ({ schema, readOnly, initialTab, pickProducts }) => {
  // 1. The stock designer. collapseOnDrag folds questions while dragging; the theme settings
  //    (gear) button is hidden because the theme is fixed in step 3.
  const creator = new SurveyCreator({ collapseOnDrag: true, showCreatorThemeSettings: false, readOnly })

  // 2. Tabs, toolbox, property grid and options from the preset.
  uiPreset.applyTo(creator)

  // 3. The designer's own look (not the form's).
  creator.applyCreatorTheme(PlainLight)

  // 4. The form to edit, plus settings that only apply while designing.
  creator.JSON = withDesignerOnlyOptions(schema)

  // 5. Our rules, each hooking Creator events (see each module):
  questionNames(creator) //               random, never-reused question names
  lockedPanels(creator) //                Take Photo / Price Survey keep exactly their questions
  productButtons(creator, pickProducts) // "Select..." buttons that open the product picker

  // 6. e.g. "preview" when opened from the list's "Open Preview" link.
  if (initialTab) creator.activeTab = initialTab
  return creator
}
