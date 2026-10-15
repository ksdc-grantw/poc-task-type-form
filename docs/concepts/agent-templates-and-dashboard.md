# Agent Templates and Work Events Dashboard (POC)

Builds on [Ad hoc Work Events](./ad-hoc-work-events.md), which describes the idea and the decisions. This document covers what was built to demonstrate it, how it works, and where it could go next.

## What was built

Two new screens, added beside the existing Task Types screens. Task Types were not changed.

| Screen | Route | Purpose |
|---|---|---|
| Agent Templates list | `/agent-templates` | The templates an Agent can start without an assigned Task, with **Open Preview** and **Edit** |
| Template preview | `/agent-templates/:id/preview` | The form in a phone-sized frame, as the Agent sees it on the device |
| Template editor | `/agent-templates/:id` | Edit name, description and form in the SurveyJS designer |
| Dashboard | `/agent-templates/dashboard` | Charts and a table of mock Work Events, filterable by template, site, agent and date |

Form.io is still in the codebase, but its tab is disabled so the POC reads as SurveyJS only (the direct `/formio` URL still works).

## Agent Templates

- A new "table" (mock backend in `localStorage`, key `poc.agentTemplates.v1`), separate from Task Types.
- Shape: `{ id, name, description, form: { version, engine, schema } }`.
- IDs are stable (e.g. `tpl-returns-bay`) and never derived from the name, so a rename does not break links from Work Events.
- The form version increments only when the schema changes, as with Task Types.
- Five seeded templates, each with at most three questions, always including photos:

| Template | Questions |
|---|---|
| Returns bay | fullness, comments, photos |
| Pallet bay / backroom tidy | comments, photos |
| New flyer or promotion spotted | promo name, comments, photos |
| Stock issue | issue type, comments, photos |
| General observation | comments, photos |

- The designer and the preview are reused from the SurveyJS engine (`src/surveyjs/FormDesigner.jsx`, plus the same photo-only question), so the Agent form and the Task Type forms behave the same.

Code: `src/agentTemplates/` (`seed.js`, `api.js`, `AgentTemplateList.jsx`, `AgentTemplateEditor.jsx`, `AgentTemplatePreview.jsx`, `AgentTemplatesApp.jsx`).

## Work Events (mock)

`src/agentTemplates/workEventApi.js` generates 10 to 15 Work Events per template (62 in total), deterministically, so the data is the same on every load. Roughly three per template are from today, and the rest are spread over the last 14 days.

Each event stores the Event Context next to the answers:

```json
{
  "id": "we-tpl-returns-bay-1",
  "templateId": "tpl-returns-bay",
  "formVersion": 1,
  "userId": "u-101",
  "lat": -26.10757,
  "long": 28.05607,
  "capturedAt": "2026-10-15T08:14:00.000Z",
  "data": { "fullness": "Full", "comments": "...", "photos": [{ "name": "photo-1.svg", "type": "image/svg+xml", "content": "data:..." }] }
}
```

`data` is plain SurveyJS answer JSON. Photos are tiny inline SVGs standing in for captured images.

The mock "server" resolves each event before it is shown, as the concept describes:

- `userId` is resolved to a name (six mock Agents).
- `lat`/`long` is matched against five mock sites (stores, a warehouse, HQ) using a 300 m geofence. Anything outside returns "Unknown location". The raw coordinates are kept, so geofences can change and history can be re-matched.

## The dashboard

The SurveyJS Dashboard is the `survey-analytics` package. It has no ready-made component: it is vanilla JS that draws into a DOM element. The page uses one class, `VisualizationPanel`:

```js
const survey = new Model(template.form.schema)            // survey-core
const panel = new VisualizationPanel(
  survey.getAllQuestions(),                               // what to chart
  events.map((e) => e.data),                              // the answers
  { allowHideQuestions: false },
)
panel.render(element)                                     // draw into a div
panel.clear()                                             // on unmount
```

In React this lives in an effect in `Dashboard.jsx` (the `Charts` component). Chart types are picked from the question type:

| Question | Default visualisation |
|---|---|
| radiogroup / dropdown | bar chart (switchable to pie, doughnut, etc.) |
| comment / text | word cloud |
| file (photo) | none, so photos are shown as thumbnails in the table |

### Filtering

Agent, site and date are not form answers, so the panel cannot chart them. The page filters the Work Events first (Template, Site, Agent and Date dropdowns), then passes only the matching answers to the panel, which recomputes. The heading shows "5 of 14 Work Events". The filters are dropdowns because the number of templates, sites and agents is unbounded in real use. The Site and Agent lists are built from the data.

### Notes

- The library shows a "developer license required" banner until a SurveyJS license key is set.
- The Chart.js build is the default. Plotly and ApexCharts builds exist.
- The Tabulator build (`survey-analytics/survey.analytics.tabulator`) could replace the hand-built events table.

## Out of POC scope

- No real submission from a device. The mock events stand in for what the device app would send.
- No backend, auth or storage. Everything is `localStorage` or generated in memory.
- No offline handling, photo size limits or upload.
- Templates are not synced to a device.
- Task Types, Tasks and appointments are unchanged.

## Possible improvements

### Dashboard
- **Tabulator table** with sortable and filterable columns, plus Agent and Site merged into the row data.
- **Cross-filtering and date filtering** using the library's built-in features instead of the custom dropdowns.
- **Server-side filtering** (`GET /work-events?templateId=&siteId=&from=&to=`) so the browser only receives matching answers.
- **Saved views** and a "completed today" summary across all templates.
- **Map view** of Work Events by lat/long.
- **Real photo display** with a full-size viewer, once photos are stored as files and not inline data.
- **Export** to CSV or to the BI system.

### Templates
- **Admin-managed Templates** in the Task Management web app at company context level, synced to devices, reusing the Task Type designer.
- **Template status** (active or inactive), mirroring Task Types, so a Template can be retired without deleting history.
- **Template categories** or ordering, so the Agent's list stays usable as it grows.
- **Per-Template permissions** (which Agents or roles can start which Template).
- **Form version history** so older Work Events can be rendered against the version they were filled in on.

### Work Events and data
- **Geofence matching on the real server**, with customer locations owned by the platform, and re-matching when geofences change.
- **Unknown locations** flagged for review.
- **Event Context extensions**, such as device ID and app version.
- **Destination decision**: Task Management under a new data type, versus the BI system directly (see the concept document).
- **Linking to an appointment** if the design team later wants it, inferred by matching Agent, time and location.

### Workflow
- **Team leader notifications** (instant or digest) for selected Templates.
- **Convert a Work Event into a Task**, assigned to someone for follow-up.
- **Comments or acknowledgement** on a Work Event.
- **Offline capture and queued upload**, with photo compression and limits.
- **Retention rules** for photos and events.

## Open questions

These carry over from the concept document and are not answered by this POC:

- Instant notification or dashboard only?
- Who can create Templates beyond developers?
- Offline and photo size limits?
- Where do Work Events live: BI, or Task Management under a new data type?
