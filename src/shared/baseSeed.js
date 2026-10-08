// Non-FORM seed task types, identical for every form engine.
export const BASE_SEED = [
  {
    id: 1,
    name: 'Fridge Compliance Survey',
    function: 'PDF',
    status: 'ACTIVE',
    daysPriorToDueDate: 2,
    daysToExpiry: 3,
    attachment: { fileName: 'fridge-compliance.pdf', size: 482113 },
  },
  {
    id: 2,
    name: 'Shelf Photo',
    function: 'PHOTO',
    status: 'ACTIVE',
    daysPriorToDueDate: 0,
    daysToExpiry: 1,
  },
  {
    id: 3,
    name: 'Save Location',
    function: 'LOCATION',
    status: 'ACTIVE',
    daysPriorToDueDate: 0,
    daysToExpiry: 7,
  },
  {
    id: 4,
    name: 'Order Pad',
    function: 'ORDPAD',
    status: 'INACTIVE',
    daysPriorToDueDate: 1,
    daysToExpiry: 2,
  },
]
