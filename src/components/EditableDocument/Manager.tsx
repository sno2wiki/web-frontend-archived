import { Document } from "./Document";
import { useEditDocument } from "./useEditDocument";

export const Manager: React.VFC<{
  documentId: string;
  userId: string;
}> = ({ documentId, userId }) => {
  const { online, pushCommit, pushFocus, pushed, lines, focuses } = useEditDocument({ documentId, userId });

  return (
    <>
      <div style={{}}>
        <p>{documentId}</p>
        <p>{online ? "Online" : "Offline"}</p>
        <p>{pushed ? "Pushed" : "Unpushed"}</p>
        <p>you: {userId}</p>
      </div>
      <Document
        storedLines={lines}
        focuses={focuses}
        pushCommit={(data) => pushCommit(data)}
        pushFocus={(data) => pushFocus(data)}
      />
    </>
  );
};
