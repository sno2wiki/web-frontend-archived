import { useParams } from "react-router-dom";
import { useAuth } from "~/auth/useAuth";
import { Document } from "~/components/Document";
import { useEditDocument } from "~/hooks/useEditDocument";

export const EditableDocument: React.VFC<{
  documentId: string;
  userId: string;
}> = ({ documentId: documentId, userId: userId }) => {
  const edit = useEditDocument({ documentId, userId });

  return (
    <>
      {edit.ready && (
        <>
          <Document
            initLines={edit.lines}
            handleMethod={edit.sendCommit}
          ></Document>
        </>
      )}
    </>
  );
};

export const DocumentPage: React.VFC = () => {
  const { id } = useParams<"id">();
  const user = useAuth();

  return (
    <div style={{ margin: "64px 64px" }}>
      <span>{id}</span>
      {id && user && (
        <>
          <EditableDocument
            documentId={id}
            userId={user.userId}
          ></EditableDocument>
        </>
      )}
    </div>
  );
};
