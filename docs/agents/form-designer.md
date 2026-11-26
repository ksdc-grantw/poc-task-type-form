# Changing the SurveyJS form designer

The designer is a SurveyJS Creator narrowed for non-technical form authors. It is built from three layers, each the single home for one kind of change:

| Layer | Where | Holds |
|---|---|---|
| **UI Preset** | `src/surveyjs/preset.json` | Declarative Creator config: tabs, built-in toolbox items, toolbox categories and order, property grid per class, options, localization. |
| **Custom Question Definitions** | `src/surveyjs/customQuestions/` | One module per Custom Question; the registry `index.js` lists them. |
| **Designer behaviours** | `src/surveyjs/designer/` | One module per rule enforced through Creator events; `createDesigner.js` is the recipe that applies preset, theme, schema and behaviours in order. |

`src/surveyjs/FormDesigner.jsx` is only the React host (creates the designer, reports `onChange`, shows the product picker). Keep logic out of it.

## Where a change goes

Pick the first row that fits:

1. **Show, hide, rename or reorder** a tab, toolbox item, property, option or UI string → `preset.json`. The preset follows the SurveyJS UI Preset Editor format; check the SurveyJS docs for keys.
2. **A preconfigured built-in question** with no marker, product or locking needs (e.g. *Number* = `text` + `inputType: number`) → a toolbox entry in `preset.json`, plus its icon in `createDesigner.js` when the Creator has none.
3. **A question renderers must recognise, or that is locked** → a new Custom Question Definition (steps below).
4. **A rule the preset cannot express** (reacting to adds, drags, property-grid buttons, allowed operations) → a new behaviour module (steps below).
5. **A form setting wanted only while designing** → `DESIGNER_ONLY_OPTIONS` in `designer/designerOnlyOptions.js`; it is stripped before saving.

## Adding a Custom Question

1. Create `src/surveyjs/customQuestions/<camelName>.js` exporting `defineCustomQuestion({...})`. The field list and its rules live in the header of `defineCustomQuestion.js`; copy the closest existing definition (`photo.js` simplest, `takePhoto.js` locked panel, `priceSurvey.js` locked panel with products).
2. Products need nothing in the definition: products live only as a question's `rows` or `choices` (value = product id, text = description), and `designer/productButtons.js` adds a "Select products" icon beside every array `rows`/`choices` property in the property grid. Make sure the class that holds the products lists `rows` or `choices` in `preset.json`'s property grid.
3. Add the module to `definitions` in `customQuestions/index.js`.
4. Add its `name` to a toolbox category in `preset.json` (the position there is its toolbox order).
5. Add property-grid entries for its type in `preset.json` if authors should edit new properties.
6. Update the Toolbox section of `README.md` and the toolbox list in `docs/poc-details.md`.

Done when: `npm run build` and `npm run lint` pass, the item appears in the designer toolbox with its icon, the questions it adds get random `q_` names, its marker is `true` in the saved JSON, "Select products" (if it holds products) fills its rows or choices, and the Preview tab renders it.

Rules:

- **Markers are part of the saved data.** A marker name and its class (`marker.on`) are permanent once forms are saved; the device app and reports look for them. Add new markers; keep existing ones unchanged.
- Two definitions may share a marker only when `json.type` differs (see `dynamicMerchSurvey.js`).
- `displayNames` rename the property for every question of that `json.type`, not just this Custom Question.
- Renderers (preview pages, device app) must import `customQuestions/index.js`, which registers the markers.

## Adding a designer behaviour

1. Create `src/surveyjs/designer/<behaviour>.js` exporting `(creator, ...deps) => void` that subscribes to Creator events. Start it with a comment saying, for a reader new to SurveyJS, which event it uses and why the preset can't do it. Look up the event in the SurveyJS docs (SurveyJS MCP `search_surveyjs_docs`) rather than guessing option names.
2. Call it in step 5 of `createDesigner.js` with a one-line trailing comment.
3. Ask for outside things (React state, modals) as a function parameter, as `productButtons(creator, pickProducts)` does; behaviours stay free of React. A behaviour that needs the DOM or React lifecycle exposes a hook instead (`useToolboxToggle`) and is called from `FormDesigner.jsx`.
4. Ask Custom Question questions through the registry (`isLockedPanel`, `isInLockedPanel`) rather than checking types or marker names inline.
5. Document it in the `README.md` module table under *Form designer*.

Done when: build and lint pass and the behaviour is checked by hand (or headless) in the designer at `/surveyjs/task-types/new` with no console errors.

Ordering: handlers on the same event run in registration order. `questionNames` must stay before `lockedPanels` (a question is named, then moved out of a locked panel); add new behaviours after existing ones unless they depend on running first.

No automated tests in the POC (`docs/adr/0004-no-automated-tests-in-the-poc.md`).
