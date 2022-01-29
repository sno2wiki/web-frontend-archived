import { useEffect, useRef, useState } from "react";
import { createCommitId } from "~/generators/id";
import { EditData, Lines } from "~/types";

export const calcDocumentEditEndpoint = (id: string) =>
  "ws://0.0.0.0:8000/docs/" + id + "/edit";


export type EditCommitType = {
  commitId: string;
  previousCommitId: string;
  type: "EDIT";
  data: EditData;
};

export type InitCommitType = {
  commitId: string;
  previousCommitId: null;
  type: "INIT";
};
export type CommitUnion = InitCommitType | EditCommitType;

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
    online: boolean;
    synced: boolean;
    lines: { lineId: string; nextLineId: string; text: string; }[];
    sendCommit(editData: EditData): void;
  } => {
  const wsRef = useRef<WebSocket>();
  const wsMonitorRef = useRef<NodeJS.Timer>();
  const [online, setOnline] = useState(false);

  const syncCommitsTimeoutRef = useRef<NodeJS.Timer>();
  const [synced, setSynced] = useState(false);

  const [lines, setLines] = useState<{ lineId: string; nextLineId: string; text: string; }[]>();
  const [commits, setCommits] = useState<CommitUnion[]>([]);

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
        setCommits(() => [{ type: "INIT", previousCommitId: null, commitId: document.latestCommitId }]);
      }
    });
  }, [documentId, userId, online]);

  const sendCommit = (payload: EditData) => {
    if (syncCommitsTimeoutRef.current) clearTimeout(syncCommitsTimeoutRef.current);

    const editCommit: EditCommitType = {
      type: "EDIT",
      commitId: createCommitId(),
      previousCommitId: commits[0].commitId,
      // userId,
      data: payload,
    };
    setCommits((previousCommits) => [editCommit, ...previousCommits]);

    setSynced(false);
    syncCommitsTimeoutRef.current = setTimeout(() => {
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ method: "PUSH_COMMITS", payload: { commits: commits.reverse() } }));
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
