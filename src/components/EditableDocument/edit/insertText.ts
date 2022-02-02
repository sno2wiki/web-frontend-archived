export const insertText = (previous: string, insert: string, index: number) =>
  `${previous.slice(0, index)}${insert}${previous.slice(index)}`;
