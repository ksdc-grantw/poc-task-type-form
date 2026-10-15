const comments = (title = 'Comments') => ({ type: 'comment', name: 'comments', title, rows: 3 })
const photos = (title = 'Photos') => ({
  type: 'file',
  name: 'photos',
  title,
  photoOnly: true,
  acceptedCategories: ['image'],
  allowMultiple: true,
})

const template = (id, name, description, elements) => ({
  id,
  name,
  description,
  form: {
    version: 1,
    engine: 'surveyjs',
    schema: { pages: [{ name: 'page1', elements }] },
  },
})

// IDs are stable and never derived from the name, so Work Events keep resolving
// to their Template after a rename.
export const SEED = [
  template('tpl-returns-bay', 'Returns bay', 'The returns bay or returns pallet needs attention.', [
    { type: 'radiogroup', name: 'fullness', title: 'How full is the returns bay?', choices: ['Nearly full', 'Full', 'Overflowing'] },
    comments(),
    photos(),
  ]),
  template('tpl-pallet-bay', 'Pallet bay / backroom tidy', 'A pallet bay or backroom is messy.', [comments('What needs tidying?'), photos()]),
  template('tpl-new-flyer', 'New flyer or promotion spotted', 'A flyer or promotion the team may not have seen.', [
    { type: 'text', name: 'promoName', title: 'Promotion name (if known)' },
    comments('Details'),
    photos('Photos of the flyer'),
  ]),
  template('tpl-stock-issue', 'Stock issue', 'Out of stock, damaged or missing stock.', [
    { type: 'radiogroup', name: 'issueType', title: 'Issue type', choices: ['Out of stock', 'Damaged', 'Expired', 'Other'] },
    comments('Which products?'),
    photos(),
  ]),
  template('tpl-general-observation', 'General observation', 'Anything else worth reporting.', [comments('What did you see?'), photos()]),
]
