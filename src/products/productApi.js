// Mock of the remote product source: a flat list. Each product has an id, a description and
// any number of tag fields (manufacturer, brand, ...) that describe it. The picker derives its
// filters from whatever tag fields the products carry, in field order.
const tag = (id, manufacturer, brand, subBrand, variant, size) => ({
  id,
  description: [brand, subBrand, variant, size].join(' '),
  manufacturer,
  brand,
  subBrand,
  variant,
  size,
})

const IMANA = 'Imana Foods'
const NOODLE_KING = 'Noodle King'
const CANNERY = 'Collondale Cannery'

export const PRODUCTS = [
  tag(1, IMANA, 'Imana Foods', 'Soya Mince', 'Beef', '50g'),
  tag(2, IMANA, 'Imana Foods', 'Soya Mince', 'Beef', '100g'),
  tag(3, IMANA, 'Imana Foods', 'Soya Mince', 'Chicken', '50g'),
  tag(4, IMANA, 'Imana Foods', 'Soya Mince', 'Chicken', '100g'),
  tag(5, IMANA, 'Imana Foods', 'Soya Mince', 'Curry', '100g'),
  tag(6, IMANA, 'Imana Foods', 'Stock Cubes', 'Beef', '12 x 10g'),
  tag(7, IMANA, 'Imana Foods', 'Stock Cubes', 'Beef', '24 x 10g'),
  tag(8, IMANA, 'Imana Foods', 'Stock Cubes', 'Chicken', '12 x 10g'),
  tag(9, IMANA, 'Imana Foods', 'Stock Cubes', 'Chicken', '24 x 10g'),
  tag(10, IMANA, 'Imana Foods', 'Stock Cubes', 'Vegetable', '12 x 10g'),
  tag(11, IMANA, 'Imana Foods', 'Gravy', 'Brown Onion', '125g'),
  tag(12, IMANA, 'Imana Foods', 'Gravy', 'Brown Onion', '250g'),
  tag(13, IMANA, 'Imana Foods', 'Gravy', 'Chicken', '125g'),
  tag(14, IMANA, 'Imana Foods', 'Gravy', 'Beef', '125g'),
  tag(15, IMANA, 'Imana Foods', 'Gravy', 'Beef', '250g'),
  tag(16, NOODLE_KING, 'Eezee Noodles', 'Instant Noodles', 'Chicken', '70g'),
  tag(17, NOODLE_KING, 'Eezee Noodles', 'Instant Noodles', 'Chicken', '5 x 70g'),
  tag(18, NOODLE_KING, 'Eezee Noodles', 'Instant Noodles', 'Beef', '70g'),
  tag(19, NOODLE_KING, 'Eezee Noodles', 'Instant Noodles', 'Beef', '5 x 70g'),
  tag(20, NOODLE_KING, 'Eezee Noodles', 'Instant Noodles', 'Curry', '70g'),
  tag(21, NOODLE_KING, 'Eezee Noodles', 'Instant Noodles', 'Curry', '5 x 70g'),
  tag(22, NOODLE_KING, 'Eezee Noodles', 'Instant Noodles', 'Spicy Chilli', '70g'),
  tag(23, NOODLE_KING, 'Eezee Noodles', 'Cup Noodles', 'Chicken', '65g'),
  tag(24, NOODLE_KING, 'Eezee Noodles', 'Cup Noodles', 'Spicy Chilli', '65g'),
  tag(25, CANNERY, 'Shelford Juices', 'Juice', 'Orange', '330ml'),
  tag(26, CANNERY, 'Shelford Juices', 'Juice', 'Orange', '1L'),
  tag(27, CANNERY, 'Shelford Juices', 'Juice', 'Apple', '330ml'),
  tag(28, CANNERY, 'Shelford Juices', 'Juice', 'Apple', '1L'),
  tag(29, CANNERY, 'Shelford Juices', 'Juice', 'Guava', '1L'),
]

const TAG_LABELS = { manufacturer: 'Manufacturer', brand: 'Brand', subBrand: 'Sub-brand', variant: 'Variant', size: 'Size' }
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
