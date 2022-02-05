export const applyBreak = (
  previous: { id: string; text: string; }[],
  payload: { lineId: string; index: number; newLineId: string; },
): { id: string; text: string; }[] => {
  const targetindex = previous.findIndex(({ id }) => id === payload.lineId);
  if (targetindex === -1) return previous;

  return [
    ...previous.slice(0, targetindex),
    { ...previous[targetindex], text: previous[targetindex].text.slice(0, payload.index) },
    { id: payload.newLineId, text: previous[targetindex].text.slice(payload.index) },
    ...previous.slice(targetindex + 1),
  ];
};
