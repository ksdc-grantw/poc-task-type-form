import { useEffect, useState } from 'react'
import { Serializer, SvgRegistry } from 'survey-core'
import { UIPreset } from 'survey-creator-core'
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react'
import { PlainLight } from 'survey-core/themes'
import 'survey-core/survey-core.css'
import 'survey-creator-core/survey-creator-core.css'
import preset from './preset.json'
import './customQuestions.js'
import './productRefEditor.js'
import { setMerchProducts } from './merchSurvey.js'
import { setShopperProducts } from './shopperQuestionnaire.js'
import { isInLockedPanel, isLockedPanel } from './lockedPanel.js'
import ProductPickerModal from '../products/ProductPickerModal.jsx'
import { findProducts } from '../products/productApi.js'

// Tabs, toolbox, property grid and options all come from the UI preset.
const uiPreset = new UIPreset(preset)

// Only the Dynamic Merchandising Survey and Shopper Questionnaire offer the min/max counts, so
// name them for products; file questions are only ever Photos.
const PROPERTY_DISPLAY_NAMES = {
  matrixdynamic: { minRowCount: 'Minimum products', maxRowCount: 'Maximum products' },
  paneldynamic: { minPanelCount: 'Minimum products', maxPanelCount: 'Maximum products' },
  file: { maxFiles: 'Maximum photos' },
}
for (const [type, names] of Object.entries(PROPERTY_DISPLAY_NAMES)) {
  for (const [name, displayName] of Object.entries(names)) Serializer.findProperty(type, name).displayName = displayName
}

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

