import { useEffect, useRef, useState } from "react";
import { createCommitId } from "~/generators/id";
import { EditData, Lines } from "~/types";

export const calcDocumentEditEndpoint = (id: string) =>
  "ws://0.0.0.0:8000/docs/" + id + "/edit";

export type JoinCommitType = {
  type: "JOIN";
  commitId: string;
  previousCommitId: string;
  userId: string;
};
export type EditCommitType = {
  type: "EDIT";
  commitId: string;
  previousId: string;
  userId: string;
  data: EditData;
};
export type CommitType = JoinCommitType | EditCommitType;

export const useDocumentEditor = ({
  documentId,
  userId,
}: {
  documentId: string;
  userId: string;
}):
  | { ready: false }
  | {
    ready: true;
    sendCommit: (editData: EditData) => void;
    lines: Lines;
    online: boolean;
    synced: boolean;
  } => {
  const wsRef = useRef<WebSocket>();
  const wsMonitorRef = useRef<NodeJS.Timer>();
  const [online, setOnline] = useState(false);

  const syncCommitsTimeoutRef = useRef<NodeJS.Timer>();
  const [synced, setSynced] = useState(false);

  const [lines, setLines] = useState<Lines>();
  const [commits, setCommits] = useState<CommitType[]>([]);

  useEffect(() => {
    if (wsRef.current) wsRef.current.close();
    if (wsMonitorRef.current) clearInterval(wsMonitorRef.current);

    wsRef.current = new WebSocket(calcDocumentEditEndpoint(documentId));
    wsRef.current.addEventListener("open", () => {
      setOnline(true);
      wsMonitorRef.current = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
          setOnline(false);
        }
      }, 250);
    });
    wsRef.current.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);


      if (data.method === "PULL_DOCUMENT") {
        const payload = data.payload;
        const document = payload.document;

        console.dir(document)

        setSynced(true);
        setLines(document.lines);
        setCommits(() => [{ commitId: document.latestCommitId }]);
      }
    });
  }, [documentId, userId, online]);

  const sendCommit = (payload: EditData) => {
    const editCommit: EditCommitType = {
      type: "EDIT",
      commitId: createCommitId(),
      previousId: commits[0].commitId,
      userId,
      data: payload,
    };
    setCommits((previousCommits) => [...previousCommits, editCommit]);

    if (syncCommitsTimeoutRef.current) {
      clearTimeout(syncCommitsTimeoutRef.current);
    }
    setSynced(false);
    syncCommitsTimeoutRef.current = setTimeout(() => {
      if (wsRef.current) {
        wsRef.current.send(
          JSON.stringify({ method: "PUSH_COMMITS", payload: { commits } })
        );
        setSynced(true);
      }
    }, 250);
  };

  if (!!wsRef.current && lines && commits.length !== 0) {
    return {
      ready: true,
      sendCommit: sendCommit,
      lines: lines,
      online: online,
      synced: synced,
    };
  } else {
    return {
      ready: false,
    };
  }
};
