import { css } from "@emotion/css";
import React, { useEffect, useState } from "react";

import { createLineId } from "~/common/generateId";

import { applyBreak, applyDelete, applyFold, applyInsert } from "./edit";
import { Line } from "./Line";
import { CommitData, FocusData, LineType } from "./types";

export const Document: React.VFC<{
  storedLines: LineType[];
  pushCommit(data: CommitData): void;
  pushFocus(data: FocusData): void;
}> = ({ storedLines, pushCommit, pushFocus }) => {
  const [localLines, setLocalLines] = useState<LineType[]>(storedLines);

  const [focus, setFocus] = useState<{ lineId: string; index: number; }>();
  const [range, setRange] = useState<
    [[number, number], [number, number]] | null
  >(null);

  useEffect(() => {
    setLocalLines(storedLines);
  }, [storedLines]);

  useEffect(() => {
    const selection = document.getSelection();
    const handleSelection = () => {
      if (!selection) return;

      const {
        anchorNode,
        focusNode,
        anchorOffset: fromOffset,
        focusOffset: toOffset,
      } = selection;
      const fromWordBlock = anchorNode?.parentElement?.getAttribute("char-index");
      const toWordBlock = focusNode?.parentElement?.getAttribute("char-index");

      //  console.log(anchorNode?.nodeName, focusNode?.nodeName);

      if (!fromWordBlock || !toWordBlock) return;

      const [fromLineId, fromIndexString] = fromWordBlock.split("-");
      const fromIndex = Number.parseInt(fromIndexString, 10);
      const fromLineIndex = localLines.findIndex(({ id }) => id === fromLineId);

      const [toLineId, toIndexString] = toWordBlock.split("-");
      const toIndex = Number.parseInt(toIndexString, 10);
      const toLineIndex = localLines.findIndex(({ id }) => id === toLineId);

      if (fromLineIndex === -1 || toLineIndex === -1) return;

      if (fromLineIndex === toLineIndex) {
        if (fromIndex == toIndex) {
          setRange(null);
          setFocus({ lineId: toLineId, index: toIndex });
        } else if (fromIndex < toIndex) {
          setRange([
            [fromLineIndex, fromIndex + fromOffset],
            [toLineIndex, toIndex + toOffset - 1],
          ]);
          setFocus({ lineId: toLineId, index: toIndex + toOffset - 1 });
        } else {
          setRange([
            [toLineIndex, toIndex + toOffset],
            [fromLineIndex, fromIndex + fromOffset - 1],
          ]);
          setFocus({ lineId: toLineId, index: toIndex + toOffset - 1 });
        }
      } else if (fromLineIndex < toLineIndex) {
        setRange([
          [fromLineIndex, fromIndex + fromOffset],
          [toLineIndex, toIndex + toOffset - 1],
        ]);
        setFocus({ lineId: toLineId, index: toIndex + toOffset - 1 });
      } else {
        setRange([
          [toLineIndex, toIndex + toOffset],
          [fromLineIndex, fromIndex + fromOffset - 1],
        ]);
        setFocus({ lineId: toLineId, index: toIndex + toOffset - 1 });
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, [localLines]);

  const updateFocus = (lineId: string, index: number) => {
    setFocus({ lineId, index });
    pushFocus({ lineId, index });
  };

  const handleMoveCursor = (
    lineId: string,
    index: number,
    direction: "UP" | "DOWN" | "LEFT" | "RIGHT",
  ) => {
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
          updateFocus(
            localLines[baseIndex - 1].id,
            localLines[baseIndex - 1].text.length,
          );
        } else {
          updateFocus(localLines[baseIndex].id, index - 1);
        }
        break;
      }
      case "RIGHT": {
        if (
          baseIndex < localLines.length - 1
          && index === localLines[baseIndex].text.length
        ) {
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
    updateFocus(
      localLines[movedToIndex].id,
      localLines[movedToIndex].text.length,
    );
    setLocalLines((previous) => applyFold(previous, { lineId }));
    pushCommit({ method: "FOLD", payload: { lineId } });
  };

  return (
    <div className={css({ position: "relative" })}>
      {localLines.map(({ id: lineId, text }, i) => (
        <Line
          key={lineId}
          lineId={lineId}
          text={text}
          range={range && range[0][0] <= i && i <= range[1][0]
            ? [
              range[0][0] === i ? range[0][1] : 1,
              range[1][0] === i ? range[1][1] : text.length,
            ]
            : null}
          cursor={focus && focus.lineId === lineId ? focus.index : null}
          handleSetCursor={(index) => updateFocus(lineId, index)}
          handleMoveCursor={(index, direction) => handleMoveCursor(lineId, index, direction)}
          handleInsert={(index, text) => handleInsert(lineId, index, text)}
          handleDelete={(payload) => handleDelete(lineId, payload)}
          handleBreak={(payload) => handleBreak(lineId, payload)}
          handleFold={() => i > 0 && handleFold(lineId)}
        />
      ))}
    </div>
  );
};
