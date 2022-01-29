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
  handleMethod(data: EditData): void;
  synced: boolean;
}> = ({ storedLines: storedLines, handleMethod, synced: synced }) => {
  const [cursor, setCursor] = useState<{ line: string; index: number }>({
    line: storedLines[0].lineId,
    index: 0,
  });
  const [localLines, setLocalLines] = useState<Lines>(storedLines);

  const parsedStoredLines = useMemo(() => storedLines, [storedLines]);
  const parsedLocalLines = useMemo(() => localLines, [localLines]);
  const actualLines = useMemo(
    () => (synced ? parsedStoredLines : parsedLocalLines),
    [parsedStoredLines, parsedLocalLines]
  );

  useEffect(() => {
    if (synced) setLocalLines(() => storedLines);
  }, [synced]);

  const handleFocus = (payload: FocusPayload) => {
    setCursor({ line: payload.lineId, index: payload.index });
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
    setCursor((previous) => ({
      ...previous,
      index: previous.index + payload.text.length,
    }));
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
    setCursor({ line: newLineId, index: 0 });
    handleMethod({ method: "BREAK", payload });
  };

  return (
    <div>
      {actualLines.map(({ lineId: lineId, text }) => (
        <Line
          key={lineId}
          lineId={lineId}
          text={text}
          cursor={lineId === cursor.line ? cursor.index : null}
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
