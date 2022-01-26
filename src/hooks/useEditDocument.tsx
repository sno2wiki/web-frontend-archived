import { useEffect, useRef, useState } from "react";
import { createCommitId } from "~/generators/id";
import { DocumentType, EditData } from "~/types";

export const calcDocumentEditEndpoint = (id: string) =>
  "ws://0.0.0.0:8000/docs/" + id + "/edit";

export const useEditDocument = (
  endpoint: string | undefined
):
  | {
      ready: false;
      document: undefined;
    }
  | {
      ready: true;
      document: DocumentType;
      sendCommit: (editData: EditData) => void;
    } => {
  const wsRef = useRef<WebSocket>();

  const [document, setDocuments] = useState<DocumentType>();
  const [previousCommit, setPreviousCommit] = useState<{ commmitId: string }>();

  useEffect(() => {
    if (!endpoint) return;

    wsRef.current = new WebSocket(endpoint);
    wsRef.current.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.method === "INIT") {
        const payload = data.payload;
        setDocuments(payload.document);
        setPreviousCommit(payload.latestCommit);
      }
    });
  }, [endpoint]);

  const sendCommit = (payload: EditData) => {
    if (!wsRef.current) return;
    if (!previousCommit) return;

    const previousCommitId = previousCommit.commmitId;
    const newCommitId = createCommitId();

    wsRef.current.send(
      JSON.stringify({
        previousCommitId: previousCommitId,
        newCommitId,
        payload,
      })
    );
    setPreviousCommit(() => ({ commmitId: newCommitId }));
  };

  if (!!wsRef.current && !!document && !!previousCommit) {
    return {
      ready: true,
      document,
      sendCommit: sendCommit,
    };
  } else {
    return {
      ready: false,
      document: undefined,
    };
  }
};
