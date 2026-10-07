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

## Notes

- Survey Creator needs a commercial licence; without one, it shows a banner.
- The Creator UI (tabs, toolbox, property grid) is configured by `src/config/preset.json`, applied with `UIPreset.applyTo()`.
- The preset includes `file` and `image` questions, which embed base64 content in the schema/answers by default. Use `creator.onUploadFile` to store files externally if payload size matters.