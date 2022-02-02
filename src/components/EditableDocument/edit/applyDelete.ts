import { LineType } from "~/types";

import { deleteText } from "./deleteText";

export const applyDelete = (previous: LineType[], payload: { lineId: string; index: number; }): LineType[] =>
  previous.map((line) =>
    line.lineId === payload.lineId
      ? { ...line, text: deleteText(line.text, payload.index) }
      : line
  );
