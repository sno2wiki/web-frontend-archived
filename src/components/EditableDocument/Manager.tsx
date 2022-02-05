import { Document } from "./Document";
import { useEditDocument } from "./useEditDocument";

export const Manager: React.VFC<{
  documentId: string;
  userId: string;
}> = ({ documentId, userId }) => {
  const edit = useEditDocument({ documentId, userId });

  return (
    <>
      <p>{edit.online ? "Online" : "Offline"}</p>
      <p>{edit.pushed ? "Pushed" : "Unpushed"}</p>
      <p>you: {userId}</p>
      <Document
        storedLines={edit.lines}
        pushCommit={(data) => edit.pushCommit(data)}
        pushFocus={(data) => edit.pushFocus(data)}
      />
    </>
  );
};
