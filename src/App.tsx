import React from "react";
import { Document } from "./components/Document";

export const App: React.VFC = () => {
  return (
    <div style={{ margin: "32px 64px" }}>
      <Document
        init={[
          {
            lineId: "first",
            text: "こんにちは",
          },
          {
            lineId: "second",
            text: "さようなら",
          },
        ]}
      ></Document>
    </div>
  );
};
