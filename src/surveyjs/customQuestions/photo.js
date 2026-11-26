import { defineCustomQuestion } from './defineCustomQuestion.js'

// Photo: a file question limited to images, from the gallery or camera. photoOnly lets
// renderers recognise photo fields.
export default defineCustomQuestion({
  name: 'photo',
  title: 'Photo',
  iconName: 'icon-toolbox-image-24x24',
  marker: { on: 'file', name: 'photoOnly' },
  // Applies to every file question; they are all Photos.
  displayNames: { maxFiles: 'Maximum photos' },
  json: {
    type: 'file',
    photoOnly: true,
    acceptedCategories: ['image'],
    sourceType: 'file-camera',
    maxFiles: 5,
  },
})
