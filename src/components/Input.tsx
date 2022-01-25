import React, { useEffect, useRef, useState } from "react";
import { useMeasure } from "react-use";

export const Input: React.VFC<{
  onChange(input: string): void;
  onPressBackspace(): void;
  onPressEnter(offset: number): void;
}> = ({ onChange, onPressEnter: onPressEnter, onPressBackspace }) => {
  const [input, setInput] = useState("");

  const [placeholderRef, { width }] = useMeasure<HTMLDivElement>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef.current]);

  useEffect(() => {
    onChange(input);
  }, [input]);

  return (
    <span
      style={{ display: "inline", lineHeight: "1.5em", position: "relative" }}
    >
      <span
        ref={placeholderRef}
        style={{
          height: "100%",
          display: "inline-block",
        }}
      >
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
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        onKeyDown={(e) => {
          if (input.length === 0 && e.key === "Backspace") onPressBackspace();
          else if (e.key === "Enter") onPressEnter(input.length);
        }}
      ></input>
    </span>
  );
};
