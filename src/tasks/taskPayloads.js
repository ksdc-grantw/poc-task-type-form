// Display-only payloads for a Task. Nothing is sent anywhere in the POC.

// The record the Tasks backend stores is the POST /tasks body itself (plus id and createdAt once saved).

// What an external system would receive for a Task: self-contained, so it can render the Task
// without a second lookup. The Form Schema stays opaque (ADR 0002); products are reduced to
// { id, description } because Product Master Data owns the rest.
export function externalTaskPayload(task, taskType) {
  // An INSTRUCTION task carries its own generated form; other tasks use their task type's.
  const form = task.form
    ? { engine: 'surveyjs', version: null, schema: task.form }
    : taskType?.form && {
        engine: taskType.form.engine ?? 'surveyjs',
        version: taskType.form.version,
        schema: taskType.form.schema,
      }
  return {
    ...(task.id != null && { id: task.id }),
    ...(task.createdAt && { createdAt: task.createdAt }),
    taskType: taskType && {
      id: taskType.id,
      name: taskType.name,
      function: taskType.function,
      status: taskType.status,
    },
    ...(form && { form }),
    productBindings: Object.fromEntries(
      Object.entries(task.productBindings ?? {}).map(([name, b]) => [
        name,
        { mode: b.mode, products: b.products.map((p) => ({ id: p.id, description: p.description })) },
      ]),
    ),
  }
}
