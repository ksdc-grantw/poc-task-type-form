# poc-form-task-type

POC for a `FORM` task type: build a form with SurveyJS Survey Creator when creating a task type, and preview the payload sent to the backend.

Stack: Vite + React (JavaScript) + Tailwind CSS v4 + React Router + SurveyJS Survey Creator 3.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

Live POC: https://ksdc-grantw.github.io/poc-task-type-form/ - deployed by `.github/workflows/deploy.yml` on every push to `main`.

## Project structure

The app is split so a second form engine (e.g. Form.io) can sit beside SurveyJS without sharing data:

- `src/shared/` - engine-agnostic: task type list and editor, the mock backend factory (`createTaskTypeApi`), constants, and the engine context. The form definition (`form.schema`) is opaque here.
- `src/surveyjs/` - everything SurveyJS: `engine.js` (the adapter: API instance, lazy designer and preview, `countQuestions`, `buildForm`), the designer, preview, preset, custom questions and seed data.
- `src/App.jsx` - header with one tab per engine; each engine is lazy-loaded under its own path.

An engine is an object with `id`, `label`, `basePath`, `api`, `FormDesigner`, `FormPreview`, `countQuestions(schema)` and `buildForm(prevForm, schema)`. Each engine has its own `localStorage` key and seed data.

## Screens

Agent Templates and the Work Events dashboard (concept: `docs/concepts/ad-hoc-work-events.md`, implementation: `docs/concepts/agent-templates-and-dashboard.md`):

- `/agent-templates` - list of Agent Templates, with Open Preview and Edit. Code in `src/agentTemplates/`.
- `/agent-templates/dashboard` - SurveyJS Dashboard (`survey-analytics`) of mock Work Events with Template, Site, Agent and Date filters.

Under the engine base path (`/surveyjs`; `/` redirects there):

- `/surveyjs` - task type list (mock backend from `src/shared/createTaskTypeApi.js`, persisted to `localStorage`).
- `/surveyjs/task-types/new`, `/surveyjs/task-types/:id` - task type editor. Picking the **Form** function shows the Survey Creator. **Show payload** previews the request body. Add `?tab=preview` to open the Creator on its Preview tab.
- `/surveyjs/task-types/:id/preview` - **Open Preview** in the list. Renders the saved form with the SurveyJS Form Library only (`survey-react-ui`, no Creator) inside a phone-sized frame, the way an agent would see it.

## Task payloads

On `/tasks/new` and `/tasks/:id`, **Show payload** displays two display-only JSON views (nothing is sent anywhere): the stored Task (`POST /tasks` while creating, the saved record afterwards), and what an external system would receive. The external payload is self-contained: task id and creation time, the Task Type (`id`, `name`, `function`, `status`), the form (`engine`, `version`, opaque `schema`) and, for Instruction tasks, the instruction. Tasks carry no products: products are chosen only on the Task Type, by the questions that use them. Both are built in `src/tasks/taskPayloads.js`.

## Payload

```json
{
  "name": "Store Audit Form",
  "function": "FORM",
  "status": "ACTIVE",
  "daysPriorToDueDate": 0,
  "daysToExpiry": 0,
  "form": { "version": 1, "engine": "surveyjs", "surveyjsVersion": "3.2.0", "schema": { "pages": [] } }
}
```

On update (`PUT`), `name` and `function` are omitted because they are locked. `form.version` increments only when the schema changes.

## Form designer (Survey Creator)

Where to make a change (preset, Custom Question Definition or designer behaviour) and the steps for each: `docs/agents/form-designer.md`.

`src/surveyjs/FormDesigner.jsx` is only the React host: it creates the Creator once, reports every change through `onChange` and shows the product picker. The Creator itself is built by `createDesigner()` in `src/surveyjs/designer/createDesigner.js`, which reads top to bottom as the recipe. Each rule it adds is its own commented module in `src/surveyjs/designer/`:

| Module | What it does |
|---|---|
| `createDesigner.js` | The recipe: Creator options, UI preset, theme, schema, then the rules below. |
| `designerOnlyOptions.js` | Settings applied only while designing and stripped before saving. |
| `questionNames.js` | Random, never-reused question names and the default title (see Question names). |
| `lockedPanels.js` | Keeps Take Photo and Price Survey to exactly their questions. |
| `productButtons.js` | The property-grid buttons that open the product picker. |
| `toolboxToggle.js` | The Collapse / Expand toolbox button (`useToolboxToggle` hook). |

