
export type Insert = {
  method: "INSERT";
  payload: {
    lineId: string;
    index: number;
    text: string;
  };
};
export type InsertPayload = Insert["payload"]

export type FocusPayload = Focus["payload"]
export type Focus = {
  method: "FOCUS";
  payload: {
    lineId: string;
    index: number;
  };
};

export type Break = {
  method: "BREAK";
  payload: {
    lineId: string; index: number;
  };
};
export type BreakPayload = Break["payload"]

export type Delete = {
  method: "DELETE";
  payload: { lineId: string; index: number };
};
export type DeletePayload = Delete["payload"]

export type Fold = {
  method: "FOLD";
  payload: { lineId: string };
};
export type FoldPayload = Fold["payload"]

export type CaptureData = Focus | Insert | Break | Delete | Fold;
export type MethodType = CaptureData["method"];
