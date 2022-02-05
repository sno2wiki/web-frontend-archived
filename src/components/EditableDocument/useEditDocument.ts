import { useEffect, useRef, useState } from "react";

import { calcEditDocumentEndpoint } from "~/common/endpoints";
import { createCommitId } from "~/common/generateId";

import { CommitData, EditCommitType, FocusData, LineType } from "./types";

export const useEditDocument = (
  { documentId, userId }: { documentId: string; userId: string; },
):
  | { ready: false; }
  | {
    ready: true;
    online: boolean;
    pushed: boolean;
    lines: LineType[];
    pushCommit(data: CommitData): void;
    pushFocus(data: FocusData): void;
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

  const pushCommit = (data: CommitData) => {
    const editCommit: EditCommitType = { commitId: createCommitId(), data };
    setCommits((previousCommits) => [editCommit, ...previousCommits]);
  };

  const pushFocus = (data: FocusData) => {
    console.dir(data);
  };

  return lines.length > 0
    ? { ready: true, online, pushed, lines, pushCommit, pushFocus }
    : { ready: false };
};
