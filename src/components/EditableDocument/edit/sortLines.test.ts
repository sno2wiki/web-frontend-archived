import { sortLines } from "./sortLines";

describe("sortLines", () => {
  test("最後の行が見つからない場合は例外を投げる", () => {
    expect(() => {
      sortLines([{ lineId: "line_a", nextLineId: "line_b", text: "A" }]);
    }).toThrowError("Not found last lines.");
  });

  test("並び替えた後の行の数が合わなければ例外を投げる", () => {
    expect(() => {
      sortLines([
        { lineId: "line_a", nextLineId: "line_c", text: "A" },
        { lineId: "line_b", nextLineId: null, text: "B" },
      ]);
    }).toThrowError("Lines structure may be broken.");
  });

  test("空配列", () => {
    const actual = sortLines([]);
    expect(actual).toStrictEqual([]);
  });

  test("1個", () => {
    const actual = sortLines(
      [
        { lineId: "line_a", nextLineId: null, text: "A" },
      ],
    );
    expect(actual).toStrictEqual(
      [
        { lineId: "line_a", prevLineId: null, postLineId: null, text: "A" },
      ],
    );
  });

  test("2個，順番通り", () => {
    const actual = sortLines(
      [
        { lineId: "line_a", nextLineId: "line_b", text: "A" },
        { lineId: "line_b", nextLineId: null, text: "B" },
      ],
    );
    expect(actual).toStrictEqual(
      [
        { lineId: "line_a", prevLineId: null, postLineId: "line_b", text: "A" },
        { lineId: "line_b", prevLineId: "line_a", postLineId: null, text: "B" },
      ],
    );
  });

  test("2個，逆順", () => {
    const actual = sortLines(
      [
        { lineId: "line_b", nextLineId: null, text: "B" },
        { lineId: "line_a", nextLineId: "line_b", text: "A" },
      ],
    );
    expect(actual).toStrictEqual(
      [
        { lineId: "line_a", prevLineId: null, postLineId: "line_b", text: "A" },
        { lineId: "line_b", prevLineId: "line_a", postLineId: null, text: "B" },
      ],
    );
  });

  it.each([
    [
      [
        { lineId: "line_a", nextLineId: "line_b", text: "A" },
        { lineId: "line_b", nextLineId: "line_c", text: "B" },
        { lineId: "line_c", nextLineId: null, text: "C" },
      ],
      [
        { lineId: "line_a", prevLineId: null, postLineId: "line_b", text: "A" },
        { lineId: "line_b", prevLineId: "line_a", postLineId: "line_c", text: "B" },
        { lineId: "line_c", prevLineId: "line_b", postLineId: null, text: "C" },
      ],
    ],
    [
      [
        { lineId: "line_c", nextLineId: null, text: "C" },
        { lineId: "line_b", nextLineId: "line_c", text: "B" },
        { lineId: "line_a", nextLineId: "line_b", text: "A" },
      ],
      [
        { lineId: "line_a", prevLineId: null, postLineId: "line_b", text: "A" },
        { lineId: "line_b", prevLineId: "line_a", postLineId: "line_c", text: "B" },
        { lineId: "line_c", prevLineId: "line_b", postLineId: null, text: "C" },
      ],
    ],
  ])("3個以上，#%#", (arg, expected) => {
    const actual = sortLines(arg);
    expect(actual).toStrictEqual(expected);
  });
});
