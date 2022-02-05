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

export interface FocusData {
  lineId: string;
  index: number;
}

export type LineType = { id: string; text: string; };
