import { SvgRegistry } from 'survey-core'
import { productSetter } from '../customQuestions/index.js'
import { findProducts } from '../../products/productApi.js'

// Buttons in the property grid (the settings panel on the right) that open the product picker.
// The Creator fires onPropertyEditorUpdateTitleActions for each property it shows there, with
// options.titleActions = the buttons in that property's title bar, which we can add to.

SvgRegistry.registerIcon(
  'icon-select-products',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 3 6.5V17.5L12 22 21 17.5V6.5ZM12 3.68 18.94 7.15 12 10.62 5.06 7.15ZM4.5 8.36 11.25 11.74V20.04L4.5 16.66ZM12.75 20.04V11.74L19.5 8.36V16.66Z"/></svg>',
)

// Replaces a dropdown's choices with the products: value is the product id, text its description.
const setProductChoices = (question, products) => {
  question.choices = products.map((p) => ({ value: p.id, text: p.description }))
}

// pickProducts(initial, apply): opens the picker with `initial` ticked; apply(products) on confirm.
export const productButtons = (creator, pickProducts) => {
  creator.onPropertyEditorUpdateTitleActions.add((_, options) => {
    const question = options.obj
    const property = options.property.name

    // Any dropdown's Choices: an icon that replaces the choices with the chosen products. Placed
    // after the "?" help action, so it sits with the editor buttons rather than by the label.
    if (property === 'choices' && question.getType() === 'dropdown') {
      const helpIndex = options.titleActions.findIndex((a) => a.id === 'property-grid-help')
      options.titleActions.splice(helpIndex + 1, 0, {
        id: 'select-products',
        iconName: 'icon-select-products',
        title: 'Select products',
        showTitle: false,
        action: () =>
          pickProducts(findProducts(question.choices.map((c) => c.value)), (products) => setProductChoices(question, products)),
      })
      return
    }

    // A Custom Question's Products property (e.g. merchProductRefs): "Select..." and "Clear".
    // Its definition's apply function writes the products into the question (rows or choices).
    const setProducts = productSetter(property)
    if (!setProducts) return
    options.titleActions.push(
      {
        id: 'select-product',
        title: 'Select...',
        action: () => pickProducts(question[property], (products) => setProducts(question, products)),
      },
      { id: 'clear-product', title: 'Clear', action: () => setProducts(question, []) },
    )
  })
}
