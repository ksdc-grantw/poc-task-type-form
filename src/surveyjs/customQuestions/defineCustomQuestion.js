// The shape of a Custom Question Definition. Only checks the shape; the registry (index.js)
// does the registering.
//
// {
//   name:         toolbox item name, e.g. 'pricesurvey'
//   title:        toolbox title
//   icon:         SVG markup, registered as icon-toolbox-<name>-24x24 (or iconName: a built-in icon)
//   marker:       { on, name } - the hidden boolean that marks the question in the saved JSON,
//                 e.g. { on: 'panel', name: 'priceSurvey' }; json must set it to true
//   json:         what the toolbox item creates
//   locked:       optional; true keeps the panel to exactly its json questions in the designer
//   products:     optional Products spec (see merchProducts.js) for the chosen-products property
//   displayNames: optional { property: label } for json.type's properties (applies to every
//                 question of that type)
// }
export const defineCustomQuestion = (definition) => {
  const { name, title, icon, iconName, marker, json, locked, products } = definition
  const fail = (message) => {
    throw new Error(`Custom Question "${name}": ${message}`)
  }
  if (!name || !title) fail('name and title are required')
  if (!icon === !iconName) fail('needs exactly one of icon or iconName')
  if (!marker?.on || !marker?.name) fail('marker needs on and name')
  if (json?.[marker.name] !== true) fail(`json must set ${marker.name}: true`)
  if (locked && json.type !== 'panel') fail('only panels can be locked')
  if (products && (!products.on || !products.name || !products.apply)) fail('products needs on, name and apply')
  return definition
}
