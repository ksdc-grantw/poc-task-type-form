import { Serializer, SvgRegistry } from 'survey-core'
import photo from './photo.js'
import merchSurvey from './merchSurvey.js'
import dynamicMerchSurvey from './dynamicMerchSurvey.js'
import shopperQuestionnaire from './shopperQuestionnaire.js'
import takePhoto from './takePhoto.js'
import priceSurvey from './priceSurvey.js'

// Every Custom Question Definition. To add a Custom Question, add its module here and its name to
// a toolbox category in preset.json.
const definitions = [photo, merchSurvey, dynamicMerchSurvey, shopperQuestionnaire, takePhoto, priceSurvey]

const addProperty = (on, json) => {
  const name = json.name.split(':')[0]
  if (!Serializer.findProperty(on, name)) Serializer.addProperty(on, json)
}

// Importing this module registers the marker properties the saved forms use, so every renderer
// (designer, preview pages, device app) must import it.
for (const { marker } of definitions) {
  addProperty(marker.on, { name: `${marker.name}:boolean`, default: false, visible: false })
}

const is = (definition, element) => element?.getType?.() === definition.json.type && !!element[definition.marker.name]

// Panels the designer keeps to exactly their toolbox questions (Take Photo, Price Survey).
const lockedDefinitions = definitions.filter((d) => d.locked)
export const isLockedPanel = (element) => lockedDefinitions.some((d) => is(d, element))

// True for a locked panel and anything inside it.
export const isInLockedPanel = (element) => {
  for (let el = element; el && !el.isPage; el = el.parent) if (isLockedPanel(el)) return true
  return false
}

// Designer only: registers the toolbox icons and property display names, and returns the
// preset with a toolbox item per definition added. Throws if a toolbox category names an item
// that isn't defined.
export const withCustomQuestions = (preset) => {
  for (const { json, displayNames = {} } of definitions) {
    for (const [property, displayName] of Object.entries(displayNames)) {
      Serializer.findProperty(json.type, property).displayName = displayName
    }
  }
  const items = definitions.map(({ name, title, icon, iconName, json }) => {
    if (icon) SvgRegistry.registerIcon(`icon-toolbox-${name}-24x24`, icon)
    return { name, title, iconName: iconName ?? `icon-toolbox-${name}-24x24`, json }
  })
  const definition = [...preset.toolbox.definition, ...items]
  const defined = new Set(definition.map((item) => item.name))
  for (const { items: names } of preset.toolbox.categories) {
    const missing = names.filter((n) => !defined.has(n))
    if (missing.length) throw new Error(`Toolbox categories name undefined items: ${missing.join(', ')}`)
  }
  return { ...preset, toolbox: { ...preset.toolbox, definition } }
}
