import { SvgRegistry } from 'survey-core'
import { findProducts } from '../../products/productApi.js'

// A "Select products" icon in the property grid (the settings panel on the right) on every
// list a form can hold products in:
// - choices: Dropdown, Checkboxes, Radio Button Group, and a matrix column's cells (select the
//   column on the design surface), e.g. the Dynamic Merchandising Survey's Product column or
//   the Shopper Questionnaire's Product dropdown.
// - rows: a matrix's rows, e.g. the Merchandising Survey and the Price Survey matrix.
// The chosen products replace the list (value = product id, text = description), so the saved
// form carries them like any hand-written choices or rows and renderers need no product lookup.
//
// The Creator fires onPropertyEditorUpdateTitleActions for each property it shows, with
// options.titleActions = the buttons in that property's title bar, which we can add to.

SvgRegistry.registerIcon(
  'icon-select-products',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 3 6.5V17.5L12 22 21 17.5V6.5ZM12 3.68 18.94 7.15 12 10.62 5.06 7.15ZM4.5 8.36 11.25 11.74V20.04L4.5 16.66ZM12.75 20.04V11.74L19.5 8.36V16.66Z"/></svg>',
)

const PRODUCT_LISTS = ['choices', 'rows']

// pickProducts(initial, apply): opens the picker with `initial` ticked; apply(products) on confirm.
export const productButtons = (creator, pickProducts) => {
  creator.onPropertyEditorUpdateTitleActions.add((_, options) => {
    const element = options.obj
    const property = options.property.name
    // Array check: a Long Text's "rows" is a number (its height), not a list.
    if (!PRODUCT_LISTS.includes(property) || !Array.isArray(element[property])) return

    // After the "?" help action, so it sits with the editor buttons rather than by the label.
    const helpIndex = options.titleActions.findIndex((a) => a.id === 'property-grid-help')
    options.titleActions.splice(helpIndex + 1, 0, {
      id: 'select-products',
      iconName: 'icon-select-products',
      title: 'Select products',
      showTitle: false,
      action: () =>
        pickProducts(findProducts(element[property].map((item) => item.value)), (products) => {
          element[property] = products.map((p) => ({ value: p.id, text: p.description }))
        }),
    })
  })
}
