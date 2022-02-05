export const applyFold = (
  previous: LineType[],
  payload: { lineId: string; },
): LineType[] => {
  const targetindex = previous.findIndex(({ id }) => id === payload.lineId);
  if (targetindex === -1) return previous;

  return [
    ...previous.slice(0, targetindex - 1),
    { ...previous[targetindex - 1], text: previous[targetindex - 1].text + previous[targetindex].text },
    ...previous.slice(targetindex + 1),
  ];
};
import { LineType } from "../types";
