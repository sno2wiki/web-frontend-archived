import { LineType } from "~/types";

export const applyBreak = (
  lines: LineType[],
  payload: { lineId: string; index: number; newLineId: string; },
): LineType[] => {
  const index = lines.findIndex((line) => line.lineId === payload.lineId);
  if (index === -1) {
    return lines;
  }
  return [
    {
      lineId: lines[index].lineId,
      nextLineId: payload.newLineId,
      text: lines[index].text.slice(0, payload.index),
    },
    {
      lineId: payload.newLineId,
      nextLineId: lines[index].nextLineId,
      text: lines[index].text.slice(payload.index),
    },
    ...lines.slice(0, index),
    ...lines.slice(index + 1),
  ];
};
