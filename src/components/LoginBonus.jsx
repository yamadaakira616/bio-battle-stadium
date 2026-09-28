import Icon from "./Icon";
import {
  LOGIN_REWARDS,
  loginProgress,
  attendanceStats,
} from "../utils/attendance";

export default function LoginBonus({ attendance, onClaim, onRecords }) {
  const progress = loginProgress(attendance),
    stats = attendanceStats(attendance);
  return (
    <section className="panel login-bonus" aria-label="ログインボーナス">
      <div className="login-bonus-heading">
        <div className="login-bonus-title">
          <span className="stat-icon amber">
            <Icon name="gift" />
          </span>
          <div>
            <p className="eyebrow">WELCOME BACK, EXPLORER</p>
            <h2>きょうも、冒険にようこそ！</h2>
            <p>
              累計 <b>{stats.total}日</b> プレイ中 · 連続{" "}
              <b>{stats.streak}日</b>
            </p>
          </div>
        </div>
        <button
          className="primary-button"
          disabled={progress.claimedToday}
          onClick={onClaim}
        >
          {progress.claimedToday ? (
            <>
              <Icon name="check" />
              きょうは受取済み
            </>
          ) : (
            <>
              <Icon name="gift" />
              きょうの {progress.reward} コインを受け取る
            </>
          )}
        </button>
      </div>
      <ol className="login-stamps" aria-label="7回のログインボーナス">
        {LOGIN_REWARDS.map((reward, i) => {
          const done =
            i < progress.step || (i === progress.step && progress.claimedToday);
          return (
            <li
              key={i}
              className={`${done ? "received" : ""} ${i === progress.step ? "current" : ""} ${i === 6 ? "special" : ""}`}
              aria-current={i === progress.step ? "step" : undefined}
            >
              <span>{i + 1}回目</span>
              <Icon
                name={done ? "check" : i === 6 ? "trophy" : "gift"}
                size={23}
              />
              <strong>◈ {reward}</strong>
              <small>
                {done
                  ? "受取済み"
                  : i === progress.step
                    ? "きょうのボーナス"
                    : "おたのしみ"}
              </small>
            </li>
          );
        })}
      </ol>
      <div className="login-bonus-footer">
        <p role="status">
          {progress.claimedToday
            ? `きょうは ${progress.reward} コインを受け取りました。また遊びにきてね！`
            : "1日1回もらえるよ。間が空いても、つづきから。7回で一周！"}
        </p>
        <button className="text-button" onClick={onRecords}>
          プレイの足あとを見る <Icon name="arrow" size={15} />
        </button>
      </div>
    </section>
  );
}
