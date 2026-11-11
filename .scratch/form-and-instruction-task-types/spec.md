Status: ready-for-agent

# Form and Instruction Task Types: future-state spec

## Solution

Add two Functions to the existing app.

- **FORM.** A Company Administrator designs a **Form** for a Task Type in the SurveyJS Survey Creator, restricted to a small, non-technical toolbox. The Form Schema is saved with the Task Type and reopened for editing. When a Task is created from a FORM Task Type, any product-related questions get their products bound to the Task.
- **INSTRUCTION.** One Task Type per **Company Context**. When creating a Task, the Company Administrator writes the **Instruction** (text only) and chooses the responses the Agent must give (Done, Text, Photo). The Task carries its own generated Form.

Both reuse the existing Task Type and Task screens and payloads. Fields the existing Task creation already has (customer location, occurrence, assignee) are unchanged.

## User Stories

1. As a Company Administrator, I want to choose FORM as a Task Type's Function, so that I can design a questionnaire for Agents.
2. As a Company Administrator, I want to design the Form in a visual designer, so that I don't need to write JSON.
3. As a Company Administrator, I want a restricted toolbox of simple question types, so that Forms stay easy to build and consistent.
4. As a Company Administrator, I want to add Single-Line Input, Long Text, Checkboxes, Radio Button Group, Dropdown and Yes/No questions, so that I can cover common answers.
5. As a Company Administrator, I want to mark a question as required, so that Agents can't skip it.
6. As a Company Administrator, I want no conditional logic or other validators in v1, so that the Form stays simple and every device can render it.
7. As a Company Administrator, I want custom questions (Number, Photo, Product, Price Check) to be offered, so that I can capture domain-specific answers. The final set depends on what the mobile team can render.
8. As a Company Administrator, I want to preview the Form on a phone-sized frame, so that I can see what the Agent will see.
9. As a Company Administrator, I want to preview a Form without opening the designer, so that I can check it quickly from the list.
10. As a Company Administrator, I want to reopen and edit a saved Form, so that I can improve it.
11. As a Company Administrator, I want to see the Form Version on the Task Type list, so that I know how many times a Form has changed.
12. As a Company Administrator, I want the Form Version to increase only when the Form Schema changes, so that renaming or changing Status doesn't create a new version.
13. As a Company Administrator, I want a Task Type's name and Function locked after creation, so that existing Tasks and reports don't change meaning.
14. As a Company Administrator, I want to set a Task Type to INACTIVE, so that no new Tasks can use it while existing Tasks stay fillable.
15. As a Company Administrator, I want only ACTIVE Task Types offered when I create a Task, so that I don't pick a retired one.
16. As a Company Administrator, I want question names generated and hidden, so that I never have to think about them and reports are stable. (Naming strategy is an open question.)
17. As a Company Administrator, I want a default set of products on a product question in the Form, so that every Task from this Task Type asks about the same products.
18. As a Company Administrator, I want to pick products by filtering on Tags (manufacturer, product line, catalogue, variant), so that I can find them quickly.
19. As a Company Administrator, I want Tag labels and values to come from Product Master Data, so that they are always current.
20. As a Company Administrator, I want to choose, for a product question, whether it is answered once for all products or repeated for each product, so that the Form fits the check being done.
21. As a Company Administrator, I want products fixed at Task Type level to be locked when I create a Task, so that I can't override the design.
22. As a Company Administrator, I want to choose products at Task creation for product questions with no defaults, so that one Form can serve different product sets.
23. As a Company Administrator, I want to be stopped from saving a Task if a product question has no products, so that Agents never get an empty question.
24. As a Company Administrator, I want to see the Form Version a Task was created against, so that I can trace what the Agent was asked.
25. As a Company Administrator, I want to create an INSTRUCTION Task by writing text, so that I can ask for one-off work.
26. As a Company Administrator, I want to choose one or more responses (Done, Text, Photo) for an Instruction, so that I get the evidence I need.
27. As a Company Administrator, I want all chosen responses required, so that the Agent can't finish without them.
28. As a Company Administrator, I want to be stopped from saving an Instruction Task with no text or no response type, so that Agents never get an empty request.
29. As a Company Administrator, I want exactly one INSTRUCTION Task Type per Company Context, so that Instruction Tasks are consistent.
30. As a Company Administrator, I want Task creation to behave as it does today (location, occurrence, assignee), so that nothing existing changes.
31. As a Company Administrator, I want Task Type payloads to carry the Form Schema, Engine and Form Version, so that the backend can store and serve them.
32. As a mobile developer, I want the Form Schema to be opaque JSON with an Engine identifier, so that I know which renderer to use.
33. As a mobile developer, I want a documented list of the custom question types and their answer shapes, so that I can implement them.
34. As a mobile developer, I want every Form Version kept, so that I can render a Submission against the version it was filled on.
35. As a reporting analyst, I want reports keyed on Task Type plus question name, with labels from the Form Version, so that answers stay meaningful after Forms change.
36. As an Agent, I want the Form or Instruction I'm assigned to match what the Company Administrator designed, so that I know what to do.

