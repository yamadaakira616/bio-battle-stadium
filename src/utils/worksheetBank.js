// Published sets are reproducible: keep this recipe unchanged for saved answers.
export const WORKSHEET_SET_COUNT = 20;
export const WORKSHEET_SIZE = 100;

function worksheetRandom(setId) {
  let seed = (0x1f073ab9 ^ Math.imul(setId, 0x45d9f3b)) >>> 0;
  return (low, high) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return low + Math.floor((seed / 0x100000000) * (high - low + 1));
  };
}

const blank = "□";

function equation(a, operator, b, result, missing, reversed) {
  const values = { first: a, second: b, result };
  const parts = { ...values, [missing]: blank };
  const expression = `${parts.first} ${operator} ${parts.second}`;
  const prompt = reversed ? `${parts.result} ＝ ${expression}` : `${expression} ＝ ${parts.result}`;
  return { prompt, answer: values[missing] };
}

const add = (a, b, missing = "result", reversed = false) =>
  equation(a, "＋", b, a + b, missing, reversed);
const sub = (a, b, missing = "result", reversed = false) =>
  equation(a, "−", b, a - b, missing, reversed);
const mul = (a, b, missing = "result") => equation(a, "×", b, a * b, missing);
const divide = (quotient, divisor, missing = "result") =>
  equation(quotient * divisor, "÷", divisor, quotient, missing);

// Decimal operands are generated and added/subtracted in tenths before formatting.
const decimalAdd = (a, b, missing = "result") =>
  equation(a / 10, "＋", b / 10, (a + b) / 10, missing, false);
const decimalSub = (a, b, missing = "result") =>
  equation(a / 10, "−", b / 10, (a - b) / 10, missing, false);

function remainder(quotient, divisor, rest, missing) {
  const values = { dividend: quotient * divisor + rest, divisor, quotient, rest };
  const parts = { ...values, [missing]: blank };
  return {
    prompt: `${parts.dividend} ÷ ${parts.divisor} ＝ ${parts.quotient} あまり ${parts.rest}`,
    answer: values[missing],
  };
}

function total(expression, answer) {
  return { prompt: `${expression} ＝ ${blank}`, answer };
}

