import React, { useEffect, useRef, useState } from "react";
import { useMeasure } from "react-use";

export const Input: React.VFC<{
  onChange(input: string): void;
  onPressBackspace(): void;
  onPressEnter(offset: number): void;
  onPressLeft(): void;
  onPressRight(): void;
  onPressUp(): void;
  onPressDown(): void;
}> = (
  { onChange, onPressEnter, onPressBackspace, onPressLeft, onPressDown, onPressRight, onPressUp },
) => {
  const [input, setInput] = useState("");
  const [decided, setDecided] = useState(true);

  const [placeholderRef, { width }] = useMeasure<HTMLDivElement>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (input !== "" && decided) onChange(input);
  }, [decided, input, onChange]);

  return (
    <span style={{ display: "inline", lineHeight: "1.5em", position: "relative" }}>
      <span ref={placeholderRef} style={{ display: "inline-block" }}>{input}</span>
      <input
        ref={inputRef}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: Math.max(1, width),
          lineHeight: "1.5em",
          backgroundColor: "#00000022",
          color: "transparent",
        }}
        onKeyDown={(event) => {
          switch (event.key) {
            case "Backspace":
              if (input.length === 0) onPressBackspace();
              break;
            case "Enter":
              onPressEnter(input.length);
              break;
            case "ArrowLeft":
              onPressLeft();
              break;
            case "ArrowRight":
              onPressRight();
              break;
            case "ArrowUp":
              onPressUp();
              break;
            case "ArrowDown":
              onPressDown();
              break;
          }
        }}
        onChange={(event) => {
          setInput(event.target.value);
        }}
        onCompositionStart={() => {
          setDecided(false);
        }}
        onCompositionEnd={() => {
          setDecided(true);
        }}
      />
    </span>
  );
};
