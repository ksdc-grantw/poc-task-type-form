const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock of the remote product source: category > product line > product.
const CATEGORIES = [
  { id: 'cat-beverages', name: 'Beverages' },
  { id: 'cat-snacks', name: 'Snacks' },
  { id: 'cat-dairy', name: 'Dairy' },
]

const LINES = [
  { id: 'line-cola', name: 'Cola Range', categoryId: 'cat-beverages' },
  { id: 'line-water', name: 'Water Range', categoryId: 'cat-beverages' },
  { id: 'line-chips', name: 'Chips Range', categoryId: 'cat-snacks' },
  { id: 'line-biscuits', name: 'Biscuit Range', categoryId: 'cat-snacks' },
  { id: 'line-milk', name: 'Milk Range', categoryId: 'cat-dairy' },
  { id: 'line-yoghurt', name: 'Yoghurt Range', categoryId: 'cat-dairy' },
]

const PRODUCTS = [
  ['Cola 330ml', 'line-cola'],
  ['Cola 2L', 'line-cola'],
  ['Cola Zero 330ml', 'line-cola'],
  ['Still Water 500ml', 'line-water'],
  ['Sparkling Water 500ml', 'line-water'],
  ['Salted Chips 125g', 'line-chips'],
  ['Cheese Chips 125g', 'line-chips'],
  ['Choc Chip Biscuits 200g', 'line-biscuits'],
  ['Shortbread 200g', 'line-biscuits'],
  ['Full Cream Milk 1L', 'line-milk'],
  ['Low Fat Milk 1L', 'line-milk'],
  ['Strawberry Yoghurt 175g', 'line-yoghurt'],
  ['Vanilla Yoghurt 175g', 'line-yoghurt'],
].map(([name, lineId], i) => ({ id: `sku-${1000 + i}`, name, lineId }))

const lineById = Object.fromEntries(LINES.map((l) => [l.id, l]))
const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

// Every result carries a hierarchy path so it can be snapshotted onto a Task.
const items = {
  category: CATEGORIES.map((c) => ({ id: c.id, name: c.name, level: 'category', path: c.name })),
  line: LINES.map((l) => ({
    id: l.id,
    name: l.name,
    level: 'line',
    parentId: l.categoryId,
    path: `${categoryById[l.categoryId].name} › ${l.name}`,
  })),
  product: PRODUCTS.map((p) => {
    const line = lineById[p.lineId]
    return {
      id: p.id,
      name: p.name,
      level: 'product',
      parentId: p.lineId,
      path: `${categoryById[line.categoryId].name} › ${line.name} › ${p.name}`,
    }
  }),
}

export const productApi = {
  // GET /products?level=&q=
  async search({ level, query = '' }) {
    await delay()
    const q = query.trim().toLowerCase()
    return items[level].filter((i) => !q || i.path.toLowerCase().includes(q))
  },
}

// Synchronous lookups for the form designer's property grid. A remote source would
// need a searchable async editor instead.
export const listByLevel = (level) => items[level] ?? []
export const findProduct = (level, id) => listByLevel(level).find((i) => i.id === id)

// A form stores its product as "level:id", e.g. "product:sku-1000" or "category:cat-snacks".
// Number of products at or beneath an item in the hierarchy.
export const countProducts = (item) => {
  if (!item) return 0
  if (item.level === 'product') return 1
  const lines = item.level === 'line' ? [item] : listByLevel('line').filter((l) => l.parentId === item.id)
  return listByLevel('product').filter((p) => lines.some((l) => l.id === p.parentId)).length
}

export const makeRef = (item) => `${item.level}:${item.id}`
export const resolveRef = (ref) => {
  const [level, id] = (ref ?? '').split(':')
  return level && id ? findProduct(level, id) : undefined
}
