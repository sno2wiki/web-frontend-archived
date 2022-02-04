import React, { useMemo } from "react";

import { Char } from "./Char";
import { Input } from "./Input";

export const Line: React.VFC<{
  lineId: string;
  text: string;
  cursor: number | null;
  handleSetCursor(index: number): void;
  handleMoveCursor(index: number, type: "UP" | "DOWN" | "LEFT" | "RIGHT"): void;
  handleInsert(index: number, text: string): void;
  handleBreak(index: number): void;
  handleFold(): void;
  handleDelete(index: number): void;
}> = ({
  lineId,
  text,
  cursor,
  handleSetCursor,
  handleBreak,
  handleInsert,
  handleDelete,
  handleFold,
  handleMoveCursor,
}) => {
  const chars = useMemo(
    () => [{ char: "", index: 0 }, ...[...text].map((char, index) => ({ char, index: index + 1 }))],
    [text],
  );

  const handlePressBackspace = (index: number) => {
    if (cursor === 0) handleFold();
    else handleDelete(index);
  };

  return (
    <div id={lineId} style={{ cursor: "text", position: "relative" }}>
      <div
        onClick={() => handleSetCursor(text.length)}
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />
      {chars.map(({ char, index }) => (
        <span
          key={index}
          style={{ zIndex: 1, position: "relative", display: "inline-block" }}
        >
          <Char char={char} onClick={(positionX) => handleSetCursor(positionX === "LEFTER" ? index - 1 : index)} />
          {(cursor === index) && (
            <Input
              onChange={(text) => handleInsert(index, text)}
              onPressEnter={(offset) => handleBreak(index + offset)}
              onPressLeft={() => handleMoveCursor(index, "LEFT")}
              onPressRight={() => handleMoveCursor(index, "RIGHT")}
              onPressUp={() => handleMoveCursor(index, "UP")}
              onPressDown={() => handleMoveCursor(index, "DOWN")}
              onPressBackspace={() => handlePressBackspace(index)}
            />
          )}
        </span>
      ))}
    </div>
  );
};
