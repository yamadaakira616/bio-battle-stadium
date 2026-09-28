import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import HundredAbacusScreen from "../screens/HundredAbacusScreen";
import Soroban from "../components/Soroban";
import {
  checkHundredResult,
  hundredReward,
  hundredStep,
  hundredTotal,
  parseHundredInteger,
} from "../utils/hundredAbacus";
import {
  emptyLearning,
  normalizeLearning,
  recordLearningSession,
} from "../utils/learning";

afterEach(() => {
  cleanup();
  localStorage.removeItem("bio-battle-hundred-abacus-draft-v1");
  vi.restoreAllMocks();
});

const initial = () => ({
  coins: 500,
  collection: {},
  learning: emptyLearning(),
});
const day = new Date(2026, 8, 28, 15);

describe("1〜100 そろばんロード", () => {
  it("calculates every sequential and repeated addition step exactly", () => {
    for (let n = 1; n <= 100; n++) {
      expect(hundredTotal("sequential", n)).toBe((n * (n + 1)) / 2);
      expect(hundredTotal("repeat165", n)).toBe(165 * n);
      const a = hundredStep("sequential", n);
      const b = hundredStep("repeat165", n);
      expect(a.before + a.add).toBe(a.expected);
      expect(b.before + b.add).toBe(b.expected);
    }
    expect(hundredTotal("sequential", 3)).toBe(6);
    expect(hundredTotal("sequential", 10)).toBe(55);
    expect(hundredTotal("sequential", 100)).toBe(5050);
    expect(hundredTotal("repeat165", 100)).toBe(16500);
    expect(hundredTotal("sequential", 101)).toBeNull();
    expect(hundredTotal("unknown", 1)).toBeNull();
  });

  it("validates both count and answer without silently accepting fractions or exponential notation", () => {
    for (const raw of [
      "",
      "0",
      "-1",
      "1.5",
      "1e2",
      "101",
      "9999999999999999999",
    ])
      expect(checkHundredResult("sequential", raw, "6").valid).toBe(false);
    expect(parseHundredInteger("１６５００")).toEqual({
      valid: true,
      value: 16500,
    });
    expect(checkHundredResult("sequential", "３", "６")).toMatchObject({
      valid: true,
      correct: true,
      expected: 6,
    });
    expect(checkHundredResult("sequential", "10", "54")).toMatchObject({
      valid: true,
      correct: false,
      expected: 55,
    });
    expect(checkHundredResult("repeat165", "100", "16500")).toMatchObject({
      valid: true,
      correct: true,
    });
    expect(checkHundredResult("repeat165", "100", "16501").valid).toBe(false);
  });

  it("records practice effort, checkpoints, and first 100 date exactly once", () => {
    const first = recordLearningSession(
      initial(),
      {
        id: "practice-10",
        mode: "hundred",
        hundred: {
          course: "sequential",
          variant: "practice",
          count: 10,
          answeredCount: 12,
          correctCount: 10,
          expected: 55,
          answer: 55,
        },
      },
      day,
    );
    expect(first.coins).toBe(
      500 +
        hundredReward({ variant: "practice", correctCount: 10, correct: true }),
    );
    expect(first.learning.answered).toBe(12);
    expect(first.learning.correct).toBe(10);
    expect(first.learning.hundredRecords.practice.sequential.best).toBe(10);
    expect(first.learning.daily["2026-09-28"].answered).toBe(12);
    expect(
      recordLearningSession(
        first,
        { id: "practice-10", mode: "hundred", hundred: {} },
        day,
      ),
    ).toBe(first);

    const hundred = recordLearningSession(
      first,
      {
        id: "practice-100",
        mode: "hundred",
        hundred: {
          course: "sequential",
          variant: "practice",
          count: 100,
          answeredCount: 101,
          correctCount: 100,
          expected: 5050,
          answer: 5050,
        },
      },
      day,
    );
    expect(
      hundred.learning.hundredRecords.practice.sequential.firstHundredDate,
    ).toBe("2026-09-28");
    const replay = recordLearningSession(
      hundred,
      {
        id: "practice-replay",
        mode: "hundred",
        hundred: {
          course: "sequential",
          variant: "practice",
          count: 100,
          answeredCount: 100,
          correctCount: 100,
          expected: 5050,
          answer: 5050,
        },
      },
      new Date(2026, 8, 29),
    );
    expect(
      replay.learning.hundredRecords.practice.sequential.firstHundredDate,
    ).toBe("2026-09-28");
  });

  it("adds empty road records to old learning saves without changing past study", () => {
    const old = {
      xp: 255,
      answered: 11,
      correct: 10,
      daily: {
        "2026-09-27": {
          answered: 11,
          correct: 10,
          modes: ["mental"],
          claimed: [],
        },
      },
      sessions: [
        { id: "old", date: "2026-09-27", mode: "mental", correct: 5, total: 5 },
      ],
    };
    const migrated = normalizeLearning(old);
    expect(migrated.xp).toBe(255);
    expect(migrated.daily["2026-09-27"].answered).toBe(11);
    expect(migrated.sessions[0].id).toBe("old");
    expect(migrated.hundredRecords.practice.sequential.best).toBe(0);
    expect(migrated.hundredRecords.timed.repeat165.firstHundredDate).toBeNull();
  });

  it("counts only a correct full minute for the timed best, while retaining wrong attempts", () => {
    const valid = recordLearningSession(
      initial(),
      {
        id: "timed-best",
        mode: "hundred",
        hundred: {
          course: "repeat165",
          variant: "timed",
          count: 12,
          answeredCount: 1,
          correctCount: 1,
          expected: 1980,
          answer: 1980,
          fullMinute: true,
          endReason: "natural",
        },
      },
      day,
    );
    expect(valid.learning.hundredRecords.timed.repeat165.best).toBe(12);
    expect(valid.coins).toBe(508);
    const wrong = recordLearningSession(
      valid,
      {
        id: "timed-wrong",
        mode: "hundred",
        hundred: {
          course: "repeat165",
          variant: "timed",
          count: 30,
          answeredCount: 1,
          correctCount: 0,
          expected: 4950,
          answer: 4900,
          fullMinute: true,
          endReason: "natural",
        },
      },
      day,
    );
    expect(wrong.learning.hundredRecords.timed.repeat165.best).toBe(12);
    expect(wrong.learning.answered).toBe(2);
    expect(wrong.coins).toBe(510);
    const early = recordLearningSession(
      wrong,
      {
        id: "timed-early",
        mode: "hundred",
        hundred: {
          course: "repeat165",
          variant: "timed",
          count: 50,
          answeredCount: 1,
          correctCount: 1,
          expected: 8250,
          answer: 8250,
          fullMinute: false,
          endReason: "early",
        },
      },
      day,
    );
    expect(early.learning.hundredRecords.timed.repeat165.best).toBe(12);
  });

  it("lets a child answer one step, resume, then save partial practice", () => {
    const finish = vi.fn();
    const view = render(
      <HundredAbacusScreen
        state={initial()}
        onBack={() => {}}
        onRecords={() => {}}
        onFinish={finish}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /チャレンジをはじめる/ }),
    );
    expect(screen.getByText("1 ＋ 2 ＋ … ＋ 1")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "数字で答える" }));
    fireEvent.change(screen.getByLabelText("ここまでの合計"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /こたえあわせ/ }));
    expect(screen.getByRole("status").textContent).toContain(
      "もう一度チャレンジ",
    );
    expect(screen.getByText("1 ＋ 2 ＋ … ＋ 1")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("ここまでの合計"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /こたえあわせ/ }));
    expect(screen.getByRole("status").textContent).toContain("せいかい");
    view.unmount();

    render(
      <HundredAbacusScreen
        state={initial()}
        onBack={() => {}}
        onRecords={() => {}}
        onFinish={finish}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /つぎの数へ/ }));
    expect(screen.getByText("1 ＋ 2 ＋ … ＋ 2")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "ここまでの記録を残す" }),
    );
    expect(finish).toHaveBeenCalledTimes(1);
    expect(finish.mock.calls[0][0].hundred).toMatchObject({
      count: 1,
      answeredCount: 2,
      correctCount: 1,
    });
    expect(screen.getByText("ここまでの記録を保存！")).toBeTruthy();
  });

  it("records effort after a wrong first answer without calling zero a solved sum", () => {
    const finish = vi.fn();
    render(
      <HundredAbacusScreen
        state={initial()}
        onBack={() => {}}
        onRecords={() => {}}
        onFinish={finish}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /チャレンジをはじめる/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "数字で答える" }));
    fireEvent.change(screen.getByLabelText("ここまでの合計"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /こたえあわせ/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "ここまでの記録を残す" }),
    );
    expect(finish.mock.calls[0][0].hundred).toMatchObject({
      count: 0,
      answeredCount: 1,
    });
    expect(screen.getByText("1問目から、また挑戦しよう")).toBeTruthy();
    expect(screen.queryByText("1から0までの合計")).toBeNull();
  });

  it("answers the 100th 165 step with five digits and keeps the first finish event singular", () => {
    localStorage.setItem(
      "bio-battle-hundred-abacus-draft-v1",
      JSON.stringify({
        id: "last-step",
        course: "repeat165",
        variant: "practice",
        status: "practice",
        questionNo: 100,
        correctCount: 99,
        answeredCount: 100,
        startedAt: Date.now() - 10000,
        countdownEndsAt: 0,
        deadline: 0,
      }),
    );
    const finish = vi.fn();
    render(
      <HundredAbacusScreen
        state={initial()}
        onBack={() => {}}
        onRecords={() => {}}
        onFinish={finish}
      />,
    );
    expect(screen.getByLabelText("5けたのそろばん")).toBeTruthy();
    expect(screen.getByRole("button", { name: "万の位の1の珠1" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "数字で答える" }));
    fireEvent.change(screen.getByLabelText("ここまでの合計"), {
      target: { value: "16500" },
    });
    fireEvent.click(screen.getByRole("button", { name: /こたえあわせ/ }));
    fireEvent.click(screen.getByRole("button", { name: /100問の結果を見る/ }));
    expect(screen.getByText("100問、制覇！")).toBeTruthy();
    expect(finish).toHaveBeenCalledTimes(1);
    expect(finish.mock.calls[0][0].hundred).toMatchObject({
      count: 100,
      expected: 16500,
      correctCount: 100,
      answeredCount: 101,
    });
    expect(
      localStorage.getItem("bio-battle-hundred-abacus-draft-v1"),
    ).toBeNull();
  });

  it("renders the ten-thousand rod of the virtual abacus", () => {
    render(<Soroban value={16500} onChange={() => {}} digits={5} />);
    expect(screen.getByLabelText("5けたのそろばん")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("16,500");
    expect(
      screen
        .getByRole("button", { name: "万の位の1の珠1" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("restores an elapsed timer to result entry and shows the correct total after checking", () => {
    const finish = vi.fn();
    localStorage.setItem(
      "bio-battle-hundred-abacus-draft-v1",
      JSON.stringify({
        id: "elapsed",
        course: "sequential",
        variant: "timed",
        status: "timed",
        questionNo: 1,
        correctCount: 0,
        answeredCount: 0,
        startedAt: Date.now() - 70000,
        countdownEndsAt: Date.now() - 67000,
        deadline: Date.now() - 7000,
        endReason: null,
      }),
    );
    render(
      <HundredAbacusScreen
        state={initial()}
        onBack={() => {}}
        onRecords={() => {}}
        onFinish={finish}
      />,
    );
    expect(screen.getByText("1分チャレンジ終了！")).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/最後に足した数/), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText("計算した合計"), {
      target: { value: "55" },
    });
    fireEvent.click(screen.getByRole("button", { name: /答えを確かめる/ }));
    expect(screen.getByText("55", { selector: "strong" })).toBeTruthy();
    expect(finish.mock.calls[0][0].hundred).toMatchObject({
      count: 10,
      expected: 55,
      correctCount: 1,
      fullMinute: true,
    });
  });

  it("treats a finish click after the absolute deadline as a full minute", () => {
    const start = Date.now();
    let clock = start;
    vi.spyOn(Date, "now").mockImplementation(() => clock);
    localStorage.setItem(
      "bio-battle-hundred-abacus-draft-v1",
      JSON.stringify({
        id: "deadline-edge",
        course: "sequential",
        variant: "timed",
        status: "timed",
        questionNo: 1,
        correctCount: 0,
        answeredCount: 0,
        startedAt: start - 63000,
        countdownEndsAt: start - 60000,
        deadline: start + 100,
        endReason: null,
      }),
    );
    const finish = vi.fn();
    render(
      <HundredAbacusScreen
        state={initial()}
        onBack={() => {}}
        onRecords={() => {}}
        onFinish={finish}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "途中で終了する" }));
    clock = start + 101;
    fireEvent.click(screen.getByRole("button", { name: "終了して答えを入力" }));
    fireEvent.change(screen.getByLabelText(/最後に足した数/), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("計算した合計"), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByRole("button", { name: /答えを確かめる/ }));
    expect(finish.mock.calls[0][0].hundred.fullMinute).toBe(true);
  });
});
