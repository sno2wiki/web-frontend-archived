import { deleteText } from "./deleteText";

export const applyDelete = (
  previous: { id: string; text: string; }[],
  payload: { lineId: string; index: number; },
): { id: string; text: string; }[] => {
  const targetIndex = previous.findIndex(({ id }) => id === payload.lineId);
  if (targetIndex === -1) return previous;

  const next = [...previous];
  next[targetIndex] = {
    ...previous[targetIndex],
    text: deleteText(previous[targetIndex].text, payload.index),
  };
  return next;
};
