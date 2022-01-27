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
      unsynced: boolean;
    } => {
  const wsRef = useRef<WebSocket>();
  const wsMonitorRef = useRef<NodeJS.Timer>();
  const [online, setOnline] = useState(false);

  const syncCommitsTimeoutRef = useRef<NodeJS.Timer>();
  const [unsynced, setUnsynched] = useState(false);

  const [lines, setLines] = useState<Lines>();
  const [commits, setCommits] = useState<CommitType[]>([]);

  useEffect(() => {
    if (wsRef.current) wsRef.current.close();
    if (wsMonitorRef.current) clearInterval(wsMonitorRef.current);

    wsRef.current = new WebSocket(calcDocumentEditEndpoint(documentId));
    wsRef.current.addEventListener("open", () => {
      setOnline(true);
      wsMonitorRef.current = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN)
          setOnline(false);
      }, 250);
    });
    wsRef.current.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.method === "INIT") {
        const payload = data.payload;

        setLines(payload.lines);

        const joinCommit: JoinCommitType = {
          type: "JOIN",
          commitId: createCommitId(),
          previousCommitId: payload.latestCommit.commitId,
          userId,
        };
        setCommits((previousCommits) => [joinCommit, ...previousCommits]);
      }
    });
  }, [documentId, userId, online]);

  const sendCommit = (payload: EditData) => {
    const editCommit: EditCommitType = {
      type: "EDIT",
      commitId: createCommitId(),
      previousId: commits[0].commitId,
      userId,
    };
    setCommits((previousCommits) => [editCommit, ...previousCommits]);

    if (syncCommitsTimeoutRef.current)
      clearTimeout(syncCommitsTimeoutRef.current);
    setUnsynched(true);
    syncCommitsTimeoutRef.current = setTimeout(() => {
      if (wsRef.current) {
        wsRef.current.send(
          JSON.stringify({ method: "SYNC_COMMITS", payload: { commits } })
        );
        setUnsynched(false);
      }
    }, 1000);
  };

  if (!!wsRef.current && lines && commits.length !== 0) {
    return {
      ready: true,
      sendCommit: sendCommit,
      lines: lines,
      online: online,
      unsynced: unsynced,
    };
  } else {
    return {
      ready: false,
    };
  }
};
