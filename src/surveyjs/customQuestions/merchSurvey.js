import { defineCustomQuestion } from './defineCustomQuestion.js'
import { merchColumns } from './merchColumns.js'

// Merchandising Survey: a matrix with one row per product ("Select products" on its Rows).
export default defineCustomQuestion({
  name: 'merchsurvey',
  title: 'Merchandising Survey',
  // A shelf stocked with products.
  icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H4.5V21H3ZM19.5 3H21V21H19.5ZM4.5 10.25H19.5V11.75H4.5ZM4.5 19.5H19.5V21H4.5ZM6 5H9V10.25H6ZM11 6.5H14V10.25H11ZM15.5 4H18V10.25H15.5ZM6 14.5H10V19.5H6ZM12 13H15.5V19.5H12Z"/></svg>',
  marker: { on: 'matrixdropdownbase', name: 'merchSurvey' },
  json: {
    type: 'matrixdropdown',
    title: 'Merchandising Survey',
    merchSurvey: true,
    alternateRows: true,
    columns: merchColumns,
    rows: [],
  },
})
