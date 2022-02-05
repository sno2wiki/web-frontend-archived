import { useEffect, useRef, useState } from "react";

import { calcEditDocumentEndpoint } from "~/common/endpoints";
import { createCommitId } from "~/common/generateId";

import { Commit, CommitData, Focus, FocusData, LineType } from "./types";

export const useSendCommits = (
  ws: WebSocket | undefined,
  userId: string,
): {
  addCommit: (commitData: CommitData) => void;
  clearCommits: () => void;
  pushed: boolean;
} => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [pushed, setPushed] = useState(false);
  const commitTimeoutRef = useRef<NodeJS.Timer>();

  useEffect(() => {
    if (pushed) return;
    if (commits.length === 0) return;
    if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);

    commitTimeoutRef.current = setTimeout(() => {
      if (ws) {
        ws.send(JSON.stringify({ method: "PUSH_COMMITS", commits }));
        setPushed(true);
      }
    }, 250);
  }, [commits, ws, pushed]);

  const addCommit = (data: CommitData): void => {
    setCommits((previous) => [...previous, { userId, data, commitId: createCommitId() }]);
    setPushed(false);
  };

  const clearCommits = () => {
    setCommits(() => []);
    setPushed(false);
  };

  return {
    addCommit,
    clearCommits,
    pushed,
  };
};

export const useSendFocus = (
  ws: WebSocket | undefined,
  userId: string,
): { setFocus: (focusData: FocusData) => void; } => {
  const [focus, setFocus] = useState<Focus>();
  const focusTimeoutRef = useRef<NodeJS.Timer>();

  useEffect(() => {
    if (!focus) return;
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);

    focusTimeoutRef.current = setTimeout(() => {
      if (ws) ws.send(JSON.stringify({ method: "SEND_FOCUS", focus }));
    }, 100);
  }, [focus, ws]);

  return { setFocus: (data) => setFocus({ data, userId }) };
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
    pushCommit(data: CommitData): void;
    pushFocus(data: FocusData): void;
  } =>
{
  const wsRef = useRef<WebSocket>();
  const wsMonitorRef = useRef<NodeJS.Timer>();
  const [online, setOnline] = useState(false);

  const [lines, setLines] = useState<{ id: string; text: string; }[]>([]);

  const { addCommit, clearCommits, pushed } = useSendCommits(wsRef.current, userId);
  const { setFocus } = useSendFocus(wsRef.current, userId);

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
        clearCommits();
      }
    });
  }, [documentId, userId, online, clearCommits]);

  return lines.length > 0
    ? {
      ready: true,
      online,
      pushed,
      lines,
      pushCommit: (data) => addCommit(data),
      pushFocus: (data) => setFocus(data),
    }
    : { ready: false };
};
