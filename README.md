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
- `/task-types/new`, `/task-types/:id` - task type editor. Picking the **Form** function shows the Survey Creator. **Show payload** previews the request body.

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
- **Toolbox** - Radio Button Group, Rating Scale, Slider, Checkboxes, Dropdown, Yes/No, File Upload, Single-Line Input, Email, Phone Number, Date, Long Text, Single-Select Matrix and Image. Email, Phone Number and Date are custom items: they create a `text` question with `inputType` set to `email`, `tel` or `date`.
- **Property grid** - `autoGenerateProperties: false`, so only the properties listed per class are shown (for example `name`, `title`, `description`, `isRequired` on questions). The `survey` class lists no properties.
- **Options** - designer behaviour. `showSurveyHeader: false` hides the survey title and description on the design surface, because the task type supplies those outside the form. `previewDevice: "androidPhone"` and `previewOrientation: "portrait"` make the Preview tab default to a mobile portrait frame, matching how agents complete forms.
- **Localization** - UI string overrides.

To change which question types or properties are available, edit the preset rather than the component.

### Themes

- **Creator theme** (the designer UI) is fixed to Plain and can't be changed by users.
- **Survey theme** (how the finished form looks when rendered) is separate (`creator.theme`). It isn't part of the saved schema or the payload; the rendering client chooses it.

## Notes

- Survey Creator needs a commercial licence; without one, it shows a banner.
- The preset includes `file` and `image` questions, which embed base64 content in the schema/answers by default. Use `creator.onUploadFile` to store files externally if payload size matters.
- Forms saved before `showSurveyHeader` was disabled may still contain `title`/`description` in their schema.