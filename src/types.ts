export type InsertPayload = { lineId: string; index: number; text: string; };
export type FocusPayload = { lineId: string; index: number; };
export type BreakPayload = { lineId: string; index: number; };
export type DeletePayload = { lineId: string; index: number; };
export type FoldPayload = { lineId: string; };

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

export type LineType = { lineId: string; text: string; };
export type Lines = LineType[];

export type DocumentType = {
  lines: Lines;
};
