// Question names. A question's name is the key its answer is saved under, and reports use it,
// so a name must never change or be reused. The Creator's default (question1, question2, ...)
// reuses the lowest free number after a delete, which would let reports confuse an old
// question with a new one. So every question gets a random ID (e.g. q_8f3k2a9x) when it is
// added. Authors never see it: the name field is hidden in the preset's property grid.

// Without a title the form would show the random name.
const DEFAULT_TITLE = 'Enter question title'

const newQuestionName = (taken) => {
  let name
  do {
    name = `q_${Math.random().toString(36).slice(2, 10).padEnd(8, '0')}`
  } while (taken.has(name))
  return name
}

// When a dynamic panel is added or copied, the Creator renames every question in its template
// (using getNewQuestionName, so they get random IDs too) and updates expressions, but not the
// "{panel.name}" references in the panel titles. newQuestionChangedNames (old -> new) is internal
// to the Creator; if it goes away, the titles keep the old names.
const updateTemplateTitles = (creator, question) => {
  const renamed = creator.newQuestionChangedNames
  if (question.getType() !== 'paneldynamic' || !renamed) return
  const rename = (text) =>
    text && text.replace(/\{panel\.([^}.[]+)/g, (match, name) => (renamed[name] ? `{panel.${renamed[name]}` : match))
  question.templateTitle = rename(question.templateTitle)
  question.templateTabTitle = rename(question.templateTabTitle)
}

export const questionNames = (creator) => {
  // The Creator calls this to name questions it creates inside others: those nested in a
  // toolbox item (e.g. Take Photo's Photo) or in a copied panel.
  creator.getNewQuestionName = () =>
    newQuestionName(new Set([...creator.getAllQuestions(), ...creator.getAllPanels()].map((el) => el.name)))

  // Fires for every question added to the design surface (from the toolbox, pasted, copied or
  // converted to another type). Converting keeps its name; every other way gets a new ID, so
  // copies don't share their original's name.
  creator.onQuestionAdded.add((sender, options) => {
    if (options.reason === 'ELEMENT_CONVERTED') return
    const question = options.question
    const taken = new Set(sender.survey.getAllQuestions().map((q) => q.name))
    question.name = newQuestionName(taken)
    // Copies keep their copied title.
    const isCopy = options.reason === 'ELEMENT_COPIED'
    if (!isCopy && !question.locTitle.getJson()) question.title = DEFAULT_TITLE
    updateTemplateTitles(sender, question)
  })
}
