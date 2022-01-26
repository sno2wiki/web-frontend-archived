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
  initLines: Lines;
  handleMethod(data: EditData): void;
}> = ({ initLines: init, handleMethod }) => {
  const [cursor, setCursor] = useState<{ line: string; index: number }>({
    line: "first",
    index: -1,
  });
  const [lines, setLines] = useState<Lines>(init);
  const [linesBuffer, setLinesBuffer] = useState<Lines>(init);

  const handleFocus = (payload: FocusPayload) => {
    setLines(() => linesBuffer);
    setCursor({ line: payload.lineId, index: payload.index });
  };

  const handleInsert = (payload: InsertPayload) => {
    setLinesBuffer(() =>
      lines.map((previousLine) =>
        previousLine.lineId === payload.lineId
          ? {
              ...previousLine,
              text:
                previousLine.text.slice(0, Math.max(0, payload.index)) +
                payload.text +
                previousLine.text.slice(Math.max(0, payload.index)),
            }
          : previousLine
      )
    );
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
    handleMethod(data);
    switch (data.method) {
      case "FOCUS":
        handleFocus(data.payload);
        break;
      case "INSERT":
        handleInsert(data.payload);
        break;
      case "BREAK":
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
