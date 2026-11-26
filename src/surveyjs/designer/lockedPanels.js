import { isInLockedPanel, isLockedPanel } from '../customQuestions/index.js'

// Locked panels (Custom Questions with locked: true: Take Photo, Price Survey) hold exactly the
// questions their toolbox item created. Authors can still edit those questions' titles, choices
// and other properties, but can't add, remove or rearrange them. The Creator has no setting for
// this, so it is enforced through three of its events.
export const lockedPanels = (creator) => {
  // Fires while something is dragged over the design surface. The drop target is the panel
  // itself (dropping onto it) or the parent of the element dropped beside.
  creator.onDragDropAllow.add((_, options) => {
    const { target, insertBefore, insertAfter } = options
    const container = !insertBefore && !insertAfter && target?.isPanel ? target : target?.parent
    if (isInLockedPanel(container)) options.allow = false
  })

  // Fires when the Creator draws an element's buttons (delete, copy, drag handle, type switch).
  creator.onElementAllowOperations.add((_, options) => {
    // allowEdit: false hides the panel's "Add Question" button (title still editable in the property grid).
    if (isLockedPanel(options.obj)) options.allowEdit = false
    if (!isLockedPanel(options.obj?.parent)) return
    Object.assign(options, { allowDelete: false, allowCopy: false, allowDrag: false, allowDragging: false, allowChangeType: false })
  })

  // Clicking a toolbox item or pasting adds next to the selected question, which could be inside
  // a locked panel. Anything that lands inside one is moved to just after the panel.
  const moveOutOfLockedPanel = (element) => {
    let panel = element.parent
    while (panel && !isLockedPanel(panel)) panel = panel.parent
    if (!panel) return
    element.parent.removeElement(element)
    panel.parent.addElement(element, panel.parent.elements.indexOf(panel) + 1)
    creator.selectElement(element)
  }
  creator.onQuestionAdded.add((_, options) => moveOutOfLockedPanel(options.question))
  creator.onPanelAdded.add((_, options) => moveOutOfLockedPanel(options.panel))
}
