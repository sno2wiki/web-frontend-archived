import React from "react";

export const calcClickSide = (per: number) => per < 0.5 ? "LEFTER" : "RIGHTER";

export const Char: React.VFC<{
  char: string;
  onClick(positionX: "LEFTER" | "RIGHTER"): void;
}> = ({ char, onClick }) => {
  return (
    <span
      style={{ display: "inline-block", lineHeight: "1.5em" }}
      onClick={(e) => {
        onClick(
          calcClickSide(
            (e.pageX - e.currentTarget.offsetLeft) / e.currentTarget.offsetWidth,
          ),
        );
      }}
    >
      {char}
    </span>
  );
};
