import React, { useEffect, useRef, useState } from "react";
import { useMeasure } from "react-use";

export const Input: React.VFC<{
  onChange(input: string): void;
  onPressBackspace(): void;
  onPressEnter(offset: number): void;
}> = ({ onChange, onPressEnter: onPressEnter, onPressBackspace }) => {
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
    <span
      style={{ display: "inline", lineHeight: "1.5em", position: "relative" }}
    >
      <span ref={placeholderRef} style={{ display: "inline-block" }}>
        {input}
      </span>
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
        onKeyDown={(e) => {
          if (input.length === 0 && e.key === "Backspace") onPressBackspace();
          if (e.key === "Enter") onPressEnter(input.length);
        }}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        onCompositionStart={(e) => {
          setDecided(false);
        }}
        onCompositionEnd={(e) => {
          setDecided(true);
        }}
      />
    </span>
  );
};
