// The columns both Merchandising Surveys ask for each product. Products are chosen in the
// designer ("Select products" on the matrix's rows, or on the Dynamic Merchandising Survey's
// Product column choices).
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
