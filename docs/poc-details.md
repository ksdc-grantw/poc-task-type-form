# POC details: the FORM task type

This document records what the POC demonstrates, how it works, and what to weigh before taking it further. For setup and configuration reference, see the [README](../README.md).

## Goal

Add a new task type function, `FORM`. When a user creates a FORM task type, they design the form in the SurveyJS Survey Creator. The form definition (JSON) is saved with the task type, can be reopened and edited, and is sent to a backend service in the task type payload.

```
Task Type (FORM + form JSON)  ->  Task  ->  Task Instances  ->  completed on device
```

Out of scope: the backend (mocked in `localStorage`), tasks and task instances, rendering on the device, answer capture, and reporting.

## Stack

Vite, React (plain JavaScript), Tailwind CSS v4, React Router, SurveyJS Survey Creator 3 (`survey-creator-react`) and the Form Library (`survey-react-ui`). Deployed to GitHub Pages on every push to `main`.

## What is demonstrated

| Capability | Where to see it |
|---|---|
| Task type list with a mock backend (Name, Function, Status, day counts, form version) | `/` |
| Create and edit a FORM task type; the form is designed in the Survey Creator | `/task-types/new`, `/task-types/:id` |
| Form saved as JSON and reopened for editing from the same payload | edit any FORM task type |
| Payload preview (the request body for create/update) | **Show payload** in the editor |
| Create/update rules: name and function locked after creation, form version increments only when the schema changes | `src/shared/TaskTypeEditor.jsx` + `src/shared/createTaskTypeApi.js` |
| Seeded demo task types for different goals (compliance, stock check, feedback, photos, one-off instruction) | list |
| Preview inside the designer, defaulting to mobile portrait | `?tab=preview` on the editor URL |
| Standalone preview without the designer (Form Library only, phone-sized frame) | **Open Preview** in the list |
| Restricted designer: preset tabs, toolbox and property grid, no logic, fixed theme, no survey header | see below |
| Custom toolbox items of three kinds (preset, specialized, composite) | **Custom** group in the toolbox |
| Generated, hidden question names | add a question and check **Show payload** |

## The designer is a restricted Creator

The Creator is configured for non-technical form authors through a UI preset (`src/surveyjs/preset.json`) plus a few event handlers in `src/surveyjs/FormDesigner.jsx`:

- **Tabs:** Designer and Preview only. No Logic, JSON editor, Translations or Themes tabs.
- **Toolbox:** Single-Line Input, Long Text, Checkboxes, Radio Button Group, Dropdown and Yes/No, then a **Custom** group: Number, Photo, Product and Price Check.
- **Property grid:** only the properties listed per question type (title, description, required, plus things such as placeholder, choices and photo source). No conditional logic, validators or data settings.
- **Survey-level settings hidden:** no title, description, progress bar or completion message. The task type supplies those outside the form.
- **Theme:** the designer UI is fixed to the Plain theme and cannot be changed by users.
- **Preview:** defaults to an Android phone in portrait.

## Question names

Every question has a `name`, which is the key its answer is stored under and the key reports will use. The Creator's default (`question1`, `question2`, ...) reuses the lowest free number after a delete, so an old name could later mean a different question.

The POC instead:

- generates a random ID (e.g. `q_8f3k2a9x`) when a question is added, and regenerates it for duplicates;
- keeps the name when a question's type is converted;
- hides the name field so it can't be edited;
- gives new questions the placeholder title "Enter question title" so authors don't see the random ID.

Names are therefore never reused and never change. They are unreadable on purpose: reporting takes labels and types from the form JSON saved with the task type. Reports should key on task type + question name, and look up the label from the form version the answer was captured on.

### Alternative: names derived from titles (not built)

If titles cannot travel with the answers to reporting and names need to be meaningful (e.g. `shelf_price`), the name can follow the title. Renaming a question when its title changes is equivalent, for reporting, to deleting the old question and adding a new one: the old column stays as it was and new answers land in a new column (`shelf_price` then `shelf_price_per_case`). Reports must treat a form's columns as the union across versions.

How it would be done:

- Listen to `creator.onModified` for `type === "PROPERTY_CHANGED"` with `name === "title"`; set `target.name` to the slug. This fires on committed edits, not each keystroke.
- Enforce unique titles per form, checked on the generated slug rather than the raw title, because "Shelf price", "Shelf-price" and "Shelf price?" all give `shelf_price`. Show the error through the Creator's property validation (`onPropertyValidationCustomError`), or append a numeric suffix. Neither is tested in this POC.
- Keep the random ID until a real title is set, so every new "Enter question title" question doesn't collide. Copies get "(copy)" added to the title.
- Fall back to the random ID when the slug is empty (non-Latin titles, symbols only). Cap the length, since names become column names.
- Leave composite questions' inner field names fixed.
- Keep the name hidden, as now; it is derived, not authored.

Trade-offs: names are no longer stable keys; the same title on two forms gives the same column with possibly different meaning; authors can't reuse a title within a form.
## Custom toolbox items

