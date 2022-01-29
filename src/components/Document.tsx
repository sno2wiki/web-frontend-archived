import React, { useEffect, useMemo, useState } from "react";
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
  storedLines: Lines;
  synced: boolean;
  handleMethod(data: EditData): void;
}> = ({ storedLines: storedLines, handleMethod, synced: synced }) => {
  const [focusLine, setFocusLine] = useState<string | null>(null);
  const [localLines, setLocalLines] = useState<Lines>(storedLines);

  const parsedStoredLines = useMemo(() => storedLines, [storedLines]);
  const parsedLocalLines = useMemo(() => localLines, [localLines]);
  const actualLines = useMemo(
    () => (synced ? parsedStoredLines : parsedLocalLines),
    [parsedStoredLines, parsedLocalLines]
  );
  const actualFocusLine = useMemo(
    () => focusLine || actualLines[0].lineId,
    [focusLine, actualLines]
  );

  useEffect(() => {
    if (synced) setLocalLines(() => storedLines);
  }, [synced]);

  const handleFocus = (payload: FocusPayload) => {
    setFocusLine(payload.lineId);
  };

  const handleInsert = (payload: InsertPayload) => {
    setLocalLines((previous) =>
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
    setFocusLine(payload.lineId);
    handleMethod({ method: "INSERT", payload });
  };

  const handleBreak = (payload: BreakPayload) => {
    const newLineId = createLineId();
    setLocalLines((previous) =>
      previous
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
    setFocusLine(newLineId);
    handleMethod({ method: "BREAK", payload });
  };

  return (
    <div>
      {actualLines.map(({ lineId: lineId, text }) => (
        <Line
          key={lineId}
          lineId={lineId}
          text={text}
          focus={lineId === actualFocusLine}
          handleFocus={handleFocus}
          handleInsert={handleInsert}
          handleDelete={() => {}}
          handleBreak={handleBreak}
          handleFold={() => {}}
        ></Line>
      ))}
    </div>
  );
};
