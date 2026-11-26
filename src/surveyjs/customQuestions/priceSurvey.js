import { defineCustomQuestion } from './defineCustomQuestion.js'
import { merchProducts } from './merchProducts.js'

const HOUSEBRANDS = [
  'Boxer',
  'Cambridge',
  'Checkers',
  'Choppies',
  'Food Lovers',
  'Makro Aro',
  'Makro First Value',
  'Makro M',
  'No Name',
  'PnP',
  'RiteBrand',
  'SaveMor',
  'SPAR',
  'Usave',
  'Other',
].map((brand, i) => ({ value: i + 1, text: `${brand} Housebrand` }))

// The columns both matrices ask for each product.
const priceColumns = [
  { name: 'Price', title: 'What is the price on shelf?', cellType: 'text', inputType: 'number', min: 0 },
  {
    name: 'PriceType',
    title: 'You MUST select if it is Unit Price or Shrink Price',
    cellType: 'radiogroup',
    colCount: 0,
    isRequired: true,
    choices: [
      { value: 1, text: 'Unit Price' },
      { value: 2, text: 'Shrink Price' },
    ],
    storeOthersAsComment: true,
  },
  {
    name: 'Promo',
    title: 'Tick ONLY if this is a Promotion or Special Price',
    cellType: 'checkbox',
    colCount: 0,
    choices: [{ value: 1, text: 'Promotion or Special Price' }],
    storeOthersAsComment: true,
  },
]

// Price Survey: a locked panel holding
// - a Price Survey matrix, one row per chosen product. It is a Merchandising Survey matrix
//   (merchSurvey: true), so it gets Products in the property grid.
// - a Housebrand Pricing dynamic matrix: the agent adds a row per housebrand, picked from a fixed list.
export default defineCustomQuestion({
  name: 'pricesurvey',
  title: 'Price Survey',
  // A price tag.
  icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2 5H14.5L21.5 12L14.5 19H2ZM3.5 6.5H13.88L19.38 12L13.88 17.5H3.5ZM7 10.5A1.5 1.5 0 1 1 7 13.5A1.5 1.5 0 1 1 7 10.5Z"/></svg>',
  marker: { on: 'panel', name: 'priceSurvey' },
  locked: true,
  products: merchProducts,
  json: {
    type: 'panel',
    title: 'Price Survey',
    priceSurvey: true,
    elements: [
      {
        type: 'matrixdropdown',
        name: 'priceSurvey',
        title: 'Price Survey',
        merchSurvey: true,
        alternateRows: true,
        columns: priceColumns,
        rows: [],
      },
      {
        type: 'matrixdynamic',
        name: 'housebrandPricing',
        title: 'Capture Housebrand Pricing Information',
        description: 'Add one row for each housebrand product you are capturing pricing information for',
        alternateRows: true,
        rowCount: 0,
        addRowText: 'Add Housebrand Product',
        columns: [
          {
            name: 'Select_Housebrand',
            title: 'Select a Housebrand',
            cellType: 'dropdown',
            choices: HOUSEBRANDS,
            storeOthersAsComment: true,
          },
          ...priceColumns,
        ],
      },
    ],
  },
})
