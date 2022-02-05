import { insertText } from "./insertText";

export const applyInsert = (
  previous: { id: string; text: string; }[],
  payload: { lineId: string; index: number; text: string; },
): { id: string; text: string; }[] => {
  const targetIndex = previous.findIndex(({ id }) => id === payload.lineId);
  if (targetIndex === -1) return previous;

  const next = [...previous];
  next[targetIndex] = {
    ...previous[targetIndex],
    text: insertText(previous[targetIndex].text, payload.text, payload.index),
  };
  return next;
};
