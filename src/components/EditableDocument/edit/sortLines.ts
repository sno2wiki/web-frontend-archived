export const sortLines = (
  lines: { lineId: string; nextLineId: string | null; text: string; }[],
): { lineId: string; text: string; }[] => {
  if (lines.length === 0) return []

  const lastLine = lines.find(({ nextLineId }) => nextLineId === null)
  if (!lastLine) throw new Error("Not found last lines.")

  const sorted: { lineId: string; nextLineId: string | null; text: string; }[] = [lastLine]
  for (let i = 1; i <= lines.length; i++) {
    if (lines.length < i) throw new Error("Lines may include loop or be broken.")

    const current = sorted[sorted.length - 1]
    const previous = lines.find(({ nextLineId }) => nextLineId === current.lineId)
    if (!previous) break;
    sorted.push(previous)
  }

  if (sorted.length !== lines.length) throw new Error("Lines structure may be broken.")

  return sorted.map(({ lineId, text }) => ({ lineId, text })).reverse();
};
