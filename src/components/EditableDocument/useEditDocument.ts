import { useEffect, useRef, useState } from "react";

import { calcEditDocumentEndpoint } from "~/common/endpoints";
import { createCommitId } from "~/common/generateId";
import { CommitUnion, EditCommitType, EditData } from "~/types";

export const useEditDocument = ({
  documentId,
  userId,
}: {
  documentId: string;
  userId: string;
}):
  | { ready: false; }
  | {
    ready: true;
    online: boolean;
    pushed: boolean;
    lines: { lineId: string; nextLineId: string; text: string; }[];
    pushCommit(editData: EditData): void;
  } =>
{
  const wsRef = useRef<WebSocket>();
  const wsMonitorRef = useRef<NodeJS.Timer>();
  const [online, setOnline] = useState(false);

  const syncCommitsTimeoutRef = useRef<NodeJS.Timer>();
  const [pushed, setPushed] = useState(false);

  const [lines, setLines] = useState<{ lineId: string; nextLineId: string; text: string; }[]>([]);
  const [commits, setCommits] = useState<CommitUnion[]>([]);

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
        const document = payload.document;

        console.dir(document);

        setLines(document.lines);
        setCommits(() => [{ type: "INIT", previousCommitId: null, commitId: document.latestCommitId }]);
        setPushed(true);
      }
    });
  }, [documentId, userId, online]);

  useEffect(() => {
    if (commits.length <= 1) return;
    if (syncCommitsTimeoutRef.current) clearTimeout(syncCommitsTimeoutRef.current);

    setPushed(false);
    syncCommitsTimeoutRef.current = setTimeout(() => {
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ method: "PUSH_COMMITS", payload: { commits: commits.reverse() } }));
        setPushed(true);
      }
    }, 250);
  }, [commits]);

  const pushCommit = (payload: EditData) => {
    const editCommit: EditCommitType = {
      type: "EDIT",
      commitId: createCommitId(),
      previousCommitId: commits[0].commitId,
      data: payload,
      // userId,
    };
    setCommits((previousCommits) => [editCommit, ...previousCommits]);
  };

  return lines.length > 0 && commits.length > 0
    ? { ready: true, online, pushed, lines, pushCommit }
    : { ready: false };
};
