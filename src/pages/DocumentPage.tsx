import { useParams } from "react-router-dom";
import { Document } from "~/components/Document";
import {
  useEditDocument,
  calcDocumentEditEndpoint,
} from "~/hooks/useEditDocument";

export const DocumentPage: React.VFC = () => {
  const { id } = useParams<"id">();
  const edit = useEditDocument(id ? calcDocumentEditEndpoint(id) : undefined);

  return (
    <div style={{ margin: "64px 64px" }}>
      <span>{id}</span>
      {edit.ready && (
        <Document
          initLines={edit.document.lines}
          handleMethod={edit.sendCommit}
        ></Document>
      )}
    </div>
  );
};
