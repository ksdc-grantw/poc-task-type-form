# The backend treats Form Schema as opaque and records the Engine

The backend stores `form.schema` without inspecting it, alongside an `engine` identifier (e.g. `surveyjs`) so the Agent app knows which renderer to use. This keeps the backend independent of any one Engine, so switching Engines needs a Schema migration but no backend change. The POC payload carries `engine` alongside the Engine's own version field (e.g. `surveyjsVersion`).
