import { useEffect, useRef, useState } from "react";

import { calcEditDocumentEndpoint } from "~/common/endpoints";
import { createCommitId } from "~/common/generateId";

import { Commit, CommitData, Focus, FocusData, LineType } from "./types";

export const useSendFocus = (ws: WebSocket | undefined) => {
  const [focus, setFocus] = useState<Focus>();
  const focusTimeoutRef = useRef<NodeJS.Timer>();

  useEffect(() => {
    if (!focus) return;
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);

    focusTimeoutRef.current = setTimeout(() => {
      if (ws) ws.send(JSON.stringify({ method: "SEND_FOCUS", payload: focus }));
    }, 100);
  }, [focus, ws]);

  return (newFocus: Focus) => setFocus(newFocus);
};

export const useEditDocument = (
  { documentId, userId }: { documentId: string; userId: string; },
):
  | { ready: false; }
  | {
    ready: true;
    online: boolean;
    pushed: boolean;
    lines: LineType[];
    pushCommit(data: CommitData, userId: string): void;
    pushFocus(data: FocusData, userId: string): void;
  } =>
{
  const wsRef = useRef<WebSocket>();
  const wsMonitorRef = useRef<NodeJS.Timer>();
  const [online, setOnline] = useState(false);

  const [pushed, setPushed] = useState(false);
  const commitTimeoutRef = useRef<NodeJS.Timer>();

  const sendFocus = useSendFocus(wsRef.current);

  const [lines, setLines] = useState<{ id: string; text: string; }[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);

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
    if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);

    setPushed(false);
    commitTimeoutRef.current = setTimeout(() => {
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ method: "PUSH_COMMITS", payload: { commits } }));
        setPushed(true);
      }
    }, 250);
  }, [commits]);

  const pushCommit = (data: CommitData, userId: string) => {
    const commit: Commit = { commitId: createCommitId(), userId, data };
    setCommits((previousCommits) => [...previousCommits, commit]);
  };

  return lines.length > 0
    ? {
      ready: true,
      online,
      pushed,
      lines,
      pushCommit,
      pushFocus: (data: FocusData, userId: string) => sendFocus({ userId, data }),
    }
    : { ready: false };
};
