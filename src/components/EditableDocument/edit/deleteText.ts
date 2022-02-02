export const deleteText = (previous: string, index: number): string => {
  console.log(previous, index);
  if (index === 0) return previous;
  else if (previous.length < index) {
    return deleteText(previous, previous.length);
  } else return `${previous.slice(0, index - 1)}${previous.slice(index)}`;
};
