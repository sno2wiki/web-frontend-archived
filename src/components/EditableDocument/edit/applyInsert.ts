import { insertText } from "./insertText";

export const applyInsert = (
  previous: LineType[],
  payload: { lineId: string; index: number; text: string; },
): LineType[] => {
  const targetIndex = previous.findIndex(({ id }) => id === payload.lineId);
  if (targetIndex === -1) return previous;

  const next = [...previous];
  next[targetIndex] = {
    ...previous[targetIndex],
    text: insertText(previous[targetIndex].text, payload.text, payload.index),
  };
  return next;
};
import { LineType } from "../types";
