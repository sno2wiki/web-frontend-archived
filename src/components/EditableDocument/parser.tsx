import React from "react";

export const parser = (sentence: string): { Wrapper: React.FC; text: string; offset: number; }[] => {
  return [
    {
      Wrapper: ({ children }) => <span style={{ display: "inline-block" }}>{children}</span>,
      offset: 1,
      text: sentence,
    },
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
