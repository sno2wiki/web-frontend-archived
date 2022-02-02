import React, { useEffect, useMemo, useState } from "react";

import { createLineId } from "~/common/generateId";
import { EditData, Lines, LineType } from "~/types";

import { deleteText, insertText, sortLines } from "./edit";
import { Line } from "./Line";

export const Document: React.VFC<{
  storedLines: Lines;
  synced: boolean;
  pushCommit(data: EditData): void;
}> = ({
  storedLines: storedLines,
  pushCommit: handleMethod,
  synced: synced,
}) => {
  const [focusLine, setFocusLine] = useState<string | null>(null);
  const [localLines, setLocalLines] = useState<LineType[]>(storedLines);

  useEffect(() => {
    if (synced) setLocalLines(() => storedLines);
  }, [storedLines, synced]);

  const actualLines = useMemo(() => sortLines(localLines), [localLines]);
  const actualFocusLine = useMemo(
    () => focusLine || localLines[0].lineId,
    [focusLine, localLines]
  );

  const handleFocus = (payload: { lineId: string }) => {
    setFocusLine(payload.lineId);
  };
  const handleInsert = (payload: {
    lineId: string;
    index: number;
    text: string;
  }) => {
    setFocusLine(payload.lineId);
    setLocalLines((previous) =>
      previous.map((line) =>
        line.lineId === payload.lineId
          ? {
              ...line,
              text: insertText(line.text, payload.text, payload.index),
            }
          : line
      )
    );
    handleMethod({ method: "INSERT", payload });
  };
  const handleDelete = (payload: { lineId: string; index: number }) => {
    setLocalLines((previous) =>
      previous.map((line) =>
        line.lineId === payload.lineId
          ? {
              ...line,
              text: deleteText(line.text, payload.index),
            }
          : line
      )
    );
    handleMethod({ method: "DELETE", payload: { ...payload } });
  };
  const handleBreak = (payload: { lineId: string; index: number }) => {
    const newLineId = createLineId();
    setFocusLine(newLineId);
    handleMethod({ method: "BREAK", payload: { ...payload, newLineId } });
  };
  const handleFold = (payload: { lineId: string }) => {
    handleMethod({ method: "FOLD", payload: { ...payload } });
  };

  return (
    <div>
      {actualLines.map(({ lineId: lineId, text }) => (
        <Line
          key={lineId}
          lineId={lineId}
          text={text}
          focus={lineId === actualFocusLine}
          handleFocus={(payload) => handleFocus({ ...payload })}
          handleInsert={(payload) => handleInsert({ ...payload })}
          handleDelete={(payload) => handleDelete({ ...payload })}
          handleBreak={(payload) => handleBreak({ ...payload })}
          handleFold={(payload) => handleFold({ ...payload })}
        />
      ))}
    </div>
  );
};
