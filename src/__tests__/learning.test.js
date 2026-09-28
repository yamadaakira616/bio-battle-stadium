import { describe, it, expect } from "vitest";
import {
  emptyLearning,
  generateLearningProblem,
  recordLearningSession,
  claimLearningMission,
  dateKey,
  normalizeLearning,
  ZONES,
} from "../utils/learning";
const seedState = () => ({
  coins: 500,
  collection: { "existing-card": 2 },
  learning: emptyLearning(),
});
const day = new Date(2026, 8, 28, 10);
function session(id = "one", correct = 5, mode = "mental", zoneId) {
  return {
    id,
    mode,
    zoneId,
    rows: Array.from({ length: 5 }, (_, i) => ({
      problem: generateLearningProblem(mode, 1, i, () => 0.3),
      correct: i < correct,
    })),
  };
}
describe("learning math and progress", () => {
  it("generates exact integer answers for all difficulty levels including zero and carries", () => {
    for (const mode of ["mental", "soroban", "bonds"])
      for (const difficulty of [1, 2, 3])
        for (let i = 0; i < 300; i++) {
          const p = generateLearningProblem(mode, difficulty, i);
          expect(Number.isInteger(p.answer)).toBe(true);
          expect(p.answer).toBeGreaterThanOrEqual(0);
          expect(p.answer).toBeLessThan(10000);
          if (mode === "bonds")
            expect(p.a + p.answer).toBe(difficulty === 1 ? 5 : 10);
          else
            expect(p.answer).toBe(p.operator === "−" ? p.a - p.b : p.a + p.b);
        }
  });
  it("saves a completed session once and preserves existing cards", () => {
    const s = recordLearningSession(seedState(), session(), day);
    expect(s.coins).toBe(600);
    expect(s.learning.xp).toBe(125);
    expect(s.learning.answered).toBe(5);
    expect(s.collection).toEqual({ "existing-card": 2 });
    expect(recordLearningSession(s, session(), day)).toBe(s);
  });
  it("does not add the flash reward twice", () => {
    const s = recordLearningSession(
      seedState(),
      { ...session("flash", 5, "flash"), legacyReward: true },
      day,
    );
    expect(s.coins).toBe(500);
    expect(s.learning.correct).toBe(5);
  });
  it("quest threshold unlocks only at four and first card reward is granted once", () => {
    const failed = recordLearningSession(
      seedState(),
      session("fail", 3, "quest", "forest"),
      day,
    );
    expect(failed.learning.quests.forest).toBe(3);
    expect(failed.collection[ZONES[0].reward]).toBeUndefined();
    const cleared = recordLearningSession(
      failed,
      session("clear", 4, "quest", "forest"),
      day,
    );
    expect(cleared.collection[ZONES[0].reward]).toBe(1);
    expect(cleared.coins - failed.coins).toBe(180);
    const retry = recordLearningSession(
      cleared,
      session("again", 5, "quest", "forest"),
      day,
    );
    expect(retry.collection[ZONES[0].reward]).toBe(1);
    expect(retry.coins - cleared.coins).toBe(100);
  });
  it("cannot clear a locked area", () => {
    const s = recordLearningSession(
      seedState(),
      session("cheat", 5, "quest", "volcano"),
      day,
    );
    expect(s.learning.quests.volcano).toBeUndefined();
    expect(s.collection[ZONES[2].reward]).toBeUndefined();
  });
  it("daily missions cannot be claimed early or more than once, reset on a new day", () => {
    const initial = seedState();
    expect(claimLearningMission(initial, "start", day)).toBe(initial);
    const s = recordLearningSession(initial, session(), day);
    const claimed = claimLearningMission(s, "start", day);
    expect(claimed.coins).toBe(650);
    expect(claimLearningMission(claimed, "start", day)).toBe(claimed);
    expect(claimLearningMission(claimed, "start", new Date(2026, 8, 29))).toBe(
      claimed,
    );
  });
  it("review removes only solved mistakes and stores at most 50", () => {
    let s = recordLearningSession(seedState(), session("wrong", 0), day);
    const problems = [...s.learning.mistakes];
    expect(problems.length).toBeGreaterThan(0);
    s = recordLearningSession(
      s,
      {
        id: "review",
        mode: "review",
        rows: [{ problem: problems[0], correct: true }],
      },
      day,
    );
    expect(
      s.learning.mistakes.find((p) => p.id === problems[0].id),
    ).toBeUndefined();
    expect(s.learning.mistakes.length).toBe(problems.length - 1);
  });
  it("counts a daily streak once per local calendar day", () => {
    let s = recordLearningSession(seedState(), session("a"), day);
    s = recordLearningSession(s, session("b"), day);
    expect(s.learning.streak).toBe(1);
    s = recordLearningSession(s, session("c"), new Date(2026, 8, 29));
    expect(s.learning.streak).toBe(2);
    s = recordLearningSession(s, session("d"), new Date(2026, 9, 1));
    expect(s.learning.streak).toBe(1);
    expect(dateKey(new Date(2026, 8, 28, 0, 1))).toBe("2026-09-28");
  });
  it("provides safe defaults for old saves", () => {
    expect(normalizeLearning()).toEqual(emptyLearning());
    expect(
      normalizeLearning({ xp: -1, sessions: null, mistakes: "bad", daily: [] }),
    ).toMatchObject({ xp: 0, sessions: [], mistakes: [], daily: {} });
  });
});
