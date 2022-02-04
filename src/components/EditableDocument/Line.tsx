import React, { useMemo, useState } from "react";

import { Char } from "./Char";
import { Input } from "./Input";

export const Line: React.VFC<{
  lineId: string;
  text: string;
  focus: boolean;
  handleFocus(payload: { lineId: string; index: number; }): void;
  handleInsert(payload: { lineId: string; index: number; text: string; }): void;
  handleBreak(payload: { lineId: string; index: number; }): void;
  handleFold(payload: { lineId: string; }): void;
  handleDelete(payload: { lineId: string; index: number; }): void;
}> = ({
  lineId,
  text,
  focus,
  handleFocus,
  handleBreak,
  handleInsert,
  handleDelete,
  handleFold,
}) => {
  const [cursor, setCursor] = useState(0);
  const chars = useMemo(
    () => [{ char: "", index: 0 }, ...[...text].map((char, index) => ({ char, index: index + 1 }))],
    [text],
  );

  const handleClickChar = (index: number, positionX: "LEFTER" | "RIGHTER") => {
    const newCursor = positionX === "LEFTER" ? index - 1 : index;
    setCursor(newCursor);
    handleFocus({ lineId, index: newCursor });
  };

  const handleClickEnd = () => {
    const newCursor = text.length;
    setCursor(newCursor);
    handleFocus({ lineId, index: newCursor });
  };

  const handleChange = (index: number, text: string) => {
    const newCursor = cursor + text.length;
    setCursor(() => newCursor);
    handleInsert({ lineId, text, index });
  };

  const handlePressEnter = (index: number, offset: number) => {
    handleBreak({ lineId, index: index + offset });
  };

  const handlePressBackspace = (index: number) => {
    if (cursor === 0) {
      handleFold({ lineId });
    } else {
      const newCursor = index - 1;
      setCursor(() => newCursor);
      handleDelete({ lineId, index });
    }
  };

  const handlePressLeft = (index: number) => {
    if (index === 0) {}
    else {
      const newCursor = cursor - 1;
      setCursor(() => newCursor);
      handleFocus({ lineId, index: newCursor });
    }
  };
  const handlePressRight = (index: number) => {
    if (index === chars.length - 1) {}
    else {
      const newCursor = cursor + 1;
      setCursor(() => newCursor);
      handleFocus({ lineId, index: newCursor });
    }
  };
  const handlePressUp = (index: number) => {};
  const handlePressDown = (index: number) => {};

  return (
    <div id={lineId} style={{ cursor: "text", position: "relative" }}>
      <div
        onClick={() => handleClickEnd()}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />
      {chars.map(({ char, index }) => (
        <span
          key={index}
          style={{ zIndex: 1, position: "relative", display: "inline-block" }}
        >
          <Char
            char={char}
            onClick={(positionX) => handleClickChar(index, positionX)}
          />
          {focus && cursor === index && (
            <Input
              onChange={(text) => handleChange(index, text)}
              onPressEnter={(offset) => handlePressEnter(index, offset)}
              onPressBackspace={() => handlePressBackspace(index)}
              onPressLeft={() => handlePressLeft(index)}
              onPressRight={() => handlePressRight(index)}
              onPressUp={() => handlePressUp(index)}
              onPressDown={() => handlePressDown(index)}
            />
          )}
        </span>
      ))}
    </div>
  );
};
