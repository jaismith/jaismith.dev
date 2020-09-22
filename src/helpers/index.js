export const generateKey = (properties) => (
  properties.reduce((key, prop) => key += prop.replace(/\s+/g, ''))
)
