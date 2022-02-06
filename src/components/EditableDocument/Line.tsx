import React, { Fragment, useMemo, useState } from "react";

import { parser } from "./parser";

export const Line: React.VFC<{
  lineId: string;
  text: string;
  cursor: number | null;
  selecting: boolean;
  range: null | [number, number];
  handleSetCursor(index: number): void;
  handleMoveCursor(index: number, type: "UP" | "DOWN" | "LEFT" | "RIGHT"): void;
  handleInsert(index: number, text: string): void;
  handleBreak(index: number): void;
  handleFold(): void;
  handleDelete(index: number): void;

  setRangeStart(charIndex: number /* left: number, top: number*/): void;
  setRangeEnd(charIndex: number /* left: number, top: number */): void;
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
  setRangeEnd,
  setRangeStart,
  selecting,
  range,
}) => {
  const chars = useMemo(
    () => [{ char: "", index: 0 }, ...[...text].map((char, index) => ({ char, index: index + 1 }))],
    [text],
  );

  const parsed = useMemo(() => parser(text), [text]);
  const [rects, setRects] = useState<{ left: number; top: number; width: number; height: number; }[]>([]);

  const handlePressBackspace = (index: number) => {
    if (cursor === 0) handleFold();
    else handleDelete(index);
  };

  return (
    <div
      id={lineId}
      style={{ position: "relative" }}
      onMouseDown={(event) => {
        const offsetX = event.nativeEvent.offsetX, offsetY = event.nativeEvent.offsetY;
        const index = rects.findIndex(
          ({ left, width, top, height }) =>
            left <= offsetX && offsetX < left + width && top <= offsetY && offsetY < top + height,
        );
        if (index === -1) return;
        setRangeStart(index + 1);
      }}
      onMouseUp={(event) => {
        const offsetX = event.nativeEvent.offsetX, offsetY = event.nativeEvent.offsetY;
        const index = rects.findIndex(
          ({ left, width, top, height }) =>
            left <= offsetX && offsetX < left + width && top <= offsetY && offsetY < top + height,
        );
        if (index === -1) return;
        setRangeEnd(index + 1);
      }}
    >
      {cursor && rects[cursor - 1] && (
        <div
          style={{
            position: "absolute",
            zIndex: 0,
            top: rects[cursor - 1].top,
            left: rects[cursor - 1].left + rects[cursor - 1].width,
            height: rects[cursor - 1].height,
            borderLeft: "1px solid black",
          }}
        >
        </div>
      )}
      <p style={{ cursor: "text", lineHeight: "1.5em", position: "relative", zIndex: 1 }}>
        {parsed.map(({ Wrapper, offset: index, text }) => (
          <Wrapper key={`${lineId}-${index}`}>
            {[...text].map((char, charIndex) => (
              <Fragment key={`${lineId}-${index + charIndex}`}>
                <span
                  char-index={`${lineId}-${index + charIndex}`}
                  ref={(node) => {
                    if (!node) return;
                    setRects(() => {
                      rects[index + charIndex - 1] = {
                        left: node.offsetLeft,
                        top: node.offsetTop,
                        width: node.offsetWidth,
                        height: node.offsetHeight,
                      };
                      return rects;
                    });
                  }}
                  style={{
                    display: "inline-block",
                    background: (range && range[0] <= index + charIndex && index + charIndex <= range[1])
                      ? "#F008"
                      : undefined,
                  }}
                >
                  {char}
                </span>
              </Fragment>
            ))}
          </Wrapper>
        ))}
        {
          /*
      chars.map(({ char, index }) => (
        <div
          key={index}
          style={{ zIndex: 1, position: "relative", whiteSpace: "pre-wrap", display: "inline" }}
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
        </div>
      ))
    */
        }
      </p>
    </div>
  );
};