// When a dynamic panel is added or copied, the Creator renames every question in its template
// (using getNewQuestionName, so they get random IDs too) and updates expressions, but not the
// "{panel.name}" references in the panel titles. newQuestionChangedNames (old -> new) is internal
// to the Creator; if it goes away, the titles keep the old names.
const updateTemplateTitles = (creator, question) => {
  const renamed = creator.newQuestionChangedNames
  if (question.getType() !== 'paneldynamic' || !renamed) return
  const rename = (text) =>
    text && text.replace(/\{panel\.([^}.[]+)/g, (match, name) => (renamed[name] ? `{panel.${renamed[name]}` : match))
  question.templateTitle = rename(question.templateTitle)
  question.templateTabTitle = rename(question.templateTabTitle)
}

// The Creator has no built-in number icon, so the "Number" toolbox item uses this "#" icon.
SvgRegistry.registerIcon(
  'icon-toolbox-number-24x24',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 8.25H20V9.75H4ZM4 14.25H20V15.75H4ZM9.25 4H10.75L8.75 20H7.25ZM15.25 4H16.75L14.75 20H13.25Z"/></svg>',
)

// Merchandising Survey: a shelf stocked with products.
SvgRegistry.registerIcon(
  'icon-toolbox-merchsurvey-24x24',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H4.5V21H3ZM19.5 3H21V21H19.5ZM4.5 10.25H19.5V11.75H4.5ZM4.5 19.5H19.5V21H4.5ZM6 5H9V10.25H6ZM11 6.5H14V10.25H11ZM15.5 4H18V10.25H15.5ZM6 14.5H10V19.5H6ZM12 13H15.5V19.5H12Z"/></svg>',
)

// Dynamic Merchandising Survey: the shelf, with a "+" in place of the bottom products.
SvgRegistry.registerIcon(
  'icon-toolbox-dynamicmerchsurvey-24x24',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H4.5V21H3ZM19.5 3H21V21H19.5ZM4.5 10.25H19.5V11.75H4.5ZM4.5 19.5H19.5V21H4.5ZM6 5H9V10.25H6ZM11 6.5H14V10.25H11ZM15.5 4H18V10.25H15.5ZM8.5 15H15.5V16.5H8.5ZM11.25 12.25H12.75V19.25H11.25Z"/></svg>',
)

// Shopper Questionnaire: a shopping bag with a tick.
SvgRegistry.registerIcon(
  'icon-toolbox-shopperquestionnaire-24x24',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4 8H20L19 21H5ZM5.6 9.5H18.4L17.6 19.5H6.4Z"/><path d="M8.25 8V6.5A3.75 3.75 0 0 1 15.75 6.5V8H14.25V6.5A2.25 2.25 0 0 0 9.75 6.5V8ZM9 14.2 10.06 13.14 11.25 14.33 13.94 11.64 15 12.7 11.25 16.45Z"/></svg>',
)

// Take Photo: a camera with a tag.
SvgRegistry.registerIcon(
  'icon-toolbox-phototag-24x24',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2 5H6L7.5 3H12.5L14 5H18V11H16.5V6.5H3.5V13.5H11V15H2ZM10 7A2.5 2.5 0 1 1 10 12A2.5 2.5 0 1 1 10 7Z"/><path fill-rule="evenodd" d="M12.5 12.5H18L22 17L18 21.5H12.5ZM17 16A1 1 0 1 0 17 18A1 1 0 1 0 17 16Z"/></svg>',
)

// Price Survey: a price tag.
SvgRegistry.registerIcon(
  'icon-toolbox-pricesurvey-24x24',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2 5H14.5L21.5 12L14.5 19H2ZM3.5 6.5H13.88L19.38 12L13.88 17.5H3.5ZM7 10.5A1.5 1.5 0 1 1 7 13.5A1.5 1.5 0 1 1 7 10.5Z"/></svg>',
)

// Icon for the "Select products" action beside a dropdown's Choices.
SvgRegistry.registerIcon(
  'icon-select-products',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 3 6.5V17.5L12 22 21 17.5V6.5ZM12 3.68 18.94 7.15 12 10.62 5.06 7.15ZM4.5 8.36 11.25 11.74V20.04L4.5 16.66ZM12.75 20.04V11.74L19.5 8.36V16.66Z"/></svg>',
)

// The Merchandising Surveys and Shopper Questionnaire each keep their chosen products in their own property.
const PRODUCT_REFS = {
  merchProductRefs: setMerchProducts,
  shopperProductRefs: setShopperProducts,
}

// Replaces a dropdown's choices with the products: value is the product id, text its description.
const setProductChoices = (question, products) => {
  question.choices = products.map((p) => ({ value: p.id, text: p.description }))
}

export default function FormDesigner({ initialSchema, initialTab, onChange, readOnly = false }) {
  // The products property being chosen in the modal: { question, property }.
  const [picker, setPicker] = useState(null)
  // The dropdown whose choices are being replaced with products chosen in the modal.
  const [choicesQuestion, setChoicesQuestion] = useState(null)
  const [creator] = useState(() => {
    const c = new SurveyCreator({ collapseOnDrag: true, showCreatorThemeSettings: false, readOnly })
    uiPreset.applyTo(c)
    c.onPropertyEditorUpdateTitleActions.add((_, options) => {
      if (options.property.name === 'choices' && options.obj.getType() === 'dropdown') {
        const question = options.obj
        // After the "?" help action, so it sits with the editor buttons rather than by the label.
        const helpIndex = options.titleActions.findIndex((a) => a.id === 'property-grid-help')
        options.titleActions.splice(helpIndex + 1, 0, {
          id: 'select-products',
          iconName: 'icon-select-products',
          title: 'Select products',
          showTitle: false,
          action: () => setChoicesQuestion(question),
        })
        return
      }
      const property = options.property.name
      const setProducts = PRODUCT_REFS[property]
      if (!setProducts) return
      const question = options.obj
      options.titleActions.push(
        { id: 'select-product', title: 'Select...', action: () => setPicker({ question, property }) },
        { id: 'clear-product', title: 'Clear', action: () => setProducts(question, []) },
      )
    })
    // Fixed Creator UI theme; the "Creator Settings" (gear) button is hidden above.
    c.applyCreatorTheme(PlainLight)
    if (initialSchema) c.JSON = initialSchema
    // Also used for questions nested in a toolbox item or copy (e.g. a dynamic panel's template).
    c.getNewQuestionName = () =>
      newQuestionName(new Set([...c.getAllQuestions(), ...c.getAllPanels()].map((el) => el.name)))
    // Converting a question's type keeps its name; every other way of adding gets a new ID
    // (copies must not share their original's name).
    c.onQuestionAdded.add((sender, options) => {
      if (options.reason === 'ELEMENT_CONVERTED') return
      const taken = new Set(sender.survey.getAllQuestions().map((q) => q.name))
      const question = options.question
      question.name = newQuestionName(taken)
      // Without a title the form shows the (random) name.
      const isCopy = options.reason === 'ELEMENT_COPIED'
      if (!isCopy && !question.locTitle.getJson()) question.title = DEFAULT_TITLE
      updateTemplateTitles(sender, question)
    })
    // Take Photo and Price Survey hold exactly their preset questions: nothing can be dropped into
    // them, and their questions can't be removed, copied, dragged out or converted.
    c.onDragDropAllow.add((_, options) => {
      const { target, insertBefore, insertAfter } = options
      const container = !insertBefore && !insertAfter && target?.isPanel ? target : target?.parent
      if (isInLockedPanel(container)) options.allow = false
    })
    c.onElementAllowOperations.add((_, options) => {
      // allowEdit: false hides the panel's "Add Question" button (title still editable in the property grid).
      if (isLockedPanel(options.obj)) options.allowEdit = false
      if (!isLockedPanel(options.obj?.parent)) return
      Object.assign(options, { allowDelete: false, allowCopy: false, allowDrag: false, allowDragging: false, allowChangeType: false })
    })
    // Anything else that lands inside (toolbox click or paste while a locked panel's question is
    // selected) is moved to just after the panel.
    const moveOutOfLockedPanel = (element) => {
      let panel = element.parent
      while (panel && !isLockedPanel(panel)) panel = panel.parent
      if (!panel) return
      element.parent.removeElement(element)
      panel.parent.addElement(element, panel.parent.elements.indexOf(panel) + 1)
      c.selectElement(element)
    }
    c.onQuestionAdded.add((_, options) => moveOutOfLockedPanel(options.question))
    c.onPanelAdded.add((_, options) => moveOutOfLockedPanel(options.panel))
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
      {picker && (
        <ProductPickerModal
          initial={picker.question[picker.property]}
          onClose={() => setPicker(null)}
          onSelect={(items) => {
            PRODUCT_REFS[picker.property](picker.question, items)
            setPicker(null)
          }}
        />
      )}
      {choicesQuestion && (
        <ProductPickerModal
          initial={findProducts(choicesQuestion.choices.map((c) => c.value))}
          onClose={() => setChoicesQuestion(null)}
          onSelect={(items) => {
            setProductChoices(choicesQuestion, items)
            setChoicesQuestion(null)
          }}
        />
      )}
    </div>
  )
}
