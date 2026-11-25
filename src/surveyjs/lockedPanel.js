import { isPhotoTag } from './photoTag.js'
import { isPriceSurvey } from './priceSurvey.js'

// Panels the designer keeps to exactly their preset questions (Take Photo, Price Survey).
export const isLockedPanel = (element) => isPhotoTag(element) || isPriceSurvey(element)

// True for a locked panel and anything inside it.
export const isInLockedPanel = (element) => {
  for (let el = element; el && !el.isPage; el = el.parent) if (isLockedPanel(el)) return true
  return false
}
