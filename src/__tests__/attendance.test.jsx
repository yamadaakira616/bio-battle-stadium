import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  renderHook,
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
import {
  attendanceStats,
  claimLoginBonus,
  LOGIN_REWARDS,
  loginProgress,
  normalizeAttendance,
  normalizeFirstClears,
  recordVisit,
  saveLevelResult,
} from "../utils/attendance";
import {
  emptyLearning,
  recordLearningSession,
  generateLearningProblem,
} from "../utils/learning";
import { useGameState } from "../hooks/useGameState";
import LoginBonus from "../components/LoginBonus";
import MilestoneRecords from "../components/MilestoneRecords";

const date = (day) => new Date(2026, 8, day, 12);
const initial = () => ({
  coins: 500,
  collection: {},
  attendance: { days: [], claims: {} },
  levelStars: {},
  levelFirstClears: {},
  learning: emptyLearning(),
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("daily attendance and login rewards", () => {
  it("counts visits once per day and does not require a reward claim", () => {
    const state = recordVisit(initial(), date(28));
    expect(state.coins).toBe(500);
    expect(state.attendance.days).toEqual(["2026-09-28"]);
    expect(recordVisit(state, date(28))).toBe(state);
    expect(recordVisit(state, date(29)).attendance.days).toHaveLength(2);
  });
  it("grants one reward per date even after reloading persisted JSON", () => {
    const state = claimLoginBonus(initial(), date(28));
    expect(state.coins).toBe(550);
    expect(claimLoginBonus(state, date(28))).toBe(state);
    expect(
      claimLoginBonus(JSON.parse(JSON.stringify(state)), date(28)).coins,
    ).toBe(550);
  });
  it("cycles all seven rewards and keeps the cycle when a day is skipped", () => {
    let state = initial();
    for (let i = 0; i < 8; i++) {
      const before = state.coins;
      state = claimLoginBonus(state, date(1 + i * 2));
      expect(state.coins - before).toBe(LOGIN_REWARDS[i % 7]);
      expect(loginProgress(state.attendance, date(1 + i * 2)).step).toBe(i % 7);
    }
    expect(state.attendance.days).toHaveLength(8);
  });
  it("separates cumulative, current and longest streaks across month/year boundaries", () => {
    const attendance = {
      days: [
        "2025-12-30",
        "2025-12-31",
        "2026-01-01",
        "2026-01-04",
        "2026-01-05",
      ],
      claims: {},
    };
    expect(attendanceStats(attendance, new Date(2026, 0, 5))).toMatchObject({
      total: 5,
      streak: 2,
      longest: 3,
    });
    expect(attendanceStats(attendance, new Date(2026, 0, 6)).streak).toBe(2);
    expect(attendanceStats(attendance, new Date(2026, 0, 7)).streak).toBe(0);
  });
  it("migrates known study dates without inventing unknown earlier visits", () => {
    const migrated = normalizeAttendance(undefined, {
      "2026-09-01": {},
      "2026-09-05": {},
    });
    expect(migrated.days).toEqual(["2026-09-01", "2026-09-05"]);
    expect(migrated.claims).toEqual({});
    expect(
      normalizeAttendance({ days: ["bad", "2026-02-30"], claims: null }).days,
    ).toEqual([]);
  });
});

describe("permanent first-clear dates", () => {
  it("records the first successful level and preserves its date when stars improve", () => {
    const failed = saveLevelResult(initial(), 1, 0, date(27));
    expect(failed.levelFirstClears).toEqual({});
    const first = saveLevelResult(failed, 1, 1, date(28));
    const improved = saveLevelResult(first, 1, 3, date(29));
    expect(improved.levelFirstClears).toEqual({ 1: "2026-09-28" });
    expect(improved.levelStars[1]).toBe(3);
    expect(saveLevelResult(improved, 1, 2, date(30))).toBe(improved);
  });
  it("keeps an old undated clear undated when replayed", () => {
    const old = { ...initial(), levelStars: { 4: 1 } };
    expect(normalizeFirstClears(undefined, old.levelStars)).toEqual({
      4: null,
    });
    expect(saveLevelResult(old, 4, 3, date(28)).levelFirstClears).toEqual({
      4: null,
    });
  });
  it("records first quest clear and session level metadata without overwriting later", () => {
    const rows = Array.from({ length: 5 }, () => ({
      problem: generateLearningProblem("mental", 1),
      correct: true,
    }));
    const first = recordLearningSession(
      initial(),
      { id: "first", mode: "quest", zoneId: "forest", difficulty: 1, rows },
      date(28),
    );
    const again = recordLearningSession(
      first,
      { id: "again", mode: "quest", zoneId: "forest", difficulty: 1, rows },
      date(29),
    );
    expect(again.learning.questFirstClears.forest).toBe("2026-09-28");
    expect(again.learning.sessions[1]).toMatchObject({
      zoneId: "forest",
      difficulty: 1,
      date: "2026-09-29",
    });
    const flash = recordLearningSession(
      again,
      { id: "flash", mode: "flash", level: 9, rows, legacyReward: true },
      date(29),
    );
    expect(flash.learning.sessions[2].level).toBe(9);
  });
  it("shows an actual clear date and identifies undated old records", () => {
    const state = {
      ...initial(),
      levelStars: { 1: 3, 2: 1 },
      levelFirstClears: { 1: "2026-09-28", 2: null },
    };
    render(<MilestoneRecords state={state} />);
    expect(screen.getByText("2026 / 09 / 28")).toBeTruthy();
    expect(screen.getByText("日付の記録なし")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("クリアしたレベルだけ表示"));
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });
});

describe("clock, persistence and real claim button", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 28, 23, 59, 59));
  });
  it("handles StrictMode, midnight and repeated claims, then restores on remount", () => {
    const { result, unmount } = renderHook(() => useGameState(), {
      wrapper: StrictMode,
    });
    expect(result.current.state.attendance.days).toEqual(["2026-09-28"]);
    act(() => {
      result.current.claimLogin();
      result.current.claimLogin();
    });
    expect(result.current.state.coins).toBe(550);
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.state.today).toBe("2026-09-29");
    expect(result.current.state.attendance.days).toHaveLength(2);
    act(() => result.current.claimLogin());
    expect(result.current.state.coins).toBe(610);
    unmount();
    const restored = renderHook(() => useGameState());
    expect(restored.result.current.state.coins).toBe(610);
    expect(restored.result.current.state.attendance.days).toHaveLength(2);
  });
  it("the login button pays once and becomes received", () => {
    function Demo() {
      const { state, claimLogin } = useGameState();
      return (
        <LoginBonus
          attendance={state.attendance}
          onClaim={claimLogin}
          onRecords={() => {}}
        />
      );
    }
    render(<Demo />);
    fireEvent.click(
      screen.getByRole("button", { name: "きょうの 50 コインを受け取る" }),
    );
    expect(
      screen.getByRole("button", { name: "きょうは受取済み" }).disabled,
    ).toBe(true);
    expect(screen.getByRole("status").textContent).toContain(
      "50 コインを受け取りました",
    );
    expect(JSON.parse(localStorage.getItem("sticker-book-v1")).coins).toBe(550);
  });
});
