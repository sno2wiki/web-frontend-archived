import React, { useMemo } from "react";
import { Char } from "./Char";
import { Input } from "./Input";
import { CaptureData } from "./types";

export const Line: React.VFC<{
  lineId: string;
  text: string;
  cursor: null | number;
  handleCapture: (data: CaptureData) => void;
}> = ({ lineId, text, handleCapture, cursor }) => {
  const chars = useMemo(
    () => [
      { char: "", index: 0 },
      ...text.split("").map((char, index) => ({ char, index: index + 1 })),
    ],
    [text]
  );

  const handleClick = (index: number, positionX: "LEFTER" | "RIGHTER") => {
    handleCapture({
      method: "FOCUS",
      payload: { lineId, index: positionX === "LEFTER" ? index - 1 : index },
    });
  };

  return (
    <div id={lineId} style={{ cursor: "text" }}>
      {chars.map(({ char, index }) => (
        <span key={index} style={{ display: "inline-block" }}>
          <Char
            char={char}
            onClick={(positionX) => handleClick(index, positionX)}
          />
          {cursor === index && (
            <Input
              onChange={(text) =>
                handleCapture({
                  method: "INSERT",
                  payload: { lineId, text: text, index: index },
                })
              }
              onPressEnter={(offset) => {
                handleCapture({
                  method: "BREAK",
                  payload: { lineId, index: index + offset },
                });
              }}
              onPressBackspace={() => {
                if (cursor === 0)
                  handleCapture({
                    method: "FOLD",
                    payload: { lineId },
                  });
                else
                  handleCapture({
                    method: "DELETE",
                    payload: { lineId, index: index },
                  });
              }}
            ></Input>
          )}
        </span>
      ))}
    </div>
  );
};
