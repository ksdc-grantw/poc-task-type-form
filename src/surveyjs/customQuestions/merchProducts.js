// Products spec shared by every Merchandising Survey matrix (Merchandising Survey, Dynamic
// Merchandising Survey and the Price Survey matrix). The products chosen in the designer are
// written into the form JSON like a hand-built matrix (value = product id, text = description),
// so renderers need no product lookup:
// - matrixdropdown: the products are the rows.
// - matrixdynamic: the agent adds rows and picks each row's product from the first column's
//   dropdown, whose choices are the products.
export const merchProducts = {
  on: 'matrixdropdownbase',
  name: 'merchProductRefs',
  visibleIf: (obj) => !!obj?.merchSurvey,
  apply: (question, products) => {
    question.merchProductRefs = products
    const items = products.map((p) => ({ value: p.id, text: p.description }))
    if (question.getType() === 'matrixdynamic') question.columns[0].choices = items
    else question.rows = items
  },
}

// The columns both Merchandising Surveys ask for each product.
export const merchColumns = [
  { name: 'ShelfFacings', title: 'How many shelf facings?', cellType: 'text', inputType: 'number' },
  {
    name: 'ProductPlacement',
    title: 'Which shelf is the product on?',
    cellType: 'dropdown',
    choices: [
      { value: 1, text: 'Top' },
      { value: 2, text: 'Middle' },
      { value: 3, text: 'Bottom' },
      { value: 4, text: 'No stock' },
    ],
    storeOthersAsComment: true,
  },
  {
    name: '2ndDisplayType',
    title: 'If there is another display in store, what type of display is it?',
    cellType: 'dropdown',
    choices: [
      { value: 1, text: 'Gondola End' },
      { value: 2, text: 'Free Standing Unit' },
      { value: 3, text: 'Shelf Display' },
    ],
    storeOthersAsComment: true,
  },
]
