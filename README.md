# poc-form-task-type

POC for a `FORM` task type: build a form with SurveyJS Survey Creator when creating a task type, and preview the payload sent to the backend.

Stack: Vite + React (JavaScript) + Tailwind CSS v4 + React Router + SurveyJS Survey Creator 3.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

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
- The toolbox is limited to question types that don't embed base64 content (no image, image picker, file or signature).