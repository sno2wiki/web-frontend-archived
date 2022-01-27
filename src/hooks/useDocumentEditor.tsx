import { useEffect, useMemo, useRef, useState } from "react";
import { createCommitId } from "~/generators/id";
import { DocumentType, EditData, Lines } from "~/types";

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
      latestCommit: CommitType;
      offline: boolean;
    } => {
  const wsRef = useRef<WebSocket>();

  const [lines, setLines] = useState<Lines>();
  const [commits, setCommits] = useState<CommitType[]>([]);

  useEffect(() => {
    if (wsRef.current) wsRef.current.close();

    wsRef.current = new WebSocket(calcDocumentEditEndpoint(documentId));
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
  }, [documentId, userId]);

  const sendCommit = (payload: EditData) => {
    if (!wsRef.current) return;

    const editCommit: EditCommitType = {
      type: "EDIT",
      commitId: createCommitId(),
      previousId: commits[0].commitId,
      userId,
    };
    setCommits((previousCommits) => [editCommit, ...previousCommits]);

    wsRef.current.send(JSON.stringify(editCommit));
  };

  if (!!wsRef.current && lines && commits.length !== 0) {
    return {
      ready: true,
      sendCommit: sendCommit,
      lines: lines,
      latestCommit: commits[0],
      offline: wsRef.current?.readyState !== WebSocket.OPEN,
    };
  } else {
    return {
      ready: false,
    };
  }
};
