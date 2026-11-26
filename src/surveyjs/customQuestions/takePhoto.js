import { defineCustomQuestion } from './defineCustomQuestion.js'

const TAGS = [
  { value: 'sf', text: 'Good shelf space' },
  { value: 'item2', text: 'Bad shelf space' },
  { value: 'item3', text: 'No stock' },
  { value: 'item4', text: 'Not ranged in store' },
  { value: 'item5', text: 'Category not sold in store' },
  { value: 'item6', text: 'Promotion – own product' },
  { value: 'item7', text: 'Promotion – competitor product' },
  { value: 'item8', text: 'New product – own product' },
  { value: 'item9', text: 'New product – competitor product' },
]

// Take Photo: a locked panel holding a Photo and a checkbox list of tags.
export default defineCustomQuestion({
  name: 'phototag',
  title: 'Take Photo',
  // A camera with a tag.
  icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2 5H6L7.5 3H12.5L14 5H18V11H16.5V6.5H3.5V13.5H11V15H2ZM10 7A2.5 2.5 0 1 1 10 12A2.5 2.5 0 1 1 10 7Z"/><path fill-rule="evenodd" d="M12.5 12.5H18L22 17L18 21.5H12.5ZM17 16A1 1 0 1 0 17 18A1 1 0 1 0 17 16Z"/></svg>',
  marker: { on: 'panel', name: 'photoTag' },
  locked: true,
  json: {
    type: 'panel',
    title: 'Take Photo',
    photoTag: true,
    elements: [
      {
        type: 'file',
        name: 'photo',
        title: 'Photo',
        photoOnly: true,
        acceptedCategories: ['image'],
        sourceType: 'file-camera',
        allowMultiple: true,
        maxFiles: 5,
      },
      { type: 'checkbox', name: 'tags', title: 'Tags', choices: TAGS },
    ],
  },
})
