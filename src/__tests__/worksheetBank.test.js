import { describe, expect, it } from "vitest";
import { getWorksheet } from "../utils/worksheetBank";

// Independently read the printed equation. Multiply/divide within each term
// from left to right, then add the signed terms.
function evaluate(expression) {
  const [first, ...tokens] = expression.trim().split(/\s+/);
  if (!/^\d+(?:\.\d+)?$/.test(first)) throw Error(expression);
  let sum = 0;
  let term = Number(first);
  for (let i = 0; i < tokens.length; i += 2) {
    const operator = tokens[i], operand = tokens[i + 1];
    if (!/^\d+(?:\.\d+)?$/.test(operand)) throw Error(expression);
    const value = Number(operand);
    if (operator === "×") term *= value;
    else if (operator === "÷" && value !== 0) term /= value;
    else if (operator === "＋" || operator === "−") {
      sum += term;
      term = operator === "＋" ? value : -value;
    } else throw Error(expression);
  }
  return sum + term;
}

describe("100問計算の問題セット", () => {
  const sets = Array.from({ length: 20 }, (_, i) => getWorksheet(i + 1));

  it("番号を選ぶと同じ100問が出て、20セットの内容が異なる", () => {
    expect(new Set(sets.map(set => JSON.stringify(set))).size).toBe(20);
    sets.forEach((set, i) => {
      expect(set).toEqual(getWorksheet(i + 1));
      expect(set).toHaveLength(100);
      expect(new Set(set.map(q => q.prompt)).size).toBe(100);
      expect(set.map(q => q.number)).toEqual(Array.from({ length: 100 }, (_, n) => n + 1));
    });
  });

  it("全2000問の空欄に正答を入れると式が成立する", () => {
    for (const set of sets) {
      for (const { prompt, answer, number } of set) {
        expect(prompt.match(/□/g)).toHaveLength(1);
        expect(Number.isFinite(answer) && answer >= 0).toBe(true);
        const filled = prompt.replace("□", String(answer));
        if (number >= 82 && number <= 85) {
          const parts = /^(\d+) ÷ (\d+) ＝ (\d+) あまり (\d+)$/.exec(filled);
          expect(parts, prompt).toBeTruthy();
          const [, dividend, divisor, quotient, remainder] = parts.map(Number);
          expect(quotient, prompt).toBe(Math.floor(dividend / divisor));
          expect(remainder, prompt).toBe(dividend % divisor);
          expect(remainder, prompt).toBeGreaterThan(0);
        } else {
          const sides = filled.split("＝");
          expect(sides, prompt).toHaveLength(2);
          expect(evaluate(sides[0]), prompt).toBeCloseTo(evaluate(sides[1]), 8);
        }
      }
    }
  });

  it("小数、あまりの4種の穴埋め、最後の逆算を原資料と同じ位置に出す", () => {
    for (const set of sets) {
      expect(set.slice(65, 75).every(q => q.prompt.includes("."))).toBe(true);
      expect(set[81].prompt).toMatch(/＝ □ あまり \d+$/);
      expect(set[82].prompt).toMatch(/あまり □$/);
      expect(set[83].prompt).toContain("÷ □ ＝");
      expect(set[84].prompt).toMatch(/^□ ÷/);
      expect(set[99].prompt).toMatch(/^\d+ × \d+ − \d+ ÷ □ ＝ \d+$/);
    }
  });
});
