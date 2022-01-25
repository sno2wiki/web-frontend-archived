import { Document } from "~/components/Document";
import { createLineId } from "~/generators/id";

export const DocumentPage: React.VFC = () => {
  return (
    <div style={{ margin: "64px 64px" }}>
      <Document
        init={[
          { lineId: "HrDGomB1rWj4BJDj", text: "こんにちは" },
          { lineId: "oK0DdnEBonHF92U5", text: "さようなら" },
        ]}
      ></Document>
    </div>
  );
};
