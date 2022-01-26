import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Document, Lines } from "~/components/Document";
import { CaptureData } from "~/components/types";
import { createCommitId } from "~/generators/id";

export const calcDocumentEditEndpoint = (id: string) =>
  "ws://0.0.0.0:8000/docs/" + id + "/edit";

export type Document = {
  lines: Lines;
};

export const useEdit = (
  endpoint: string | undefined
):
  | {
      ready: false;
      document: undefined;
    }
  | {
      ready: true;
      document: Document;
      sendCommit: (payload: CaptureData) => void;
    } => {
  const wsRef = useRef<WebSocket>();

  const [document, setDocuments] = useState<Document>();
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

  const sendCommit = (payload: CaptureData) => {
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

export const DocumentPage: React.VFC = () => {
  const { id } = useParams<"id">();
  const edit = useEdit(id ? calcDocumentEditEndpoint(id) : undefined);

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
