import { useState } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import LearningScreen from "../screens/LearningScreen";
import Soroban from "../components/Soroban";
import { emptyLearning } from "../utils/learning";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const state = { learning: emptyLearning() };
describe("interactive learning", () => {
  it("soroban manipulates lower and upper beads without corrupting other places", () => {
    function Demo() {
      const [value, set] = useState(120);
      return <Soroban value={value} onChange={set} />;
    }
    render(<Demo />);
    fireEvent.click(
      screen.getByRole("button", { name: "一の位の1の珠3", exact: true }),
    );
    expect(screen.getByRole("status").textContent).toBe("123");
    fireEvent.click(
      screen.getByRole("button", { name: "一の位の5の珠", exact: true }),
    );
    expect(screen.getByRole("status").textContent).toBe("128");
    fireEvent.click(
      screen.getByRole("button", { name: "一の位の1の珠2", exact: true }),
    );
    expect(screen.getByRole("status").textContent).toBe("126");
  });
  it("records only after five answers, including zero, and prevents repeated reward submission", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.3);
    const finish = vi.fn();
    render(
      <LearningScreen
        state={state}
        initialMode="mental"
        onFinish={finish}
        onBack={() => {}}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "5問のチャレンジをはじめる" }),
    );
    expect(finish).not.toHaveBeenCalled();
    for (let i = 0; i < 5; i++) {
      fireEvent.change(screen.getByLabelText("きみの答え"), {
        target: { value: i % 2 ? "0" : "6" },
      });
      fireEvent.click(screen.getByRole("button", { name: "こたえあわせ" }));
      expect(screen.getByRole("status").textContent).toContain("せいかい");
      fireEvent.click(
        screen.getByRole("button", {
          name: i === 4 ? "結果をみる" : "つぎの問題へ",
        }),
      );
    }
    expect(finish).toHaveBeenCalledTimes(1);
    expect(finish.mock.calls[0][0].rows.every((r) => r.correct)).toBe(true);
    expect(screen.getByText("パーフェクト！")).toBeTruthy();
  });
  it("empty review gives a working alternative", () => {
    render(
      <LearningScreen state={state} initialMode="review" onBack={() => {}} />,
    );
    expect(screen.getByText("いまは復習する問題がありません。")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "暗算にチャレンジ" }));
    expect(
      screen.getByRole("button", { name: "5問のチャレンジをはじめる" }),
    ).toBeTruthy();
  });
});
