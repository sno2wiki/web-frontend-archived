import React, { useState } from "react";
import { Line } from "./Line";
import {
  BreakPayload,
  CaptureData,
  FocusPayload,
  InsertPayload,
} from "./types";

export type Line = { lineId: string; text: string };
export type Lines = Line[];

export const Document: React.VFC<{ init: Lines }> = ({ init }) => {
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
    const newLineId = Math.random().toString(23).slice(2);
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

  const handleCapture = (data: CaptureData) => {
    console.dir(data);
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
