const generate = (properties: string[]) => (
  properties.reduce((key, prop) => key += prop.replace(/\s+/g, ''))
);

export default generate;