There are three kinds, and the difference is how much the device app has to know. All three appear in the **Custom** group.

### 1. Preset items (Number, Photo)

A toolbox entry that creates a **built-in** question type with preset settings. Number is a `text` question with `inputType: "number"`. Photo is a `file` question limited to images, with the camera and gallery as sources.

- **Saved as:** ordinary SurveyJS JSON (`{ "type": "text", "inputType": "number" }`).
- **Device impact:** none. Any SurveyJS renderer already understands it.
- **Cost:** low, a few lines of preset JSON, plus an icon if no built-in one fits (Number needed a custom icon).
- **Limit:** after adding, authors can change the settings the property grid exposes. Photo has an extra hidden `photoOnly` flag, with the file-type settings hidden for it, so it stays images only. That flag is a custom property; renderers should register it (`src/surveyjs/photoOnly.js`) to recognise a photo field.

### 2. Specialized questions (Product)

A **new question type** that wraps one built-in question with locked settings. Product is a dropdown whose choices are the (mock) product catalogue, defined once in code.

- **Saved as:** `{ "type": "product" }`, with the answer being the product code.
- **Device impact:** low to medium. The renderer must register the same definition (`src/surveyjs/customQuestions.js`), or it can't draw the question.
- **Benefit:** the configuration lives in one place, so a catalogue change doesn't need every form edited, and authors can't misconfigure it.
- **Next step:** load choices from the backend (`choicesByUrl`) instead of hard-coding them.

### 3. Composite questions (Price Check)

A **new question type** that groups several fields into one question: product, shelf price, promo price, and "is the price tag correct?".

- **Saved as:** `{ "type": "pricecheck" }`, with the answer being `{ product, shelfPrice, promoPrice, tagCorrect }`.
- **Device impact:** medium. Same registration requirement as Specialized, and the device must handle an object-shaped answer.
- **Benefit:** a consistent, structured answer across all forms that use it, which makes cross-form reporting realistic.
- **Limit:** the inner field names are fixed by the definition, and authors only edit the outer question's title, description and required flag.

### 4. Fully custom questions (not built; barcode scan is the example)

A question with **its own behaviour and UI**, such as scanning a barcode with the camera. In SurveyJS this means a new question class, its own renderer, and designer integration. Not demonstrated, because of the drawbacks below.

#### Drawbacks of fully custom components

- **No Android renderer.** SurveyJS has no Android (Kotlin) version of the Form Library, so a field agent's device app has to render these forms itself. Built-in types are a known, finite set to implement, while a custom UI is new native work every time.
- **Two implementations to keep in sync.** The web designer (and web preview) needs one version and the device needs another, and both must read and write the same answer.
- **Device capabilities.** Camera scanning, GPS and similar features depend on platform APIs and permissions, and the web version (browser camera) behaves differently from the device version.
- **Answer format is a contract.** The shape of the saved answer is consumed by the backend and reports, so changing it later means versioning.
- **Version coupling.** A form using a custom type is only valid for app versions that support it, so releases need coordinating, and old devices need a defined behaviour for unknown types (skip, block or show a fallback).
- **Testing cost.** Custom UI needs testing on every device and OS version supported, while the built-in types are covered by SurveyJS's own tests.
- **Designer experience.** The Creator shows a placeholder on the design surface, and the real behaviour (e.g. camera) can't be tried until it reaches a device.
- **Upgrade risk.** Custom classes rely on SurveyJS internals that can change between versions.

#### Cheaper way to prove one out

Define the question type and its saved answer, add the toolbox item and designer settings, and render a plain text input in the web preview instead of the real control. This proves the designer, the form JSON and the payload without any device work. Real scanning is left to the device app.

### Choosing between the kinds

| Need | Use |
|---|---|
| A built-in question with preset settings | Preset item |
| A fixed list that the business owns (products, reasons) | Specialized |
| The same group of fields in many forms, with a consistent answer | Composite |
| Behaviour a SurveyJS question can't do (scanning, signatures with a custom device pad) | Fully custom, only with device app work planned |

## Things to decide before going beyond the POC

- **Device rendering:** how the device app renders the form JSON, given there's no SurveyJS Android renderer (native implementation, web view with the Form Library, or other).
- **Custom types on the device:** every custom question type needs the same definition on the device, and unknown types need defined behaviour.
- **Licensing:** Survey Creator needs a commercial licence; the POC runs unlicensed and shows a banner.
- **File uploads:** Photo answers are stored as base64 in the answers by default. For real volumes, upload files separately and store references.
- **Form versions:** the POC increments a version number when the schema changes. Decide whether an in-use version can be edited, or whether edits always create a new one.
- **Product catalogue source:** the Product question uses a hard-coded list; a real one needs the principal's catalogue from the backend.
- **Conditional logic:** deliberately left out. Add it later if forms need it.
- **Reporting:** keyed on task type + question name, with labels read from the saved form JSON.
