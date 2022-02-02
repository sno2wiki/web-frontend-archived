import { LineType } from "~/types";

export const applyFold = (
  lines: LineType[],
  payload: { lineId: string; },
): LineType[] => {
  const beforeIndex = lines.findIndex(
    (line) => line.nextLineId === payload.lineId,
  );
  const targetIndex = lines.findIndex((line) => line.lineId === payload.lineId);
  if (beforeIndex === -1 || targetIndex === -1) {
    return lines;
  }

  const beforeLine = lines[beforeIndex];
  const targetLine = lines[targetIndex];
  const mergedLine: LineType = {
    lineId: beforeLine.lineId,
    nextLineId: targetLine.nextLineId,
    text: beforeLine.text + targetLine.text,
  };

  delete lines[beforeIndex];
  delete lines[targetIndex];

  return [mergedLine, ...lines].filter(Boolean);
};
