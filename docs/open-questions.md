# Open questions for the future-state spec

Decisions that are **unresolved**. Each needs discussion before the spec can treat it as settled. None of these is an ADR yet.

## Scope

The spec covers **creating** Task Types and Tasks (the designer, Form Schema and payloads). **Completing** a Form on the device is another team's work. They use custom rendering of the Form Schema, because SurveyJS has no Android renderer. Custom question types therefore need a matching implementation on their side.

## 1. Form Version history and how Task Types change over time

The POC increments `form.version` when a Form Schema changes (see ADR 0001). It does not say what happens to work already in flight.

- **Answers across versions.** Version 1 may have a question type that version 2 drops. Answers captured on version 1 won't line up with the latest Task Type. Somewhere, the full history of each Task Type's Form Versions has to be kept, so each Submission can be read against the version it was filled on.
- **Scheduled Tasks that haven't started.** When a Form Task Type changes, what happens to Tasks created for a future date that nobody has begun, and are still on version 1? Leaning: they should move to version 2, because the Task Type has changed and the work isn't done. Not decided, and how to implement it is not worked out.
- **In-use versions.** Can a version that has Tasks or Submissions against it be edited in place, or does every edit create a new version? (Carried over from `poc-details.md`.)
- **Tasks already started.** Should a Task that is partly filled stay on its original version? Not discussed yet.

## 2. How product choices are sent to the device

The POC copies the full array of chosen products into the Task (`productBindings`), so later catalogue changes don't alter the Task.

- **Problem.** If a Form relates to a whole product line, the Task could carry hundreds of products. That is too heavy to send down.
- **Alternative.** Send the product line name, or the tags or categories that make up the line, and resolve them to products on the device or server.
- **Trade-off to settle.** The snapshot gives stable history but is large. References are small, but the resolved product list can change after the Task is created. The answer also affects reporting.
- Not decided.

## 3. Product Master Data API

The catalogue comes from an external system, Product Master Data, per Company Context. The POC's hard-coded list stands in for it.

- **Endpoint and data shape.** Not confirmed: the endpoint, the structure of the data, and how much data comes back.
- **One call or two.** Product Master Data stores every Product with all its Tags, and its own clients fetch everything and build the Tag list in the client. Do we need one call for the Tags and a second for Products by Tag, or is one call enough?
- **Dynamic Tags.** Tag labels (manufacturer, product line, catalogue, variant) and their values are controlled by Product Master Data. The designer and Task creation screens must render them dynamically, never hard-code them.
- **Links to item 2.** Whether Tasks carry products or Tag references depends on what this API can return efficiently.

## 4. Photos from the device to the microservice

How a photo is captured and stored on the device is the mobile team's work and out of scope. Open: how photos get from the device to the microservice, whether the microservice stores them at all, or whether they are stored somewhere else and only referenced. Size limits and offline behaviour belong to this question too.

## 5. Which custom questions ship

The POC has Number, Photo, Product and Price Check. Which of these the real app offers is not decided. The completion team (mobile) renders Forms with custom rendering, so we only offer questions they can render. To be settled with them. Fully custom types (e.g. barcode scan) are out of scope.

## 6. Question naming

Each question has a `name` that keys its answer. Two options: a randomly generated, immutable, hidden ID (the POC), or a slug of the question title. The choice depends on how the business intelligence system consuming the data handles the incoming JSON. Not decided. See `poc-details.md` for the trade-offs.

## Settled constraints (not open)

- Task Type name and Function are locked after creation. Status is ACTIVE or INACTIVE; an INACTIVE Task Type can't get new Tasks, and existing Tasks stay fillable. This is unchanged from the existing system.
- Version 1 has no conditional logic. The only validator is the required flag; the Form Schema must not contain others.
- Product choices use Tag filtering in both places: the Task Type's default products and the Task's product pick. Whether the result is stored as products or as Tag references is item 2.
- Reporting is out of scope, apart from the rule that reports key on Task Type plus question name, with labels from the Form Version the answer was captured on.