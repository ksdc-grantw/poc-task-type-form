// The STOCK_COUNT function has a fixed form that cannot be designed or changed: one product-related
// "Capture counts" matrix. The products are left empty so the Task creator must choose them; the
// task preview/renderer then generates one row per chosen product (productMode "matrix").
// The answer is [{ productId, product, units, cases, pallets }].
const countColumn = (name, title) => ({
  name,
  title,
  cellType: 'text',
  inputType: 'number',
  min: 0,
  step: 1,
  isRequired: true,
})

export const buildStockCountForm = () => ({
  version: 1,
  engine: 'surveyjs',
  schema: {
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'matrixdynamic',
            name: 'captureCounts',
            title: 'Capture counts',
            productRelated: true,
            productMode: 'matrix',
            rowCount: 0,
            allowAddRows: false,
            allowRemoveRows: false,
            columns: [
              { name: 'product', title: 'Product', cellType: 'text', readOnly: true },
              countColumn('units', 'Units'),
              countColumn('cases', 'Cases'),
              countColumn('pallets', 'Pallets'),
            ],
          },
        ],
      },
    ],
  },
})
