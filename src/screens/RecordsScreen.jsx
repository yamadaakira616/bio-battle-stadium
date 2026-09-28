import AttendanceRecords from "../components/AttendanceRecords";
import MilestoneRecords from "../components/MilestoneRecords";
import Icon from "../components/Icon";
import { MODES, ZONES, dateKey } from "../utils/learning";
export default function RecordsScreen({ state, learning: l, onReview }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return {
      key: dateKey(d),
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      count: l.daily[dateKey(d)]?.answered || 0,
    };
  });
  const max = Math.max(5, ...days.map((d) => d.count));
  const badges = [
    ["はじめの一歩", l.answered >= 5, "5問に挑戦"],
    ["正確なひらめき", l.correct >= 25, "25問せいかい"],
    ["探検家", Object.values(l.quests).some((v) => v >= 4), "エリアをクリア"],
    [
      "世界の冒険者",
      ZONES.every((z) => l.quests[z.id] >= 4),
      "全エリアをクリア",
    ],
  ];
  return (
    <div className="records-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">EVERY STEP COUNTS</p>
          <h1>成長のきろく</h1>
          <p>昨日のきみより、少し先へ。積み重ねた力を見てみよう。</p>
        </div>
        <button className="secondary-button" onClick={onReview}>
          <Icon name="refresh" />
          にがてリベンジ {l.mistakes.length}問
        </button>
      </div>
      <AttendanceRecords attendance={state.attendance} learning={l} />
      <div className="record-stats">
        {[
          [l.answered, "チャレンジした問題"],
          [
            `${l.answered ? Math.round((l.correct / l.answered) * 100) : 0}%`,
            "せいかい率",
          ],
          [Object.keys(l.daily).length, "学習した日数"],
          [l.xp, "獲得した経験値"],
        ].map(([v, label]) => (
          <div className="panel" key={label}>
            <strong>{v}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="records-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>
              <Icon name="chart" />
              この7日間のチャレンジ
            </h2>
            <span className="small-badge">問題数</span>
          </div>
          <div className="weekly-chart">
            {days.map((d) => (
              <div key={d.key}>
                <strong>{d.count}</strong>
                <div className="chart-track">
                  <i style={{ height: `${(d.count / max) * 100}%` }} />
                </div>
                <span>{d.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>
              <Icon name="abacus" />
              きたえた力
            </h2>
          </div>
          <div className="skill-records">
            {["soroban", "mental", "bonds", "flash", "quest", "review"].map(
              (m) => {
                const s = l.skills[m] || { answered: 0, correct: 0 };
                return (
                  <div key={m}>
                    <div>
                      <strong>{MODES[m]?.name || "暗算クエスト"}</strong>
                      <span>
                        {s.correct} / {s.answered}問 せいかい
                      </span>
                    </div>
                    <div className="tiny-progress">
                      <i
                        style={{
                          width: `${s.answered ? (s.correct / s.answered) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>
      </div>
      <MilestoneRecords state={state} />
      <section className="panel badges-panel">
        <div className="section-heading">
          <h2>
            <Icon name="trophy" />
            冒険バッジ
          </h2>
        </div>
        <div className="badge-grid">
          {badges.map(([name, earned, desc]) => (
            <div key={name} className={earned ? "earned" : ""}>
              <Icon name={earned ? "trophy" : "lock"} size={32} />
              <strong>{name}</strong>
              <span>{earned ? "獲得！" : desc}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel history-panel">
        <div className="section-heading">
          <h2>
            <Icon name="clock" />
            最近のチャレンジ
          </h2>
        </div>
        {l.sessions.length ? (
          <div className="history-table">
            <table>
              <thead>
                <tr>
                  <th>日付</th>
                  <th>練習</th>
                  <th>レベル・内容</th>
                  <th>せいかい</th>
                </tr>
              </thead>
              <tbody>
                {l.sessions
                  .slice(-10)
                  .reverse()
                  .map((s) => (
                    <tr key={s.id}>
                      <td>{s.date.replaceAll("-", " / ")}</td>
                      <td>{MODES[s.mode]?.name || "暗算クエスト"}</td>
                      <td>
                        {s.mode === "flash"
                          ? s.level
                            ? `Lv. ${s.level}`
                            : "レベルの記録なし"
                          : s.zoneId
                            ? ZONES.find((z) => z.id === s.zoneId)?.title
                            : s.mode === "bonds"
                              ? s.difficulty
                                ? `${s.difficulty === 1 ? 5 : 10}のなかま`
                                : "—"
                              : s.difficulty && s.mode !== "review"
                                ? `${s.difficulty}けた`
                                : "—"}
                      </td>
                      <td>
                        {s.correct} / {s.total} 問
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Icon name="compass" />
            <p>最初の5問から、きみの記録がはじまります。</p>
          </div>
        )}
      </section>
      <p className="record-footnote">
        記録はこのブラウザーに保存されます。フラッシュ暗算を含む、新バージョンで完了した練習が集計対象です。
      </p>
    </div>
  );
}
