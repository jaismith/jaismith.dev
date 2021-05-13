const classes = (...classNames: (string | boolean)[]): string => (
  classNames.filter(c => c).join(' ')
);

export default classes;
