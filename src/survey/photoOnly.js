import { Serializer } from 'survey-core'

// Marks a file question created from the "Photo" toolbox item. The flag is saved in the
// schema so renderers can recognise photo fields; any renderer must register it too.
if (!Serializer.findProperty('file', 'photoOnly')) {
  Serializer.addProperty('file', { name: 'photoOnly:boolean', default: false, visible: false })
}