export function getWorksheet(setId) {
  if (!Number.isInteger(setId) || setId < 1 || setId > WORKSHEET_SET_COUNT) {
    throw new RangeError("問題セットは1〜20から選んでください。");
  }

  const int = worksheetRandom(setId);
  const digit = () => int(1, 9);
  const factor = () => int(2, 9);
  const two = () => int(11, 99);
  const tens = (min = 1, max = 9) => 10 * int(min, max);
  const tenths = (min, max) => int(min, max) * 10 + digit();
  const questions = [];
  const used = new Set();
  function question(topic, make) {
    let item;
    do {
      item = make();
    } while (used.has(item.prompt));
    used.add(item.prompt);
    questions.push({ number: questions.length + 1, topic, ...item });
  }

  // 1–5: complements to ten and one hundred. Some equations read right to left.
  for (const missing of ["second", "second", "first"]) {
    question("10・100をつくる", () => {
      const a = digit();
      return add(a, 10 - a, missing, true);
    });
  }
  for (const missing of ["second", "first"]) {
    question("10・100をつくる", () => {
      const a = tens();
      return add(a, 100 - a, missing, missing === "second");
    });
  }

  // 6–15: single-digit arithmetic progressing to two-digit numbers with a carry/borrow.
  question("たし算", () => {
    const a = int(1, 8);
    return add(a, int(1, 9 - a));
  });
  question("たし算", () => {
    const a = int(2, 9);
    return add(a, int(11 - a, 9), "result", true);
  });
  question("たし算", () => {
    const ones = int(1, 7);
    return add(tens() + ones, int(1, 9 - ones));
  });
  for (const reversed of [false, true]) {
    question("たし算", () => {
      const ones = int(2, 9);
      const a = tens() + ones, b = int(10 - ones, 9);
      return reversed ? add(a, b, "result", true) : add(b, a);
    });
  }
  for (const reversed of [false, true]) {
    question("ひき算", () => {
      const a = digit();
      return sub(a, int(1, a), "result", reversed);
    });
  }
  for (const reversed of [false, true, false]) {
    question("ひき算", () => {
      const ones = int(1, 7);
      return sub(tens(2, 9) + ones, int(ones + 1, 9), "result", reversed);
    });
  }

  // 16–35: addition and subtraction in tens, then with two and three digits.
  question("たし算", () => {
    const a = int(1, 8);
    return add(a * 10, tens(1, 9 - a));
  });
  question("たし算", () => {
    const a = int(2, 9);
    return add(a * 10, tens(11 - a, 9));
  });
  question("たし算", () => {
    const a = tens();
    return add(a, 100 - a, "result", true);
  });
  question("たし算", () => add(tens(3, 9), tens(8, 9), "second"));
  question("たし算", () => {
    const a = tens();
    return add(a, 100 - a, "first");
  });
  question("たし算", () => {
    const a = int(1, 6), b = int(1, 7);
    return add(10 * a + b, tens(1, 9 - a) + int(1, 9 - b));
  });
  question("たし算", () => add(two(), tens()));
  for (let i = 0; i < 3; i++) {
    question("たし算", () => {
      const a = two();
      return add(a, int(Math.max(11, 101 - a), 99));
    });
  }
  for (let i = 0; i < 2; i++) {
    question("ひき算", () => {
      const a = int(2, 9);
      return sub(a * 10, tens(1, a - 1));
    });
  }
  for (const missing of ["first", "result", "second"]) {
    question("ひき算", () => {
      const a = int(11, 17);
      return sub(a * 10, tens(a - 9, 9), missing);
    });
  }
  question("ひき算", () => {
    const a = int(4, 9), b = int(3, 9);
    return sub(a * 10 + b, tens(1, a - 1) + int(1, b));
  });
  question("ひき算", () => {
    const a = int(4, 9), b = int(0, 7);
    return sub(a * 10 + b, tens(1, a - 2) + int(b + 1, 9));
  });
  question("ひき算", () => sub(tens(11, 17), int(71, 99)));
  question("ひき算", () => sub(int(301, 978), two()));
  question("ひき算", () => {
    const a = int(301, 989);
    return sub(a, int(101, a - 100), "second");
  });

  // 36–55: two digits times one digit, then division with exact integer quotients.
  question("かけ算", () => mul(tens(), factor()));
  for (let i = 0; i < 7; i++) question("かけ算", () => mul(two(), factor()));
  question("かけ算", () => mul(two(), factor(), "second"));
  question("かけ算", () => mul(two(), factor(), "first"));
  question("わり算", () => divide(tens(), factor()));
  question("わり算", () => divide(11 * int(1, 3), int(2, 3)));
  question("わり算", () => divide(int(11, 24), int(2, 4)));
  question("わり算", () => divide(int(31, 85), int(4, 9)));
  question("わり算", () => divide(int(11, 87), factor(), "first"));
  question("わり算", () => divide(int(25, 58), int(4, 8)));
  question("わり算", () => divide(int(12, 24), int(5, 7)));
  question("わり算", () => divide(int(17, 98), int(6, 8)));
  question("わり算", () => divide(int(13, 78), int(8, 9)));
  question("わり算", () => {
    const d = int(2, 6);
    return divide(int(12, Math.floor(99 / d)), d);
  });

  // 56–65: larger addition/subtraction and missing numbers at a boundary.
  question("大きな数のたし算", () => add(int(2, 8) * 100, int(102, 398)));
  question("大きな数のたし算", () => add(int(212, 759), tens(11, 57)));
  question("大きな数のたし算", () => {
    const a = int(407, 867);
    return add(a, int(1000 - a, 898));
  });
  question("大きな数のたし算", () => {
    const a = int(101, 399);
    return add(a, 500 - a, "second");
  });
  question("大きな数のたし算", () => {
    const a = int(101, 899);
    return add(a, 1000 - a, "first");
  });
  question("大きな数のひき算", () => {
    const a = int(3, 9) * 100;
    return sub(a, int(101, a - 100));
  });
  question("大きな数のひき算", () =>
    sub(int(5, 9) * 100 + tens(4, 8) + int(5, 9), int(1, 4) * 100 + tens(1, 4) + int(1, 5)));
  question("大きな数のひき算", () =>
    sub(int(5, 9) * 100 + tens(1, 4) + int(1, 4), int(1, 4) * 100 + tens(5, 9) + int(5, 9)));
  question("大きな数のひき算", () => {
    const a = int(402, 987);
    return sub(a, a - int(1, 3) * 100, "second");
  });
  question("大きな数のひき算", () => sub(1000, int(111, 896), "second"));

  // 66–75: tenths. Keep the provided (nonblank) operands visibly decimal.
  question("小数のたし算", () => {
    const fraction = int(2, 9);
    return decimalAdd(int(1, 9) * 10 + fraction, int(11 - fraction, 9));
  });
  question("小数のたし算", () => decimalAdd(tenths(5, 9), tenths(5, 9)));
  question("小数のたし算", () => decimalAdd(tenths(11, 89), tenths(1, 9)));
  question("小数のたし算", () => decimalAdd(tenths(11, 79), tenths(11, 39)));
  question("小数のたし算", () => {
    const a = tenths(25, 74), b = tenths(11, 24);
    const adjustment = b % 10 === 9 ? -1 : 1;
    const hidden = (a + b) % 10 === 0 ? b + adjustment : b;
    return decimalAdd(a, hidden, "second");
  });
  question("小数のひき算", () => {
    const f = int(1, 7);
    return decimalSub(int(5, 9) * 10 + f, int(1, 4) * 10 + int(f + 1, 9));
  });
  for (let i = 0; i < 2; i++) question("小数のひき算", () => decimalSub(tenths(51, 99), tenths(11, 48)));
  for (const lowDifference of [true, false]) {
    question("小数のひき算", () => {
      const a = tenths(51, 98);
      const diff = lowDifference ? tenths(1, 9) : tenths(11, 47);
      return decimalSub(a, a - diff, "second");
    });
  }

  // 76–85: larger products/quotients and all four roles in remainder equations.
  for (let i = 0; i < 3; i++) question("大きな数のかけ算", () => mul(int(103, 889), factor()));
  for (let i = 0; i < 2; i++) {
    question("大きな数のわり算", () => {
      const d = factor();
      return divide(int(101, Math.floor(999 / d)), d);
    });
  }
  question("大きな数のわり算", () => divide(int(301, 985), int(4, 9)));
  question("あまりのあるわり算", () => {
    const dividend = int(2, 9) * 100;
    const divisors = [3, 6, 7, 8, 9].filter(d => dividend % d !== 0);
    const d = divisors[int(0, divisors.length - 1)];
    return remainder(Math.floor(dividend / d), d, dividend % d, "quotient");
  });
  for (const missing of ["rest", "divisor", "dividend"]) {
    question("あまりのあるわり算", () => {
      const d = factor();
      const quotient = missing === "dividend" ? int(100, Math.floor(990 / d)) : int(Math.ceil(100 / d), 99);
      return remainder(quotient, d, int(1, d - 1), missing);
    });
  }

  // 86–100: operation precedence, including division after a product and a final missing divisor.
  const mixed = (make) => question("計算の順序", make);
  mixed(() => {
    const a = two(), b = factor(), c = digit();
    return total(`${a} × ${b} ＋ ${c}`, a * b + c);
  });
  mixed(() => {
    const a = digit(), b = tens(), c = factor();
    return total(`${a} ＋ ${b} × ${c}`, a + b * c);
  });
  mixed(() => {
    const a = two(), b = factor(), c = digit();
    return total(`${a} × ${b} − ${c}`, a * b - c);
  });
  mixed(() => {
    const a = two(), b = factor(), c = digit();
    return total(`${a * b} ÷ ${b} − ${c}`, a - c);
  });
  mixed(() => {
    const a = int(28, 98), b = int(11, a - 1), c = factor();
    return total(`${a} − ${b * c} ÷ ${c}`, a - b);
  });
  mixed(() => {
    const a = tens(2, 9), b = factor(), c = digit();
    return total(`${a * b} ÷ ${b} ＋ ${c}`, a + c);
  });
  const productThenDivide = () => {
    const b = factor(), c = factor(), a = int(2, Math.floor(99 / c)) * c;
    return total(`${a} × ${b} ÷ ${c}`, (a * b) / c);
  };
  const divideThenMultiply = () => {
    const a = two(), b = factor(), c = factor();
    return total(`${a * b} ÷ ${b} × ${c}`, a * c);
  };
  mixed(productThenDivide);
  mixed(divideThenMultiply);
  mixed(() => {
    const a = two(), c = int(2, 4), b = c * int(2, Math.floor(9 / c));
    return total(`${a} × ${b} ÷ ${c}`, (a * b) / c);
  });
  mixed(divideThenMultiply);
  mixed(() => {
    const a = two(), b = factor(), c = two(), d = factor();
    return total(`${a} × ${b} ＋ ${c * d} ÷ ${d}`, a * b + c);
  });
  mixed(() => {
    const c = int(11, 22), d = int(2, 4), a = int(c * d + 1, 99), b = factor();
    return total(`${a * b} ÷ ${b} − ${c} × ${d}`, a - c * d);
  });
  mixed(() => {
    const a = two(), b = factor(), c = int(11, Math.min(a * b, 99)), d = factor();
    return total(`${a} × ${b} − ${c * d} ÷ ${d}`, a * b - c);
  });
  mixed(() => {
    const a = two(), b = factor(), c = two(), d = factor();
    return total(`${a * b} ÷ ${b} ＋ ${c} × ${d}`, a + c * d);
  });
  mixed(() => {
    const a = int(31, 99), b = int(3, 9), c = int(11, 82), d = factor();
    return { prompt: `${a} × ${b} − ${c * d} ÷ □ ＝ ${a * b - c}`, answer: d };
  });

  return questions;
}
