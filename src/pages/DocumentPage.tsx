import { useParams } from "react-router-dom";

import { useAuth } from "~/auth/useAuth";
import { EditableDocument } from "~/components/EditableDocument";

export const DocumentPage: React.VFC = () => {
  const { id } = useParams<"id">();
  const user = useAuth();

  return (
    <div style={{ margin: "64px 64px" }}>
      <span>{id}</span>
      {id && user && (
        <>
          <EditableDocument documentId={id} userId={user.userId} />
        </>
      )}
    </div>
  );
};
