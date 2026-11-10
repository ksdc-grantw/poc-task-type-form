# Task Type Form POC

A proof of concept for defining Task Types whose Function is a Form, built with a pluggable Engine, to compare form-builder Engines before one is chosen.

## Language

**Task Type**:
A template configured by a Company Administrator that defines what kind of work an Agent is asked to do.
_Avoid_: Task template, job type

**Task**:
A concrete assignment of a Task Type to an Agent. Not modelled in the POC.
_Avoid_: Job, work order

**Function**:
What a Task Type makes the Agent do. FORM is the only Function the POC supports.
_Avoid_: Type, kind

**Company Administrator**:
The person who designs Task Types and their Forms, and creates Tasks, within a Company Context. Team leaders and other roles are not distinguished.
_Avoid_: Admin, Designer, creator, Team leader

**Company Context**:
One company's own set of Task Types, Tasks and Agents in the Task Management app. Not modelled in the POC.
_Avoid_: Tenant, account

**Instruction**:
A Function whose Task carries free text the Company Administrator writes, plus the responses (Done, Text, Photo) the Agent must give. Text only. There is one Instruction Task Type per Company Context.
_Avoid_: Note, message

**Agent**:
The field person who fills in Forms on a mobile device.
_Avoid_: User, worker

**Status**:
Whether a Task Type is ACTIVE or INACTIVE. An INACTIVE Task Type cannot be assigned to new Tasks; existing Tasks stay fillable.
_Avoid_: State, enabled flag

## Forms

**Form**:
The questionnaire attached to a Task Type whose Function is FORM.
_Avoid_: Survey, questionnaire

**Tag**:
A label on a Product from Product Master Data, such as manufacturer, product line, catalogue or variant. Both the tag labels and their values are controlled in Product Master Data, so the client never hard-codes them.
_Avoid_: Filter, category, attribute

**Product Master Data**:
The external system that owns the Product catalogue and its Tags. Not modelled in the POC, which uses a hard-coded list.
_Avoid_: PMD, product database

**Form Schema**:
The Engine-specific JSON definition of a Form. Opaque outside its Engine.
_Avoid_: Form definition, form JSON

**Custom Question**:
A domain-specific question type (e.g. Product, Price Check, photo-only) a Company Administrator can add to a Form beyond the Engine's built-in questions.
_Avoid_: Custom component, widget

**Form Version**:
A snapshot of a Form Schema at a point in time. A Form's version number increases each time its Form Schema changes.
_Avoid_: Revision

**Submission**:
An Agent's answers to a Form, tied to the Form Version it was filled against. A real concept, but not built in the POC.
_Avoid_: Response, result

**Engine**:
A pluggable form-builder library (SurveyJS, Form.io) that supplies the designer, preview and Form Schema format. The POC exists to compare Engines; only one would ship.
_Avoid_: Form builder, provider
