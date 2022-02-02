import { Document } from "./Document";
import { useEditDocument as useEditDocument } from "./useEditDocument";

export const Manager: React.VFC<{
  documentId: string;
  userId: string;
}> = ({ documentId: documentId, userId: userId }) => {
  const edit = useEditDocument({ documentId, userId });

  return (
    <>
      {!edit.ready && (
        <>
          <p>Loading</p>
        </>
      )}
      {edit.ready && (
        <>
          <p>{edit.online ? "Online" : "Offline"}</p>
          <p>{edit.pushed ? "Pushed" : "Unpushed"}</p>
          <Document storedLines={edit.lines} pushCommit={edit.pushCommit} />
        </>
      )}
    </>
  );
};
