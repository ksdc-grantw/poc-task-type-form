// Form settings applied only while designing, and removed from the JSON the designer reports
// (so never saved). widthMode "responsive" makes the design surface fill the available width
// instead of the fixed width "auto" picks.
const DESIGNER_ONLY_OPTIONS = { widthMode: 'responsive' }

export const withDesignerOnlyOptions = (schema) => ({ ...schema, ...DESIGNER_ONLY_OPTIONS })

export const withoutDesignerOnlyOptions = (json) => {
  const schema = { ...json }
  for (const key of Object.keys(DESIGNER_ONLY_OPTIONS)) delete schema[key]
  return schema
}
