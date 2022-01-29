export type InsertPayload = { lineId: string; index: number; text: string; };
export type BreakPayload = { lineId: string; index: number; newLineId: string; };
export type DeletePayload = { lineId: string; index: number; };
export type FoldPayload = { lineId: string; };

export type FocusPayload = { lineId: string; };

export type EditMethodType = "INSERT" | "FOCUS" | "BREAK" | "DELETE" | "FOLD";
export type EditMethod<TMethodType extends EditMethodType, TMethodPayload extends Record<string, unknown>> = {
  method: TMethodType;
  payload: TMethodPayload;
};
export type EditData =
  | EditMethod<"INSERT", InsertPayload>
  | EditMethod<"FOCUS", FocusPayload>
  | EditMethod<"BREAK", BreakPayload>
  | EditMethod<"DELETE", DeletePayload>
  | EditMethod<"FOLD", FoldPayload>;

export type InitCommitType = {
  commitId: string;
  previousCommitId: null;
  type: "INIT";
};

export type EditCommitType = {
  commitId: string;
  previousCommitId: string;
  type: "EDIT";
  data: EditData;
};
export type CommitUnion = InitCommitType | EditCommitType;

export type LineType = { lineId: string; nextLineId: string | null; text: string; };
export type Lines = LineType[];

export type DocumentType = {
  lines: Lines;
};
