import { useEffect, useMemo, useRef, useState } from "react";
import { createCommitId } from "~/generators/id";
import { DocumentType, EditData, Lines } from "~/types";

export const calcDocumentEditEndpoint = (id: string) =>
  "ws://0.0.0.0:8000/docs/" + id + "/edit";

export type JoinCommitType = {
  type: "JOIN";
  previousId: string;
  id: string;
};
export type EditCommitType = {
  type: "EDIT";
  previousId: string;
  id: string;
};
export type CommitType = JoinCommitType | EditCommitType;

export const useEditDocument = (
  endpoint: string | undefined
):
  | { ready: false }
  | {
      ready: true;
      sendCommit: (editData: EditData) => void;
      lines: Lines;
      latestCommit: CommitType;
    } => {
  const wsRef = useRef<WebSocket>();

  const [lines, setLines] = useState<Lines>();
  const [commits, setCommits] = useState<CommitType[]>([]);

  useEffect(() => {
    if (!endpoint) return;

    wsRef.current = new WebSocket(endpoint);
    wsRef.current.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.method === "INIT") {
        const payload = data.payload;

        setLines(payload.lines);

        const joinCommit: JoinCommitType = {
          type: "JOIN",
          previousId: payload.latestCommit.commitId,
          id: createCommitId(),
        };
        setCommits((previousCommits) => [joinCommit, ...previousCommits]);
      }
    });
  }, [endpoint]);

  const sendCommit = (payload: EditData) => {
    if (!wsRef.current) return;

    const editCommit: EditCommitType = {
      type: "EDIT",
      previousId: commits[0].id,
      id: createCommitId(),
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
    };
  } else {
    return {
      ready: false,
    };
  }
};
