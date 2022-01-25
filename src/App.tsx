import React from "react";
import { Document } from "./components/Document";

export const App: React.VFC = () => {
  return (
    <div style={{ margin: "32px 64px" }}>
      <Document
        init={[
          { lineId: "HrDGomB1rWj4BJDj", text: "こんにちは" },
          { lineId: "oK0DdnEBonHF92U5", text: "さようなら" },
        ]}
      ></Document>
    </div>
  );
};