`createDesigner()` applies, in order:

1. **Creator options** passed to `new SurveyCreator({...})`:
   - `collapseOnDrag: true` - collapses elements while dragging.
   - `showCreatorThemeSettings: false` - hides the **Creator Settings** (gear) button, so users can't change the Creator theme.
2. **UI preset** from `src/surveyjs/preset.json` plus the Custom Questions, applied with `new UIPreset(withCustomQuestions(preset)).applyTo(creator)`.
3. **Creator theme** - `creator.applyCreatorTheme(PlainLight)` (from `survey-core/themes`) fixes the Creator UI to the Plain theme.
4. **Saved schema** - `creator.JSON = withDesignerOnlyOptions(schema)`.
   The design surface is made to fill the available width (closing the property grid widens it) with `widthMode: "responsive"`. It is one of the designer-only options (`designer/designerOnlyOptions.js`): added to the form JSON when the designer loads and removed from the JSON passed to `onChange`, so it is never saved.
5. **Rules** - question names, locked panels and product buttons, each subscribing to Creator events.
6. **Initial tab** - e.g. Preview when opened from "Open Preview".

A **Collapse toolbox / Expand toolbox** button at the start of the designer's tab bar (before **Designer**) switches the toolbox between full and icons-only (`creator.toolbox.forceCompact`, `designer/toolboxToggle.js`). It only shows when the designer is at least 1500px wide; below that the Creator always shows the icons-only toolbox.

### Custom UI preset (`src/surveyjs/preset.json`)

A Survey Creator 3 UI preset (the format produced by the SurveyJS UI Preset Editor). It controls:

