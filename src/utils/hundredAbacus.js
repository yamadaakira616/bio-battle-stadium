export const HUNDRED_COURSES = {
  sequential: {
    name: "1〜100 順足し",
    description: "1、2、3…と順に足して、100まで進もう。",
  },
  repeat165: {
    name: "165 くり返し",
    description: "165を何回も足して、大きい数を正しく作ろう。",
  },
};

export const HUNDRED_VARIANTS = {
  practice: "じっくり練習",
  timed: "1分チャレンジ",
};

export const HUNDRED_LIMIT = 100;
export const HUNDRED_SECONDS = 60;

export function hundredTotal(course, count) {
  if (
    !(course in HUNDRED_COURSES) ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > HUNDRED_LIMIT
  )
    return null;
  return course === "sequential" ? (count * (count + 1)) / 2 : 165 * count;
}

export function hundredStep(course, count) {
  const expected = hundredTotal(course, count);
  if (expected === null) return null;
  return {
    before: count === 1 ? 0 : hundredTotal(course, count - 1),
    add: course === "sequential" ? count : 165,
    expected,
  };
}

export function parseHundredInteger(raw, { min = 0, max = 16500 } = {}) {
  const text = String(raw ?? "")
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248))
    .trim();
  if (!text) return { valid: false, error: "数字を入力してください。" };
  if (!/^\d+$/.test(text))
    return { valid: false, error: "0以上の整数で入力してください。" };
  const value = Number(text);
  if (!Number.isSafeInteger(value) || value < min || value > max)
    return { valid: false, error: `${min}〜${max}の整数で入力してください。` };
  return { valid: true, value };
}

export function checkHundredResult(course, countRaw, answerRaw) {
  const count = parseHundredInteger(countRaw, { min: 1, max: HUNDRED_LIMIT });
  const answer = parseHundredInteger(answerRaw);
  const errors = {};
  if (!count.valid) errors.count = count.error;
  if (!answer.valid) errors.answer = answer.error;
  if (Object.keys(errors).length) return { valid: false, errors };
  const expected = hundredTotal(course, count.value);
  if (expected === null)
    return { valid: false, errors: { count: "種目を選び直してください。" } };
  return {
    valid: true,
    count: count.value,
    answer: answer.value,
    expected,
    correct: answer.value === expected,
  };
}

export function hundredReward({
  variant,
  correctCount,
  correct,
  personalBest,
}) {
  return (
    2 +
    (correct ? 3 : 0) +
    (personalBest ? 3 : 0) +
    (variant === "practice" ? Math.floor(correctCount / 10) * 20 : 0)
  );
}

export function emptyHundredRecords() {
  const record = () => ({ best: 0, firstHundredDate: null });
  return {
    practice: { sequential: record(), repeat165: record() },
    timed: { sequential: record(), repeat165: record() },
  };
}

export function normalizeHundredRecords(value) {
  const base = emptyHundredRecords();
  for (const variant of Object.keys(HUNDRED_VARIANTS)) {
    for (const course of Object.keys(HUNDRED_COURSES)) {
      const item = value?.[variant]?.[course];
      if (!item || typeof item !== "object") continue;
      base[variant][course] = {
        best:
          Number.isInteger(item.best) && item.best >= 0 && item.best <= 100
            ? item.best
            : 0,
        firstHundredDate: /^\d{4}-\d{2}-\d{2}$/.test(item.firstHundredDate)
          ? item.firstHundredDate
          : null,
      };
    }
  }
  return base;
}
