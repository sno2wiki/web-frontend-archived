import React, { useState } from "react";
import { createLineId } from "~/generators/id";
import {
  BreakPayload,
  EditData,
  FocusPayload,
  InsertPayload,
  Lines,
} from "~/types";
import { Line } from "./Line";

export const Document: React.VFC<{
  lines: Lines;
  handleMethod(data: EditData): void;
}> = ({ lines: init, handleMethod }) => {
  const [cursor, setCursor] = useState<{ line: string; index: number }>({
    line: init[0].lineId,
    index: 0,
  });
  const [lines, setLines] = useState<Lines>(init);
  const [linesBuffer, setLinesBuffer] = useState<Lines>(init);

  const handleFocus = (payload: FocusPayload) => {
    setCursor({ line: payload.lineId, index: payload.index });
  };

  const handleInsert = (payload: InsertPayload) => {
    setLines((previous) =>
      previous.map((line) =>
        line.lineId === payload.lineId
          ? {
              ...line,
              text: `${line.text.slice(0, payload.index)}${
                payload.text
              }${line.text.slice(payload.index)}`,
            }
          : line
      )
    );
    setCursor((previous) => ({
      ...previous,
      index: previous.index + payload.text.length,
    }));
  };

  const handleBreak = (payload: BreakPayload) => {
    const newLineId = createLineId();
    setLines(() =>
      linesBuffer
        .map((line) =>
          line.lineId === payload.lineId
            ? [
                {
                  lineId: line.lineId,
                  text: line.text.slice(0, payload.index),
                },
                {
                  lineId: newLineId,
                  text: line.text.slice(payload.index),
                },
              ]
            : [line]
        )
        .flat()
    );
    setCursor({ line: newLineId, index: 0 });
  };

  const handleCapture = (data: EditData) => {
    switch (data.method) {
      case "FOCUS":
        handleFocus(data.payload);
        break;
      case "INSERT":
        handleMethod(data);
        handleInsert(data.payload);
        break;
      case "BREAK":
        handleMethod(data);
        handleBreak(data.payload);
        break;
    }
  };

  return (
    <div>
      {lines.map(({ lineId: lineId, text }) => (
        <Line
          key={lineId}
          lineId={lineId}
          text={text}
          cursor={lineId === cursor.line ? cursor.index : null}
          handleCapture={handleCapture}
        ></Line>
      ))}
    </div>
  );
};
