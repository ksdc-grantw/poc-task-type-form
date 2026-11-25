import { Serializer } from 'survey-core'

// Price Survey: a panel holding a Price Survey matrix (rows = products chosen in the designer; it
// is a Merchandising Survey, merchSurvey: true, so it has Products in the property grid) and a
// Housebrand Pricing dynamic matrix (agent adds rows, picking from a fixed list of housebrands).
// The designer keeps the panel to exactly those two questions (see FormDesigner.jsx).
if (!Serializer.findProperty('panel', 'priceSurvey')) {
  Serializer.addProperty('panel', { name: 'priceSurvey:boolean', default: false, visible: false })
}

export const isPriceSurvey = (element) => !!element?.isPanel && !!element.priceSurvey