- **Tabs** - only **Designer** and **Preview**. Logic, JSON editor, translations and themes are hidden.
- **Toolbox** - two categories, separated by a line: **Questions** (Single-Line Input, Long Text, Checkboxes, Radio Button Group, Dropdown, Yes/No, Rating) and **Custom** (Number, Photo, Merchandising Survey, Dynamic Merchandising Survey, Shopper Questionnaire, Take Photo, Price Survey). `toolbox.categories` in the preset sets the order and category of every item.
  - *Number* - a toolbox entry in the preset that creates a `text` question with `inputType: "number"`; its "#" icon is registered with `SvgRegistry` in `src/surveyjs/designer/createDesigner.js` because the Creator has no built-in number icon.
  - *Custom Questions* (Photo, Merchandising Survey, Dynamic Merchandising Survey, Shopper Questionnaire, Take Photo, Price Survey) - each is one Custom Question Definition in `src/surveyjs/customQuestions/<type>.js`, declaring its toolbox entry (title, icon, JSON), its hidden marker property, whether it is locked, its Products property and any property display names. The registry, `src/surveyjs/customQuestions/index.js`, adds their toolbox entries to the preset (`withCustomQuestions(preset)`) and throws if a toolbox category names an item that isn't defined. To add one, write a definition, add it to the registry's list and add its name to a toolbox category.
  - Importing `src/surveyjs/customQuestions/index.js` registers the custom properties the saved forms use (`photoOnly`, `merchSurvey`/`merchProductRefs`, `shopperQuestionnaire`/`shopperProductRefs`, `photoTag`, `priceSurvey`). The designer and the preview pages import it; any renderer (e.g. the device app) must register the same properties.
  - *Products* - only the Merchandising Surveys, the Shopper Questionnaire and the Price Survey relate to products, and only at design time (**Products** in the property grid, plus the "Select products" icon beside a dropdown's Choices). The chosen products are written into the form JSON as rows or choices (value = product id, text = description); each definition's Products spec says how (the Merchandising Survey matrices share `customQuestions/merchProducts.js`). There is no product step when creating a Task.
  - Photo is a custom `file` question preset to images (`acceptedCategories: ["image"]`) with `sourceType: "file-camera"`, so the agent can pick from the gallery or use the camera; `sourceType` can be changed to `file` or `camera` in the property grid. Photo questions also carry `photoOnly: true` so renderers can recognise photo fields. The accepted file types and maximum size are not in the property grid, so Photo stays images only.
  - *Take Photo* - a `panel` (`photoTag: true`) holding a Photo and a "Tags" checkbox list. It is locked (`locked: true` in its definition), so the designer keeps it to exactly those two questions (`src/surveyjs/designer/lockedPanels.js`): nothing can be dropped into it, its "Add Question" button is hidden, a question added while one of its questions is selected goes just after the panel, and its two questions can't be deleted, copied, dragged out or converted. Their titles, choices and other properties can still be edited.
  - *Price Survey* - a `panel` (`priceSurvey: true`) holding a **Price Survey** matrix (one row per chosen product: shelf price, Unit/Shrink price, promotion tick) and a **Capture Housebrand Pricing Information** dynamic matrix (the agent adds a row per housebrand, picked from a fixed list of housebrands, with the same three columns). Only the Price Survey matrix carries `merchSurvey: true`, so it alone has **Products** in the property grid. It is locked like Take Photo.
  - **Property grid** - `autoGenerateProperties: false`, so only the properties listed per class are shown. Kept deliberately small for non-technical users:
  - Questions: `title`, `description`, `isRequired` plus type-specific properties such as `placeholder`, `choices`, `sourceType`. `name` is deliberately not shown (see Question names below).
    - Single-Line Input and Number: `placeholder`, `min`, `max` (min/max only show for Number). `inputType` and `step` are hidden.
    - Dynamic Merchandising Survey and Shopper Questionnaire: **Products**, **Minimum products** and **Maximum products** (`minRowCount`/`maxRowCount`, `minPanelCount`/`maxPanelCount`, renamed by their definitions' `displayNames`).
        - Photo: `sourceType`, `allowMultiple` and **Maximum photos** (`maxFiles`, renamed by the Photo definition; only shown when multiple photos are allowed; new Photos default to 5).
  - Rating questions always use labels: `rateType` is preset to `"labels"`, not in the property grid, and the rate type switcher on the design surface is hidden (`creator.onElementAllowOperations` in `src/surveyjs/FormDesigner.jsx`).
  - Survey settings: no properties are exposed.
  - Conditional logic (`visibleIf`, `requiredIf`, ...) is deliberately not exposed.
- **Options** - designer behaviour. `showSurveyHeader: false` hides the survey title and description on the design surface, because the task type supplies those outside the form. `previewDevice: "androidPhone"` and `previewOrientation: "portrait"` make the Preview tab default to a mobile portrait frame, matching how agents complete forms. `maxChoiceContentNestingLevel: 0` removes the "expand nested choices" button, so Checkboxes and Radio Button Group choices can't hold nested questions.
- **Localization** - UI string overrides.

To change which question types or properties are available, edit the preset rather than the component.

### Question names

Each question's `name` is the key its answer is stored under, and reports use it, so it must never change or be reused. Form authors can't see or edit it. `src/surveyjs/designer/questionNames.js` assigns a random ID (e.g. `q_8f3k2a9x`) when a question is added (`creator.onQuestionAdded`), including duplicates, and keeps the name when a question's type is converted. New questions also get the placeholder title "Enter question title" (otherwise the form would show the random name); duplicates keep their copied title. The designer's default (`question1`, `question2`, ...) is not used because it reuses the lowest free number after a delete. Names are unreadable on purpose: reports take labels and types from the form JSON saved with the task type. Existing seed forms keep their old names. Questions inside a dynamic panel (e.g. Shopper Questionnaire) get random IDs too.

### Themes

- **Creator theme** (the designer UI) is fixed to Plain and can't be changed by users.
- **Survey theme** (how the finished form looks when rendered) is separate (`creator.theme`). It isn't part of the saved schema or the payload; the rendering client chooses it.

## Notes

- Survey Creator needs a commercial licence; without one, it shows a banner.
- File Upload and Photo questions store uploaded files as base64 in the answers by default. Use `creator.onUploadFile` (and the equivalent on the rendering side) to store files externally if payload size matters.
- Forms saved before `showSurveyHeader` was disabled may still contain `title`/`description` in their schema.