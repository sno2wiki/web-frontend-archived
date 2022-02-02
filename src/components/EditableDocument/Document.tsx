import React, { useEffect, useMemo, useState } from "react";

import { createLineId } from "~/common/generateId";
import { EditData, Lines, LineType } from "~/types";

import {
  applyBreak,
  applyDelete,
  applyFold,
  applyInsert,
  sortLines,
} from "./edit";
import { Line } from "./Line";
export const Document: React.VFC<{
  storedLines: Lines;
  pushCommit(data: EditData): void;
}> = ({ storedLines: storedLines, pushCommit: handleMethod }) => {
  const [focusLine, setFocusLine] = useState<string | null>(null);
  const [localLines, setLocalLines] = useState<LineType[]>(storedLines);

  useEffect(() => {
    setLocalLines(() => storedLines);
  }, [storedLines]);

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
    setLocalLines((previous) => applyInsert(previous, payload));
    handleMethod({ method: "INSERT", payload });
  };
  const handleDelete = (payload: { lineId: string; index: number }) => {
    setLocalLines((previous) => applyDelete(previous, payload));
    handleMethod({ method: "DELETE", payload: { ...payload } });
  };
  const handleBreak = (payload: { lineId: string; index: number }) => {
    const newLineId = createLineId();
    setFocusLine(newLineId);
    setLocalLines((previous) =>
      applyBreak(previous, { ...payload, newLineId })
    );
    handleMethod({ method: "BREAK", payload: { ...payload, newLineId } });
  };
  const handleFold = (payload: { lineId: string }) => {
    setLocalLines((previous) => applyFold(previous, payload));
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
