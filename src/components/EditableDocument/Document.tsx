import React, { useEffect, useMemo, useState } from "react";

import { createLineId } from "~/common/generateId";
import { EditData, Lines, LineType } from "~/types";

import { applyBreak, applyDelete, applyInsert, sortLines } from "./edit";
import { Line } from "./Line";
export const Document: React.VFC<{ storedLines: Lines; pushCommit(data: EditData): void; }> = (
  { storedLines, pushCommit },
) => {
  const [cursor, setCursor] = useState<{ lineId: string; index: number; }>();
  const [localLines, setLocalLines] = useState<LineType[]>(storedLines);

  useEffect(() => {
    setLocalLines(storedLines);
  }, [storedLines]);

  const actualLines = useMemo(() => sortLines(localLines), [localLines]);
  const actualCursor = useMemo(() => {
    return cursor ? cursor : { lineId: actualLines[0].lineId, index: 0 };
  }, [actualLines, cursor]);

  const handleSetCursor = (lineId: string, index: number) => setCursor({ lineId, index });
  const handleMoveCursor = (lineId: string, index: number, direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    const baseLine = actualLines.find((line) => line.lineId === lineId);
    if (!baseLine) return;

    switch (direction) {
      case "UP": {
        const prevLine = actualLines.find((line) => line.lineId === baseLine.prevLineId);
        if (!prevLine) break;
        setCursor({ lineId: prevLine.lineId, index: Math.min(prevLine.text.length, index) });
        break;
      }
      case "DOWN": {
        const postLine = actualLines.find((line) => line.lineId === baseLine.postLineId);
        if (!postLine) break;
        setCursor({ lineId: postLine.lineId, index: Math.min(postLine.text.length, index) });
        break;
      }
      case "LEFT": {
        if (index === 0) {
          const prevLine = actualLines.find((line) => line.lineId === baseLine.prevLineId);
          if (!prevLine) break;
          setCursor({ lineId: prevLine.lineId, index: prevLine.text.length });
        } else {
          setCursor({ lineId: baseLine.lineId, index: (index - 1) });
        }
        break;
      }
      case "RIGHT": {
        if (index === baseLine.text.length) {
          const postLine = actualLines.find((line) => line.lineId === baseLine.postLineId);
          if (!postLine) break;
          setCursor({ lineId: postLine.lineId, index: 0 });
        } else {
          setCursor({ lineId: baseLine.lineId, index: index + 1 });
        }
        break;
      }
    }
  };
  const handleInsert = (lineId: string, index: number, text: string) => {
    setCursor({ lineId, index: index + text.length });
    setLocalLines((previous) => applyInsert(previous, { lineId, index, text }));
    pushCommit({ method: "INSERT", payload: { lineId, index, text } });
  };

  const handleDelete = (lineId: string, index: number) => {
    setLocalLines((previous) => applyDelete(previous, { lineId, index }));
    setCursor({ lineId, index: index - 1 });
    pushCommit({ method: "DELETE", payload: { lineId, index } });
  };

  const handleBreak = (lineId: string, index: number) => {
    const newLineId = createLineId();
    setCursor({ lineId: newLineId, index: 0 });
    setLocalLines((previous) => applyBreak(previous, { lineId, newLineId, index }));
    pushCommit({ method: "BREAK", payload: { lineId, newLineId, index } });
  };

  const handleFold = (lineId: string) => {
    //  console.dir(localLines);
    //  setLocalLines((previous) => applyFold(previous, payload));
    pushCommit({ method: "FOLD", payload: { lineId } });
  };

  return (
    <div>
      {actualLines.map(({ lineId, text }) => (
        <Line
          key={lineId}
          lineId={lineId}
          text={text}
          cursor={(actualCursor && actualCursor.lineId === lineId) ? actualCursor.index : null}
          handleSetCursor={(index) => handleSetCursor(lineId, index)}
          handleMoveCursor={(index, direction) => handleMoveCursor(lineId, index, direction)}
          handleInsert={(index, text) => handleInsert(lineId, index, text)}
          handleDelete={(payload) => handleDelete(lineId, payload)}
          handleBreak={(payload) => handleBreak(lineId, payload)}
          handleFold={() => handleFold(lineId)}
        />
      ))}
    </div>
  );
};
