import { useEffect, useRef, useState } from 'react'
import { Action, SvgRegistry } from 'survey-core'
import { CreatorResponsivityManager } from 'survey-creator-core'

// A button at the start of the tab bar that collapses the toolbox to icons and back. The
// Creator compacts the toolbox by itself on narrow screens, so the button only shows when the
// designer is wide enough to have a full toolbox, and only on the Designer tab.

// A window with its left column narrowed (collapse) or widened (expand).
SvgRegistry.registerIcon(
  'icon-toolbox-collapse',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2 4H22V20H2ZM3.5 5.5V18.5H8V5.5ZM9.5 5.5V18.5H20.5V5.5ZM15.5 9 12.5 12 15.5 15 16.56 13.94 14.62 12 16.56 10.06Z"/></svg>',
)
SvgRegistry.registerIcon(
  'icon-toolbox-expand',
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2 4H22V20H2ZM3.5 5.5V18.5H8V5.5ZM9.5 5.5V18.5H20.5V5.5ZM13.5 9 16.5 12 13.5 15 12.44 13.94 14.38 12 12.44 10.06Z"/></svg>',
)

// The Creator's own breakpoint for compacting the toolbox.
const FULL_TOOLBOX_MIN_WIDTH = CreatorResponsivityManager.screenSizeBreakpoints.xl

// Adds the button; returns a function to call with the designer's width.
const addToolboxToggle = (creator) => {
  let collapsed = false
  let wide = false
  const action = new Action({
    id: 'toggle-toolbox',
    showTitle: false,
    visible: false,
    visibleIndex: 0,
    action: () => {
      collapsed = !collapsed
      update()
    },
  })
  const update = () => {
    const force = wide && collapsed
    creator.toolbox.forceCompact = force || undefined
    creator.toolbox.isCompact = force || !wide
    action.visible = wide && creator.activeTab === 'designer'
    action.iconName = collapsed ? 'icon-toolbox-expand' : 'icon-toolbox-collapse'
    action.title = action.tooltip = collapsed ? 'Expand toolbox' : 'Collapse toolbox'
  }
  // First item in the tab bar (before Designer), drawn as a plain button rather than a tab.
  action.component = 'sv-action-bar-item'
  creator.tabbedMenu.actions.splice(0, 0, action)
  creator.onActiveTabChanged.add(update)
  update()
  return (width) => {
    wide = width >= FULL_TOOLBOX_MIN_WIDTH
    update()
  }
}

// Adds the button to the creator; returns a ref for the element whose width decides whether
// it shows.
export const useToolboxToggle = (creator) => {
  const [setWidth] = useState(() => addToolboxToggle(creator))
  const ref = useRef(null)
  useEffect(() => {
    const container = ref.current
    const observer = new ResizeObserver(() => setWidth(container.offsetWidth))
    observer.observe(container)
    return () => observer.disconnect()
  }, [setWidth])
  return ref
}
