// The INSTRUCTION function has one fixed, versioned form containing every response. It is created
// once with the Task Type and never changes. When a Task is created, the admin writes the
// instruction text and picks the response(s); the Task stores only that (`instruction: { text,
// variables }`), not a form. A response that was not picked is hidden and not required: the
// elements switch on the `show<Response>` variables, which the renderer sets from the Task.
export const RESPONSE_TYPES = {
  done: { label: 'Done (yes/no)', variable: 'showDone' },
  text: { label: 'Text', variable: 'showText' },
  photo: { label: 'Photo', variable: 'showPhoto' },
}

const gated = (key, element) => {
  const condition = `{${RESPONSE_TYPES[key].variable}} = true`
  return { ...element, visibleIf: condition, requiredIf: condition }
}

export const buildInstructionForm = () => ({
  version: 1,
  engine: 'surveyjs',
  schema: {
    pages: [
      {
        name: 'page1',
        elements: [
          gated('done', { type: 'boolean', name: 'done', title: 'Task done?' }),
          gated('text', { type: 'comment', name: 'text', title: 'Response' }),
          gated('photo', {
            type: 'file',
            name: 'photos',
            title: 'Photos',
            allowMultiple: true,
            photoOnly: true,
            acceptedCategories: ['image'],
            sourceType: 'file-camera',
          }),
        ],
      },
    ],
  },
})

// The survey variables a renderer sets for a Task's chosen responses.
export const responseVariables = (responses = []) =>
  Object.fromEntries(Object.entries(RESPONSE_TYPES).map(([key, { variable }]) => [variable, responses.includes(key)]))
