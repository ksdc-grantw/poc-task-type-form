import { readTemplates } from './api.js'

// Deterministic PRNG so the mock data is the same on every load.
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const AGENTS = [
  { id: 'u-101', name: 'Thandi Mokoena' },
  { id: 'u-102', name: 'Pieter van Wyk' },
  { id: 'u-103', name: 'Naledi Dlamini' },
  { id: 'u-104', name: 'Sipho Khumalo' },
  { id: 'u-105', name: 'Aisha Patel' },
  { id: 'u-106', name: 'Johan Botha' },
]

// Mock customer locations; the server would match a Work Event's lat/long to these geofences.
const SITES = [
  { name: 'Store - Sandton', lat: -26.1076, long: 28.0567 },
  { name: 'Store - Rosebank', lat: -26.1467, long: 28.0436 },
  { name: 'Store - Menlyn', lat: -25.7833, long: 28.2766 },
  { name: 'Warehouse - Midrand', lat: -25.9992, long: 28.1263 },
  { name: 'HQ - Centurion', lat: -25.8603, long: 28.1894 },
]
const GEOFENCE_METRES = 300

const COMMENTS = {
  'tpl-returns-bay': ['Returns pallet is stacked above shoulder height.', 'Bay is blocking the fire exit.', 'Mixed stock, nothing sorted.', 'Collection is overdue by two days.'],
  'tpl-pallet-bay': ['Empty pallets piled up at the back door.', 'Boxes on the floor, trip hazard.', 'Backroom shelves are disorganised.', 'Cleaned up half, needs a second pass.'],
  'tpl-new-flyer': ['Not on our promo calendar.', 'Competitor price match on the flyer.', 'Flyer is on the front door, staff were unaware.', 'Same promo as last month but different price.'],
  'tpl-stock-issue': ['Top three lines gone by midday.', 'Cartons crushed in transit.', 'Shelf is empty, backroom has stock.', 'Short-dated product still on the shelf.'],
  'tpl-general-observation': ['Fridge door left open.', 'New signage up at the entrance.', 'Queue at tills was very long.', 'Staff doing a great job on the display.'],
}
const PROMO_NAMES = ['Summer Fizz', '2 for R30', 'Back to School', 'Weekend Special', '']

// A tiny inline SVG stands in for a captured photo.
function placeholderPhoto(label, hue, index) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="hsl(${hue} 40% 80%)"/><text x="80" y="64" font-family="sans-serif" font-size="12" text-anchor="middle" fill="hsl(${hue} 40% 25%)">${label}</text></svg>`
  return { name: `photo-${index + 1}.svg`, type: 'image/svg+xml', content: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` }
}

const pick = (rand, list) => list[Math.floor(rand() * list.length)]

function answerFor(rand, template, question, hue) {
  switch (question.type) {
    case 'radiogroup':
      return pick(rand, question.choices)
    case 'comment':
      return pick(rand, COMMENTS[template.id])
    case 'text':
      return pick(rand, PROMO_NAMES) || undefined
    case 'file':
      return Array.from({ length: 1 + Math.floor(rand() * 3) }, (_, i) => placeholderPhoto(template.name, hue, i))
    default:
      return undefined
  }
}

function buildEvents(now, templates) {
  const events = []
  templates.forEach((template, templateIndex) => {
    const rand = mulberry32(1000 + templateIndex)
    const count = 10 + Math.floor(rand() * 6)
    for (let i = 0; i < count; i++) {
      const agent = pick(rand, AGENTS)
      const site = pick(rand, SITES)
      const ageMinutes = i < 3 ? Math.floor(rand() * 8 * 60) : Math.floor(rand() * 14 * 24 * 60)
      const data = {}
      for (const q of template.form.schema.pages.flatMap((p) => p.elements)) {
        const value = answerFor(rand, template, q, (templateIndex * 70) % 360)
        if (value !== undefined) data[q.name] = value
      }
      events.push({
        id: `we-${template.id}-${i + 1}`,
        templateId: template.id,
        formVersion: template.form.version,
        userId: agent.id,
        lat: site.lat + (rand() - 0.5) * 0.002,
        long: site.long + (rand() - 0.5) * 0.002,
        capturedAt: new Date(now - ageMinutes * 60_000).toISOString(),
        data,
      })
    }
  })
  return events.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))
}

const metres = (lat1, long1, lat2, long2) => {
  const rad = Math.PI / 180
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((long2 - long1) * rad) / 2) ** 2
  return 2 * 6371000 * Math.asin(Math.sqrt(a))
}

// What the server does before presenting an event: user id -> name, lat/long -> site.
function resolve(event) {
  const agent = AGENTS.find((a) => a.id === event.userId)
  const site = SITES.find((s) => metres(event.lat, event.long, s.lat, s.long) <= GEOFENCE_METRES)
  return { ...event, userName: agent?.name ?? event.userId, siteName: site?.name ?? 'Unknown location' }
}

// Events are generated from whatever templates currently exist.
export const workEventApi = {
  async list() {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return buildEvents(Date.now(), readTemplates()).map(resolve)
  },
}
