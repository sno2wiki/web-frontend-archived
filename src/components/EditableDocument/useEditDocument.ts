import { useEffect, useRef, useState } from "react";

import { calcEditDocumentEndpoint } from "~/common/endpoints";
import { createCommitId } from "~/common/generateId";

export type InsertPayload = { lineId: string; index: number; text: string; };
export type BreakPayload = { lineId: string; index: number; newLineId: string; };
export type DeletePayload = { lineId: string; index: number; };
export type FoldPayload = { lineId: string; };

export type CommitData =
  | { method: "INSERT"; payload: InsertPayload; }
  | { method: "BREAK"; payload: BreakPayload; }
  | { method: "DELETE"; payload: DeletePayload; }
  | { method: "FOLD"; payload: FoldPayload; };

export type EditCommitType = {
  commitId: string;
  data: CommitData;
};

export const useEditDocument = (
  { documentId, userId }: { documentId: string; userId: string; },
):
  | { ready: false; }
  | {
    ready: true;
    online: boolean;
    pushed: boolean;
    lines: { id: string; text: string; }[];
    pushCommit(commitData: CommitData): void;
  } =>
{
  const wsRef = useRef<WebSocket>();
  const wsMonitorRef = useRef<NodeJS.Timer>();
  const [online, setOnline] = useState(false);

  const syncCommitsTimeoutRef = useRef<NodeJS.Timer>();
  const [pushed, setPushed] = useState(false);

  const [lines, setLines] = useState<{ id: string; text: string; }[]>([]);
  const [commits, setCommits] = useState<EditCommitType[]>([]);

  useEffect(() => {
    if (wsRef.current) wsRef.current.close();
    if (wsMonitorRef.current) clearInterval(wsMonitorRef.current);

    wsRef.current = new WebSocket(calcEditDocumentEndpoint(documentId));
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

        setLines(() => payload.lines);
        setCommits(() => []);
        setPushed(true);
      }
    });
  }, [documentId, userId, online]);

  useEffect(() => {
    if (commits.length === 0) return;
    if (syncCommitsTimeoutRef.current) clearTimeout(syncCommitsTimeoutRef.current);

    setPushed(false);
    syncCommitsTimeoutRef.current = setTimeout(() => {
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ method: "PUSH_COMMITS", payload: { commits: commits.reverse() } }));
        setPushed(true);
      }
    }, 250);
  }, [commits]);

  const pushCommit = (commitData: CommitData) => {
    const editCommit: EditCommitType = { commitId: createCommitId(), data: commitData };
    setCommits((previousCommits) => [editCommit, ...previousCommits]);
  };

  return lines.length > 0
    ? { ready: true, online, pushed, lines, pushCommit }
    : { ready: false };
};
