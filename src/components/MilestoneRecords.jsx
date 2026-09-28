import { useState } from "react";
import Icon from "./Icon";
import { getLevelConfig, TOTAL_LEVELS } from "../utils/gameLogic";
import { ZONES } from "../utils/learning";

const displayDate = (date) =>
  date ? date.replaceAll("-", " / ") : "日付の記録なし";
export default function MilestoneRecords({ state }) {
  const [onlyCleared, setOnlyCleared] = useState(false);
  const cleared = Object.keys(state.levelStars).filter(
    (l) => state.levelStars[l] > 0,
  );
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).filter(
    (l) => !onlyCleared || state.levelStars[l] > 0,
  );
  const highest = Math.max(0, ...cleared.map(Number));
  return (
    <section className="panel milestone-records">
      <div className="section-heading">
        <h2>
          <Icon name="trophy" />
          はじめてクリアした日
        </h2>
        <span className="small-badge">FIRST CLEAR</span>
      </div>
      <div className="milestone-summary">
        <div>
          <strong>
            {cleared.length}
            <small> / {TOTAL_LEVELS} レベル</small>
          </strong>
          <span>フラッシュ暗算のクリア数</span>
        </div>
        <div>
          <strong>{highest ? `Lv. ${highest}` : "これから！"}</strong>
          <span>
            {highest
              ? `最高クリアレベル · ${displayDate(state.levelFirstClears?.[highest])}`
              : "初クリアの記念日をつくろう"}
          </span>
        </div>
      </div>
      <p className="record-footnote">
        最初にクリアした日をずっと残します。星はこれまでの最高記録です。過去の日付がないレベルは推測しません。
      </p>
      <label className="clear-filter">
        <input
          type="checkbox"
          checked={onlyCleared}
          onChange={(e) => setOnlyCleared(e.target.checked)}
        />
        クリアしたレベルだけ表示
      </label>
      <div className="clear-level-grid">
        {levels.map((level) => {
          const stars = state.levelStars[level] || 0,
            config = getLevelConfig(level);
          return (
            <article key={level} className={stars ? "cleared" : ""}>
              <div>
                <h3>Lv. {String(level).padStart(2, "0")}</h3>
                <span aria-label={`最高${stars}つぼし`}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className={s <= stars ? "earned" : ""}>
                      ★
                    </i>
                  ))}
                </span>
              </div>
              <p>
                {config.label} · {config.ms / 1000}秒
              </p>
              <small>
                {stars
                  ? displayDate(state.levelFirstClears?.[level])
                  : "まだクリアしていません"}
              </small>
            </article>
          );
        })}
      </div>
      {!levels.length && (
        <p className="empty-state">クリアの記録は、これからはじまります。</p>
      )}
      <h3 className="quest-clear-heading">暗算クエストの初クリア</h3>
      <div className="quest-clear-dates">
        {ZONES.map((z) => (
          <div key={z.id}>
            <Icon
              name={state.learning.quests[z.id] >= 4 ? "check" : "compass"}
              size={18}
            />
            <strong>{z.title}</strong>
            <span>
              {state.learning.quests[z.id] >= 4
                ? displayDate(state.learning.questFirstClears?.[z.id])
                : "これから探索"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
