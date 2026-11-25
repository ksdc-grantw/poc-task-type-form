import { Serializer } from 'survey-core'

// Take Photo: a panel holding a Photo and a checkbox list of tags. The designer keeps it to
// exactly those two questions (see FormDesigner.jsx).
if (!Serializer.findProperty('panel', 'photoTag')) {
  Serializer.addProperty('panel', { name: 'photoTag:boolean', default: false, visible: false })
}

export const isPhotoTag = (element) => !!element?.isPanel && !!element.photoTag
