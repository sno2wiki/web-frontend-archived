import React from "react";

export const Char: React.VFC<{
  char: string;
  onClick(positionX: "LEFTER" | "RIGHTER"): void;
}> = ({ char, onClick }) => {
  return (
    <span
      style={{ display: "inline-block", lineHeight: "1.5em" }}
      onClick={(event) =>
        onClick(
          ((event.pageX - event.currentTarget.offsetLeft) / event.currentTarget.offsetWidth) < 0.5
            ? "LEFTER"
            : "RIGHTER",
        )}
    >
      {char}
    </span>
  );
};
