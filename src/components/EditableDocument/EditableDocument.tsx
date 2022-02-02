import { useEditDocument as useEditDocument } from "~/hooks/useEditDocument";

import { Document } from "./Document";

export const EditableDocument: React.VFC<{
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
          <p>{edit.synced ? "Synched" : "Unsynced"}</p>
          <Document
            storedLines={edit.lines}
            pushCommit={edit.pushCommit}
            synced={edit.synced}
          />
        </>
      )}
    </>
  );
};
