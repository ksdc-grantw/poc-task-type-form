# poc-form-task-type

POC for a `FORM` task type: build a form with SurveyJS Survey Creator when creating a task type, and preview the payload sent to the backend.

Stack: Vite + React (JavaScript) + Tailwind CSS v4 + React Router + SurveyJS Survey Creator 3.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

Live: https://ksdc-grantw.github.io/poc-task-type-form/ - deployed by `.github/workflows/deploy.yml` on every push to `main`.

## Screens

- `/` - task type list (mock backend in `src/api/taskTypes.js`, persisted to `localStorage`).
- `/task-types/new`, `/task-types/:id` - task type editor. Picking the **Form** function shows the Survey Creator. **Show payload** previews the request body. Add `?tab=preview` to open the Creator on its Preview tab.
- `/task-types/:id/preview` - **Open Preview** in the list. Renders the saved form with the SurveyJS Form Library only (`survey-react-ui`, no Creator) inside a phone-sized frame, the way an agent would see it.

## Payload

```json
{
  "name": "Store Audit Form",
  "function": "FORM",
  "status": "ACTIVE",
  "daysPriorToDueDate": 0,
  "daysToExpiry": 0,
  "form": { "version": 1, "surveyjsVersion": "3.2.0", "schema": { "pages": [] } }
}
```

On update (`PUT`), `name` and `function` are omitted because they are locked. `form.version` increments only when the schema changes.

## Form designer (Survey Creator)

The Creator is wrapped in `src/components/FormDesigner.jsx`. Configuration is applied in this order when it is created:

1. **Creator options** passed to `new SurveyCreator({...})`:
   - `collapseOnDrag: true` - collapses elements while dragging.
   - `showCreatorThemeSettings: false` - hides the **Creator Settings** (gear) button, so users can't change the Creator theme.
2. **UI preset** from `src/config/preset.json`, applied with `new UIPreset(preset).applyTo(creator)`.
3. **Creator theme** - `creator.applyCreatorTheme(PlainLight)` (from `survey-core/themes`) fixes the Creator UI to the Plain theme.
4. **Saved schema** - `creator.JSON = initialSchema` when editing an existing form.

### Custom UI preset (`src/config/preset.json`)

A Survey Creator 3 UI preset (the format produced by the SurveyJS UI Preset Editor). It controls:

- **Tabs** - only **Designer** and **Preview**. Logic, JSON editor, translations and themes are hidden.
- **Toolbox** - two categories, separated by a line: **Questions** (Single-Line Input, Long Text, Checkboxes, Radio Button Group, Dropdown, Yes/No) and **Custom** (Number, Photo, Product, Price Check). The custom items show the three ways to extend the toolbox:
  - *Preset items* (Number, Photo) - a toolbox entry with preset JSON for a built-in type. Number creates a `text` question with `inputType: "number"`; its "#" icon is registered with `SvgRegistry` in `FormDesigner.jsx` because the Creator has no built-in number icon.
  - *Specialized question* (Product) - a new type `product` that wraps a dropdown with the (mock) product catalogue as fixed choices. Saved as `{ "type": "product" }`; the answer is the product code.
  - *Composite question* (Price Check) - a new type `pricecheck` that groups product, shelf price, promo price and "price tag correct?" into one question. Saved as `{ "type": "pricecheck" }`; the answer is `{ product, shelfPrice, promoPrice, tagCorrect }`.
  - Product and Price Check are registered with `ComponentCollection` in `src/survey/customQuestions.js`, imported by both the designer and the preview page. Any renderer (e.g. the device app) must register the same definitions, or those questions are skipped.
  - Photo is a custom `file` question preset to images (`acceptedCategories: ["image"]`) with `sourceType: "file-camera"`, so the agent can pick from the gallery or use the camera; `sourceType` can be changed to `file` or `camera` in the property grid. Photo questions also carry `photoOnly: true`, a custom property registered in `src/survey/photoOnly.js` (imported by both the designer and the preview page); for these questions the accepted file categories/types are hidden in the property grid (`creator.onPropertyShowing`) so they stay images only. Any renderer must register `photoOnly` too (`Serializer.addProperty`).
- **Property grid** - `autoGenerateProperties: false`, so only the properties listed per class are shown:
  - Questions: `name`, `title`, `description`, `isRequired` plus type-specific properties such as `placeholder`, `choices`, `sourceType`.
  - Survey settings: no properties are exposed.
  - Conditional logic (`visibleIf`, `requiredIf`, ...) is deliberately not exposed.
- **Options** - designer behaviour. `showSurveyHeader: false` hides the survey title and description on the design surface, because the task type supplies those outside the form. `previewDevice: "androidPhone"` and `previewOrientation: "portrait"` make the Preview tab default to a mobile portrait frame, matching how agents complete forms.
- **Localization** - UI string overrides.

To change which question types or properties are available, edit the preset rather than the component.

### Themes

- **Creator theme** (the designer UI) is fixed to Plain and can't be changed by users.
- **Survey theme** (how the finished form looks when rendered) is separate (`creator.theme`). It isn't part of the saved schema or the payload; the rendering client chooses it.

## Notes

- Survey Creator needs a commercial licence; without one, it shows a banner.
- File Upload and Photo questions store uploaded files as base64 in the answers by default. Use `creator.onUploadFile` (and the equivalent on the rendering side) to store files externally if payload size matters.
- Forms saved before `showSurveyHeader` was disabled may still contain `title`/`description` in their schema.