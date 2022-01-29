import React, { useMemo } from "react";
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
  cursor: null | number;
  handleFocus(payload: FocusPayload): void;
  handleInsert(payload: InsertPayload): void;
  handleBreak(payload: BreakPayload): void;
  handleFold(payload: FoldPayload): void;
  handleDelete(payload: DeletePayload): void;
}> = ({
  lineId,
  text,
  cursor,
  handleFocus,
  handleBreak,
  handleInsert,
  handleDelete,
  handleFold,
}) => {
  const chars = useMemo(
    () => [
      { char: "", index: 0 },
      ...text.split("").map((char, index) => ({ char, index: index + 1 })),
    ],
    [text]
  );

  const handleClickEnd = () => {
    handleFocus({ lineId, index: text.length });
  };

  const handleClick = (index: number, positionX: "LEFTER" | "RIGHTER") => {
    handleFocus({ lineId, index: positionX === "LEFTER" ? index - 1 : index });
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
          {cursor === index && (
            <Input
              onChange={(text) =>
                handleInsert({ lineId, text: text, index: index })
              }
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
