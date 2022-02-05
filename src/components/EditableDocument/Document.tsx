import React, { useEffect, useState } from "react";

import { createLineId } from "~/common/generateId";

import { applyBreak, applyDelete, applyFold, applyInsert } from "./edit";
import { Line } from "./Line";
import { CommitData, FocusData, LineType } from "./types";

export const Document: React.VFC<
  {
    storedLines: LineType[];
    pushCommit(data: CommitData): void;
    pushFocus(data: FocusData): void;
  }
> = (
  { storedLines, pushCommit, pushFocus },
) => {
  const [focus, setFocus] = useState<FocusData>();
  const [localLines, setLocalLines] = useState<LineType[]>(storedLines);

  useEffect(() => {
    setLocalLines(storedLines);
  }, [storedLines]);

  const updateFocus = (lineId: string, index: number) => {
    setFocus({ lineId, index });
    pushFocus({ lineId, index });
  };

  const handleMoveCursor = (lineId: string, index: number, direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    const baseIndex = localLines.findIndex((line) => line.id === lineId);
    if (baseIndex === -1) return;

    switch (direction) {
      case "UP": {
        if (baseIndex === 0) {
          updateFocus(localLines[0].id, 0);
        } else {
          updateFocus(
            localLines[baseIndex - 1].id,
            Math.min(localLines[baseIndex - 1].text.length, index),
          );
        }
        break;
      }
      case "DOWN": {
        if (baseIndex === localLines.length - 1) {
          updateFocus(
            localLines[localLines.length - 1].id,
            localLines[localLines.length - 1].text.length,
          );
        } else {
          updateFocus(
            localLines[baseIndex + 1].id,
            Math.min(localLines[baseIndex + 1].text.length, index),
          );
        }
        break;
      }
      case "LEFT": {
        if (0 < baseIndex && index === 0) {
          updateFocus(localLines[baseIndex - 1].id, localLines[baseIndex - 1].text.length);
        } else {
          updateFocus(localLines[baseIndex].id, index - 1);
        }
        break;
      }
      case "RIGHT": {
        if (baseIndex < localLines.length - 1 && index === localLines[baseIndex].text.length) {
          updateFocus(localLines[baseIndex + 1].id, 0);
        } else {
          updateFocus(localLines[baseIndex].id, index + 1);
        }
        break;
      }
    }
  };
  const handleInsert = (lineId: string, index: number, text: string) => {
    updateFocus(lineId, index + text.length);
    setLocalLines((previous) => applyInsert(previous, { lineId, index, text }));
    pushCommit({ method: "INSERT", payload: { lineId, index, text } });
  };

  const handleDelete = (lineId: string, index: number) => {
    updateFocus(lineId, index - 1);
    setLocalLines((previous) => applyDelete(previous, { lineId, index }));
    pushCommit({ method: "DELETE", payload: { lineId, index } });
  };

  const handleBreak = (lineId: string, index: number) => {
    const newLineId = createLineId();
    updateFocus(newLineId, 0);
    setLocalLines((previous) => applyBreak(previous, { lineId, newLineId, index }));
    pushCommit({ method: "BREAK", payload: { lineId, newLineId, index } });
  };

  const handleFold = (lineId: string) => {
    const movedToIndex = localLines.findIndex(({ id }) => id === lineId) - 1;
    updateFocus(localLines[movedToIndex].id, localLines[movedToIndex].text.length);
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
          cursor={focus && (focus.lineId === id) ? focus.index : null}
          handleSetCursor={(index) => updateFocus(id, index)}
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
