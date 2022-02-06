import { useParams } from "react-router-dom";

import { useAuth } from "~/auth/useAuth";
import { EditableDocument } from "~/components/EditableDocument";

export const DocumentPage: React.VFC = () => {
  const { id } = useParams<"id">();
  const user = useAuth();

  return (
    <div>
      {id && user && (
        <>
          <EditableDocument documentId={id} userId={user.userId} />
        </>
      )}
    </div>
  );
};