## Implementation Decisions

- **Engine.** SurveyJS is the only Engine (ADR 0003). The Form Schema is opaque to the backend, stored with an `engine` identifier and the Engine's own version field (ADR 0002). A commercial Survey Creator licence, and possibly a Form Library licence, is a **precondition**.
- **Scope.** The spec covers designing Task Types and creating Tasks. Completing Forms, capturing answers and photos on the device, and reporting are out of scope.
- **Functions.** Add FORM, INSTRUCTION and STOCK_COUNT to the existing Function set. FORM allows many Task Types. INSTRUCTION and STOCK_COUNT are singletons per Company Context with a fixed name. STOCK_COUNT carries a fixed, uneditable Form (one product-related "Capture counts" matrix with a row per product and Units, Cases and Pallets columns); only its Status can be edited.
- **Task Type payload.** A FORM Task Type carries a Form: Form Version, Engine and Form Schema. An INSTRUCTION Task Type carries none.
- **Task Type rules (unchanged from the existing system).** Name and Function are locked after creation. Status is ACTIVE or INACTIVE; INACTIVE blocks new Tasks, and existing Tasks stay fillable. The Form Version increments only when the Form Schema changes (ADR 0001).
- **Designer restrictions.** Tabs are Designer and Preview only. The toolbox has the six built-in questions plus the custom group. The property grid exposes only title, description, required and type-specific settings (placeholder, choices, photo source). No survey title, description, progress bar or completion message, since the Task Type supplies those. The theme is fixed. Preview defaults to a portrait phone.
- **Validation.** Required is the only validator. No conditional logic.
- **Custom questions.** Three kinds exist: preset (Number, Photo), specialized (Product) and composite (Price Check). Which ship in v1 is an open question to settle with the mobile team. Each one needs a matching implementation in the custom renderer. Fully custom types (e.g. barcode scan) are out of scope.
- **Question names.** Either a generated, immutable, hidden ID or a slug of the title, depending on the business intelligence system. Open question.
- **Task payload.** A Task records its Task Type, the Form Version it was created against, and its product bindings (per product question: mode single or each, plus the chosen products). INSTRUCTION Tasks also carry their generated Form: the instruction text at the root and one required question per chosen response.
- **Instruction.** Text only. Responses: Done (yes/no), Text, Photo (images only, camera or gallery, multiple). At least one is required, and all are required of the Agent.
- **Product binding.** A product question uses mode single (one answer for all products) or each (repeated per product). Task Type default products are locked at Task creation. Where none are set, the creator must choose at least one. Whether Tasks carry resolved products or Tag references is an open question.
- **Product Master Data.** The catalogue and its Tags come from an external API per Company Context. Tag labels and values are rendered dynamically in both product pickers, and products are filtered by Tag. Endpoint, data shape and whether Tags and products need separate calls are open.
- **Glossary.** Use the terms in `GLOSSARY.md`: Company Administrator, Company Context, Task Type, Task, Function, Instruction, Form, Form Schema, Form Version, Custom Question, Tag, Product Master Data, Engine, Agent, Status.
- **Unresolved decisions** are tracked in `docs/open-questions.md` and must be settled before or during implementation: Form Version history and in-flight Tasks, product transport, the Product Master Data API, photo transport, the custom question set, and question naming.

## Testing Decisions

No test seam is specified. Testing follows the team's normal development practice.

## Out of Scope

- Completing Forms and Instructions on the device, including rendering, answer capture and submission.
- How photos are captured and stored on the device.
- Reporting and dashboards, apart from the keying rule: Task Type plus question name, labels from the Form Version.
- Conditional logic and validators other than required.
- Fully custom question types such as barcode scan.
- Changes to existing Task creation fields (customer location, occurrence, assignee).
- Agent Templates and the Work Events dashboard (a separate concept).
- Form.io.

## Further Notes

- The POC's backend is a mock in `localStorage`; real storage, auth and sync are for the real app.
- `docs/poc-details.md` explains the designer restrictions, custom question kinds and name trade-offs in detail.
- Open items live in `docs/open-questions.md`; don't treat the spec as final until they are answered.
