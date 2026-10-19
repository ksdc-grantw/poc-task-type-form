// Mock of the remote product source: a flat list. Each product has an id, a description and
// any number of tag fields (brand, subBrand, ...) that describe it. The picker derives its
// filters from whatever tag fields the products carry.
const tag = (id, description, brand, subBrand, variant, size) => ({ id, description, brand, subBrand, variant, size })

export const PRODUCTS = [
  tag(1, 'Imana Foods Soya Mince Beef 50g', 'Imana Foods', 'Soya Mince', 'Beef', '50g'),
  tag(2, 'Imana Foods Soya Mince Beef 100g', 'Imana Foods', 'Soya Mince', 'Beef', '100g'),
  tag(3, 'Imana Foods Soya Mince Chicken 50g', 'Imana Foods', 'Soya Mince', 'Chicken', '50g'),
  tag(4, 'Imana Foods Soya Chunks Beef 100g', 'Imana Foods', 'Soya Chunks', 'Beef', '100g'),
  tag(5, 'Imana Foods Soya Chunks Curry 100g', 'Imana Foods', 'Soya Chunks', 'Curry', '100g'),
  tag(6, 'Cola Co Classic Original 330ml', 'Cola Co', 'Classic', 'Original', '330ml'),
  tag(7, 'Cola Co Classic Original 2L', 'Cola Co', 'Classic', 'Original', '2L'),
  tag(8, 'Cola Co Zero Original 330ml', 'Cola Co', 'Zero', 'Original', '330ml'),
  tag(9, 'Cola Co Zero Lime 330ml', 'Cola Co', 'Zero', 'Lime', '330ml'),
  tag(10, 'Crunchy Chips Salted 125g', 'Crunchy', 'Chips', 'Salted', '125g'),
  tag(11, 'Crunchy Chips Cheese 125g', 'Crunchy', 'Chips', 'Cheese', '125g'),
  tag(12, 'Crunchy Chips Cheese 250g', 'Crunchy', 'Chips', 'Cheese', '250g'),
  tag(13, 'Farmhouse Milk Full Cream 1L', 'Farmhouse', 'Milk', 'Full Cream', '1L'),
  tag(14, 'Farmhouse Milk Low Fat 1L', 'Farmhouse', 'Milk', 'Low Fat', '1L'),
  tag(15, 'Farmhouse Yoghurt Strawberry 175g', 'Farmhouse', 'Yoghurt', 'Strawberry', '175g'),
  tag(16, 'Farmhouse Yoghurt Vanilla 175g', 'Farmhouse', 'Yoghurt', 'Vanilla', '175g'),
]

const TAG_LABELS = { brand: 'Brand', subBrand: 'Sub-brand', variant: 'Variant', size: 'Size' }
const NON_TAG_FIELDS = new Set(['id', 'description'])

// The filter groups: every field except id/description, with its distinct values.
export const listFilters = (products = PRODUCTS) => {
  const groups = new Map()
  for (const p of products) {
    for (const [field, value] of Object.entries(p)) {
      if (NON_TAG_FIELDS.has(field) || value == null || value === '') continue
      if (!groups.has(field)) groups.set(field, new Set())
      groups.get(field).add(value)
    }
  }
  return [...groups].map(([field, values]) => ({
    field,
    label: TAG_LABELS[field] ?? field,
    values: [...values].sort(),
  }))
}

// `filters` maps a field to the ticked values. Values within a field are OR'd, fields are
// AND'd. With no ticked values at all there are no matches.
export const matchProducts = (filters, products = PRODUCTS) => {
  const active = Object.entries(filters).filter(([, values]) => values.size > 0)
  if (!active.length) return []
  return products.filter((p) => active.every(([field, values]) => values.has(p[field])))
}

export const findProducts = (ids) => ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean)
