# Concept: Ad hoc Work Events

Status: conceptual, for presentation to the design team. The POC that demonstrates it is described in [Agent Templates and Work Events Dashboard](./agent-templates-and-dashboard.md).

## Problem

Today a Task only exists if a team leader schedules it and sends it to an Agent via an appointment. Work that is not prompted goes through back-and-forth messages ("please complete this task" / "done").

Agents also do work on their own initiative while in a store, for example:

- A pallet bay is messy.
- The returns bay or returns pallet is full.
- They see a flyer they haven't seen before and want someone to be aware of it.

Today they photograph it or write a comment and send it on WhatsApp. That is unstructured and cannot be reported on. The designers are concerned that the WhatsApp replacement is not addressed early enough.

## Idea

A dedicated app on the device with two entry points:

1. **My Tasks**: assigned work, as today.
2. **Report something**: ad hoc work the Agent starts themselves. It has no appointment, no assigned Task, and needs no prompt from a team leader.

This removes the rigidity of the current model (create a Task Type, create a Task from it, link the Task to an appointment, send it down) for work an Agent does on top of planned work.

## Flow

1. Agent opens the app and taps **Report something**.
2. Agent picks a **Template** (e.g. "Returns bay").
3. A simple, generic form opens with:
   - a title identifying the Template,
   - a comments text box,
   - a photo field for one or more photos.
4. Agent submits. The device stamps the **Work Event** with the user, timestamp and latitude/longitude, then sends it.
5. The server resolves the user's name and the location.
6. The web client reads the Work Event and injects it into the SurveyJS dashboard, so responses can be reviewed almost as they arrive (assuming connectivity).
7. Agents can use the dashboard to see which Templates have been completed today.

## Starter Templates (suggested)

- Returns bay
- Pallet bay / backroom tidy
- New flyer or promotion spotted
- Stock issue (out of stock, damage)
- Display or signage problem
- Competitor sighting
- General observation (catch-all, so nothing falls back to WhatsApp)

For the first release only the generic form is needed (comments and photos).

## Proposed terms

- **Work Event**: a completed piece of work, either assigned (a Task) or Agent-initiated. "Task" continues to mean assigned work.
- **Template**: a pre-built entry for ad hoc reporting with a name, a unique ID and a Form. It is not linked to an appointment.
- **Event Context**: device metadata attached when a Work Event is completed: user ID, latitude/longitude and timestamp. The server resolves the display name and site later.

## Data

- The payload is SurveyJS JSON, so reporting stays consistent with assigned Tasks.
- Sketch of a Work Event:

  ```json
  {
    "templateId": "...",
    "formVersion": 1,
    "surveyData": {},
    "photos": [],
    "userId": "...",
    "lat": 0,
    "long": 0,
    "capturedAt": "..."
  }
  ```

- **Destination** (undecided): either the BI system directly, or back to the Task Management service, stored under a new data type. Leaning towards Task Management, because the web client can then read it immediately for the dashboard and BI can still consume it from there.
- **Server-side resolution**: the user ID resolves to a name, and the raw latitude/longitude is stored. Later it can be matched to a customer location geofence, so the result shows who completed it and where (store, warehouse, HQ or other).

## Decisions so far

- **Location is the link.** Ad hoc Work Events have no explicit store or appointment link. An Agent may well be on an appointment at the time, but the link is not modelled. Location is resolved server-side to whatever site it falls in, which is not necessarily a store.
- **Location is captured automatically.** Devices are company-managed, so no consent or privacy flow is required.
- **Templates are developer-defined for the POC.** Later they are managed in the Task Management web app at company context level, with a unique ID, synced down to devices, and able to carry the list of data to complete (the Form). Work Events store `templateId` and `formVersion` so they still resolve correctly when Templates become admin-managed. POC Templates should therefore use stable IDs, not names.
- **SurveyJS** remains the data format.

## Phasing

1. **POC / MVP**: developer-defined Templates (2–3), comments and photos only, automatic location capture, dashboard of today's Work Events.
2. **Next**: Admin-defined Templates in the web app synced to devices, richer Template forms, geofence matching. This could reuse the Task Type designer.
3. **Later**: optional team leader notifications and converting a Work Event into a Task.

## Open questions

- Should team leaders be notified instantly, or is the dashboard enough? (Open.)
- Who can create Templates beyond developers? Likely an Admin role in the web app; a "request a Template" flow is probably unnecessary. (Open.)
- What are the offline and photo size limits? Technical, but they need a number before MVP.
- Where do Work Events live: BI directly, or Task Management under a new data type?
