import { defineCustomQuestion } from './defineCustomQuestion.js'
import { merchColumns } from './merchColumns.js'

// Dynamic Merchandising Survey: the agent adds a row per product, picking it from the Product
// column's dropdown ("Select products" on that column's Choices). Shares the merchSurvey marker
// with Merchandising Survey (told apart by type).
export default defineCustomQuestion({
  name: 'dynamicmerchsurvey',
  title: 'Dynamic Merchandising Survey',
  // The shelf, with a "+" in place of the bottom products.
  icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H4.5V21H3ZM19.5 3H21V21H19.5ZM4.5 10.25H19.5V11.75H4.5ZM4.5 19.5H19.5V21H4.5ZM6 5H9V10.25H6ZM11 6.5H14V10.25H11ZM15.5 4H18V10.25H15.5ZM8.5 15H15.5V16.5H8.5ZM11.25 12.25H12.75V19.25H11.25Z"/></svg>',
  marker: { on: 'matrixdropdownbase', name: 'merchSurvey' },
  // Applies to every dynamic matrix; this is the only one that offers the min/max counts.
  displayNames: { minRowCount: 'Minimum products', maxRowCount: 'Maximum products' },
  json: {
    type: 'matrixdynamic',
    title: 'Dynamic Merchandising Survey',
    merchSurvey: true,
    alternateRows: true,
    rowCount: 1,
    minRowCount: 1,
    addRowText: 'Add product',
    keyName: 'Product',
    columns: [{ name: 'Product', title: 'Product', cellType: 'dropdown', isRequired: true, choices: [] }, ...merchColumns],
  },
})
