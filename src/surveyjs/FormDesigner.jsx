import { useEffect, useState } from 'react'
import { ComponentCollection, SvgRegistry } from 'survey-core'
import { UIPreset } from 'survey-creator-core'
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react'
import { PlainLight } from 'survey-core/themes'
import 'survey-core/survey-core.css'
import 'survey-creator-core/survey-creator-core.css'
import preset from './preset.json'
import './customQuestions.js'
import './productRefEditor.js'
import { setMerchProducts } from './merchSurvey.js'
import ProductPickerModal from '../products/ProductPickerModal.jsx'
import { findProducts } from '../products/productApi.js'

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

// Icon for the "Select products" action beside a dropdown's Choices.
SvgRegistry.registerIcon(
  'icon-select-products',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 3 6.5V17.5L12 22 21 17.5V6.5ZM12 3.68 18.94 7.15 12 10.62 5.06 7.15ZM4.5 8.36 11.25 11.74V20.04L4.5 16.66ZM12.75 20.04V11.74L19.5 8.36V16.66Z"/></svg>',
)

// Dropdowns take their products as choices, so the product-binding settings don't apply.
const DROPDOWN_HIDDEN_PROPERTIES = ['productRelated', 'productRefs', 'productMode']

const clearProductRefs = (question) => setProductRefs(question, [])

const setProductRefs = (question, refs) => {
  if (question.merchSurvey) setMerchProducts(question, refs)
  else question.productRefs = refs
}

// Replaces a dropdown's choices with the products: value is the product id, text its description.
const setProductChoices = (question, products) => {
  question.choices = products.map((p) => ({ value: p.id, text: p.description }))
}

export default function FormDesigner({ initialSchema, initialTab, onChange, readOnly = false }) {
  // The question whose default product is being chosen in the modal.
  const [pickerQuestion, setPickerQuestion] = useState(null)
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
      if (!['productRefs', 'merchProductRefs'].includes(options.property.name)) return
      const question = options.obj
      options.titleActions.push(
        { id: 'select-product', title: 'Select...', action: () => setPickerQuestion(question) },
        { id: 'clear-product', title: 'Clear', action: () => clearProductRefs(question) },
      )
    })
    // Switching "Related to Product" on defaults the mode; off clears the product settings.
    c.onModified.add((_, options) => {
      if (options.name !== 'productRelated') return
      const question = options.target
      if (question.productRelated) {
        if (!question.productMode) question.productMode = 'single'
      } else if (question.productRefs?.length || question.productMode) {
        question.productRefs = []
        question.productMode = undefined
      }
    })
    // Fixed Creator UI theme; the "Creator Settings" (gear) button is hidden above.
    c.applyCreatorTheme(PlainLight)
    // Photo questions are always images only, so hide the file-type settings for them.
    c.onPropertyShowing.add((_, options) => {
      if (options.element.merchSurvey && ['productRelated', 'productRefs', 'productMode'].includes(options.property.name)) {
        options.show = false
      }
      if (options.element.getType() === 'dropdown' && DROPDOWN_HIDDEN_PROPERTIES.includes(options.property.name)) {
        options.show = false
      }
      if (options.element.photoOnly && PHOTO_LOCKED_PROPERTIES.includes(options.property.name)) {
        options.show = false
      }
    })
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
      // Without a title the form shows the (random) name. Custom types keep their own default title.
      const isCopy = options.reason === 'ELEMENT_COPIED'
      const isCustomType = !!ComponentCollection.Instance.getCustomQuestionByName(question.getType())
      if (!isCopy && !isCustomType && !question.locTitle.getJson()) question.title = DEFAULT_TITLE
      updateTemplateTitles(sender, question)
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
      {pickerQuestion && (
        <ProductPickerModal
          initial={pickerQuestion.merchSurvey ? pickerQuestion.merchProductRefs : pickerQuestion.productRefs}
          onClose={() => setPickerQuestion(null)}
          onSelect={(items) => {
            setProductRefs(pickerQuestion, items)
            setPickerQuestion(null)
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
