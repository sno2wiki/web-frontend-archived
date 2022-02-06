import React from "react";

export const Plain: React.FC = ({ children }) => (
  <span style={{ display: "inline", userSelect: "none", fontSize: "1rem" }}>
    {children}
  </span>
);
export const Bold: React.FC = ({ children }) => (
  <strong style={{ display: "inline", userSelect: "none", fontSize: "1.75rem", fontWeight: "bold" }}>
    {children}
  </strong>
);
export const Link: React.FC = ({ children }) => (
  <i style={{ display: "inline", userSelect: "none", fontSize: "1rem", "textDecoration": "underline" }}>
    {children}
  </i>
);

export const parser = (sentence: string): { Wrapper: React.FC; text: string; offset: number; }[] => {
  return [
    { Wrapper: Plain, offset: 1, text: sentence.slice(0, 2) },
    { Wrapper: Bold, offset: 3, text: sentence.slice(2, 4) },
    { Wrapper: Link, offset: 5, text: sentence.slice(4) },
    /*
    {
      wrapper: ({ children }) => <strong>{children}</strong>,
    },
    {
      wrapper: ({ children }) => <i>{children}</i>,
    },
    {
      wrapper: ({ children }) => <a>{children}</a>,
    },
    */
  ];
};
