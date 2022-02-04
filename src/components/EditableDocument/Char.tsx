import React from "react";

export const calcClickSide = (per: number) => per < 0.5 ? "LEFTER" : "RIGHTER";

export const Char: React.VFC<{
  char: string;
  onClick(positionX: "LEFTER" | "RIGHTER"): void;
}> = ({ char, onClick }) => {
  return (
    <span
      style={{ display: "inline-block", lineHeight: "1.5em" }}
      onClick={(event) => {
        onClick(
          calcClickSide(
            (event.pageX - event.currentTarget.offsetLeft) / event.currentTarget.offsetWidth,
          ),
        );
      }}
    >
      {char}
    </span>
  );
};
