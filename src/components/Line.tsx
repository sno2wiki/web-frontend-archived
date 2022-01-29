import React, { useMemo, useState } from "react";
import {
  BreakPayload,
  DeletePayload,
  EditData,
  FocusPayload,
  FoldPayload,
  InsertPayload,
} from "~/types";
import { Char } from "./Char";
import { Input } from "./Input";

export const Line: React.VFC<{
  lineId: string;
  text: string;
  focus: boolean;
  handleFocus(payload: FocusPayload): void;
  handleInsert(payload: InsertPayload): void;
  handleBreak(payload: BreakPayload): void;
  handleFold(payload: FoldPayload): void;
  handleDelete(payload: DeletePayload): void;
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
    () => [
      { char: "", index: 0 },
      ...text.split("").map((char, index) => ({ char, index: index + 1 })),
    ],
    [text]
  );

  const handleClickEnd = () => {
    setCursor(text.length);
    handleFocus({ lineId });
  };

  const handleClick = (index: number, positionX: "LEFTER" | "RIGHTER") => {
    setCursor(positionX === "LEFTER" ? index - 1 : index);
    handleFocus({ lineId });
  };

  const handleChange = (text: string, index: number) => {
    handleInsert({ lineId, text: text, index: index });
    setCursor((cursor) => cursor + text.length);
  };

  return (
    <div id={lineId} style={{ cursor: "text", position: "relative" }}>
      <div
        onClick={() => handleClickEnd()}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      ></div>
      {chars.map(({ char, index }) => (
        <span
          key={index}
          style={{ zIndex: 1, position: "relative", display: "inline-block" }}
        >
          <Char
            char={char}
            onClick={(positionX) => handleClick(index, positionX)}
          />
          {focus && cursor === index && (
            <Input
              onChange={(text) => handleChange(text, index)}
              onPressEnter={(offset) => {
                handleBreak({ lineId, index: index + offset });
              }}
              onPressBackspace={() => {
                if (cursor === 0) handleFold({ lineId });
                else handleDelete({ lineId, index });
              }}
            ></Input>
          )}
        </span>
      ))}
    </div>
  );
};
