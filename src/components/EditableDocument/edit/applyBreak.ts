import { LineType } from "../types";

export const applyBreak = (
  previous: LineType[],
  payload: { lineId: string; index: number; newLineId: string; },
): LineType[] => {
  const targetindex = previous.findIndex(({ id }) => id === payload.lineId);
  if (targetindex === -1) return previous;

  return [
    ...previous.slice(0, targetindex),
    { ...previous[targetindex], text: previous[targetindex].text.slice(0, payload.index) },
    { id: payload.newLineId, text: previous[targetindex].text.slice(payload.index) },
    ...previous.slice(targetindex + 1),
  ];
};
