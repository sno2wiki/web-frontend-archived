import React, { useEffect, useMemo, useState } from "react";

import { createLineId } from "~/common/generateId";

import { applyBreak, applyDelete, applyFold, applyInsert } from "./edit";
import { Line } from "./Line";
import { CommitData } from "./useEditDocument";

export const Document: React.VFC<
  { storedLines: { id: string; text: string; }[]; pushCommit(data: CommitData): void; }
> = (
  { storedLines, pushCommit },
) => {
  const [cursor, setCursor] = useState<{ lineId: string; index: number; }>();
  const [localLines, setLocalLines] = useState<{ id: string; text: string; }[]>(storedLines);

  useEffect(() => {
    setLocalLines(storedLines);
  }, [storedLines]);

  const actualCursor = useMemo(() => {
    return cursor ? cursor : { lineId: localLines[0].id, index: 0 };
  }, [cursor, localLines]);

  const handleSetCursor = (lineId: string, index: number) => setCursor({ lineId, index });
  const handleMoveCursor = (lineId: string, index: number, direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    const baseIndex = localLines.findIndex((line) => line.id === lineId);
    if (baseIndex === -1) return;

    switch (direction) {
      case "UP": {
        if (baseIndex === 0) {
          setCursor({ lineId: localLines[0].id, index: 0 });
        } else {
          setCursor({
            lineId: localLines[baseIndex - 1].id,
            index: Math.min(localLines[baseIndex - 1].text.length, index),
          });
        }
        break;
      }
      case "DOWN": {
        if (baseIndex === localLines.length - 1) {
          setCursor({
            lineId: localLines[localLines.length - 1].id,
            index: localLines[localLines.length - 1].text.length,
          });
        } else {
          setCursor({
            lineId: localLines[baseIndex + 1].id,
            index: Math.min(localLines[baseIndex + 1].text.length, index),
          });
        }
        break;
      }
      case "LEFT": {
        if (0 < baseIndex && index === 0) {
          setCursor({ lineId: localLines[baseIndex - 1].id, index: localLines[baseIndex - 1].text.length });
        } else {
          setCursor({ lineId: localLines[baseIndex].id, index: (index - 1) });
        }
        break;
      }
      case "RIGHT": {
        if (baseIndex < localLines.length - 1 && index === localLines[baseIndex].text.length) {
          setCursor({ lineId: localLines[baseIndex + 1].id, index: 0 });
        } else {
          setCursor({ lineId: localLines[baseIndex].id, index: (index + 1) });
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
    setCursor({ lineId, index: index - 1 });
    setLocalLines((previous) => applyDelete(previous, { lineId, index }));
    pushCommit({ method: "DELETE", payload: { lineId, index } });
  };

  const handleBreak = (lineId: string, index: number) => {
    const newLineId = createLineId();
    setCursor({ lineId: newLineId, index: 0 });
    setLocalLines((previous) => applyBreak(previous, { lineId, newLineId, index }));
    pushCommit({ method: "BREAK", payload: { lineId, newLineId, index } });
  };

  const handleFold = (lineId: string) => {
    const movedToIndex = localLines.findIndex(({ id }) => id === lineId) - 1;
    setCursor({ lineId: localLines[movedToIndex].id, index: localLines[movedToIndex].text.length });
    setLocalLines((previous) => applyFold(previous, { lineId }));
    pushCommit({ method: "FOLD", payload: { lineId } });
  };

  return (
    <div>
      {localLines.map(({ id, text }, i) => (
        <Line
          key={id}
          lineId={id}
          text={text}
          cursor={(actualCursor && actualCursor.lineId === id) ? actualCursor.index : null}
          handleSetCursor={(index) => handleSetCursor(id, index)}
          handleMoveCursor={(index, direction) => handleMoveCursor(id, index, direction)}
          handleInsert={(index, text) => handleInsert(id, index, text)}
          handleDelete={(payload) => handleDelete(id, payload)}
          handleBreak={(payload) => handleBreak(id, payload)}
          handleFold={() => i > 0 && handleFold(id)}
        />
      ))}
    </div>
  );
};
