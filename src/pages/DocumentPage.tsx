import { useParams } from "react-router-dom";
import { useAuth } from "~/auth/useAuth";
import { Document } from "~/components/Document";
import { useDocumentEditor as useDocumentEditor } from "~/hooks/useDocumentEditor";

export const EditableDocument: React.VFC<{
  documentId: string;
  userId: string;
}> = ({ documentId: documentId, userId: userId }) => {
  const edit = useDocumentEditor({ documentId, userId });

  return (
    <>
      {edit.ready && (
        <>
          <p>{edit.online ? "Online" : "Offline"}</p>
          <p>{edit.unsynced ? "Unsynced" : "Synched"}</p>
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
