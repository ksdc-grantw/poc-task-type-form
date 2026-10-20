// The INSTRUCTION function has no designed form. When a Task is created, the admin writes an
// instruction and picks the response(s) the agent must give; the Task gets its own form with
// the instruction at the root (beside the reserved survey title/description). All responses
// are required.
export const RESPONSE_TYPES = {
  done: { label: 'Done (yes/no)', element: { type: 'boolean', name: 'done', title: 'Task done?' } },
  text: { label: 'Text', element: { type: 'comment', name: 'text', title: 'Response' } },
  photo: {
    label: 'Photo',
    element: {
      type: 'file',
      name: 'photos',
      title: 'Photos',
      allowMultiple: true,
      photoOnly: true,
      acceptedCategories: ['image'],
      sourceType: 'file-camera',
    },
  },
}

export const buildInstructionForm = (instruction, responses) => ({
  instruction,
  pages: [
    {
      name: 'page1',
      elements: Object.keys(RESPONSE_TYPES)
        .filter((key) => responses.includes(key))
        .map((key) => ({ ...RESPONSE_TYPES[key].element, isRequired: true })),
    },
  ],
})
