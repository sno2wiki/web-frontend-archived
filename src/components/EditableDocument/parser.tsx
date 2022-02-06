import { css, cx } from "@emotion/css";
import React from "react";

export const Plain: React.FC<{ className?: string; }> = ({ className, children }) => (
  <span className={cx(className, css({ fontWeight: "bold" }))}>
    {children}
  </span>
);
export const Bold: React.FC<{ className?: string; }> = ({ className, children }) => (
  <strong className={cx(className, css({ fontWeight: "bold" }))}>
    {children}
  </strong>
);
export const Link: React.FC<{ className?: string; }> = ({ className, children }) => (
  <i className={cx(className, css({ textDecoration: "underline" }))}>
    {children}
  </i>
);

export const parser = (
  sentence: string,
): { Wrapper: React.FC<{ className?: string; }>; text: string; offset: number; }[] => {
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
