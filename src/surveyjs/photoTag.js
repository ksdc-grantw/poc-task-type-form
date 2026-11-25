import { Serializer } from 'survey-core'

// Take Photo: a panel holding a Photo and a checkbox list of tags. The designer keeps it to
// exactly those two questions (see FormDesigner.jsx).
if (!Serializer.findProperty('panel', 'photoTag')) {
  Serializer.addProperty('panel', { name: 'photoTag:boolean', default: false, visible: false })
}

export const isPhotoTag = (element) => !!element?.isPanel && !!element.photoTag

// True for the Take Photo panel and anything inside it.
export const isInPhotoTag = (element) => {
  for (let el = element; el && !el.isPage; el = el.parent) if (isPhotoTag(el)) return true
  return false
}
