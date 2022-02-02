import { LineType } from "~/types";

import { insertText } from "./insertText";

export const applyInsert = (
  previous: LineType[],
  payload: { lineId: string; index: number; text: string; },
): LineType[] =>
  previous.map((line) =>
    line.lineId === payload.lineId
      ? { ...line, text: insertText(line.text, payload.text, payload.index) }
      : line
  );
