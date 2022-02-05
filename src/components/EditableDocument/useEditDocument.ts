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
  const [pushed, setPushed] = useState(true);
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
    setPushed(true);
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

export const useStrongWebSocket = (
  endpoint: string,
  {
    onMessage,
    onOpen,
    onClose,
    onError,
  }: {
    onOpen?: (event: Event) => void;
    onMessage?: (event: MessageEvent) => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (event: Event) => void;
  },
): [WebSocket | undefined, boolean] => {
  const wsRef = useRef<WebSocket>();
  const wsMonitorRef = useRef<NodeJS.Timer>();
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (online) return;
    if (wsRef.current) wsRef.current.close();
    if (wsMonitorRef.current) clearInterval(wsMonitorRef.current);

    wsRef.current = new WebSocket(endpoint);
    wsRef.current.addEventListener("open", (event) => {
      setOnline(true);
      if (onOpen) onOpen(event);
    });
    wsRef.current.addEventListener("message", (event) => {
      setOnline(true);
      if (onMessage) onMessage(event);
    });
    wsRef.current.addEventListener("close", (event) => {
      setOnline(false);
      if (onClose) onClose(event);
    });
    wsRef.current.addEventListener("error", (event) => {
      setOnline(false);
      if (onError) onError(event);
    });
    wsMonitorRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) setOnline(false);
    }, 250);
  }, [online, endpoint, onMessage, onOpen, onClose, onError]);

  return [wsRef.current, online];
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
  const [lines, setLines] = useState<{ id: string; text: string; }[]>([]);

  const [ws, online] = useStrongWebSocket(
    calcEditDocumentEndpoint(documentId),
    {
      onMessage(event) {
        const data = JSON.parse(event.data);
        if (data.method === "PULL_DOCUMENT") {
          const payload = data.payload;
          setLines(() => payload.lines);
          clearCommits();
        }
      },
    },
  );
  const { addCommit, clearCommits, pushed } = useSendCommits(ws, userId);
  const { setFocus } = useSendFocus(ws, userId);

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
