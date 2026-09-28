import LoginBonus from "../components/LoginBonus";
import Icon from "../components/Icon";
import { STICKERS } from "../data/stickers";
import { ZONES, asset, todayProgress, MISSIONS } from "../utils/learning";

export function MissionList({ learning, onClaim }) {
  const day = todayProgress(learning);
  return (
    <div className="mission-list">
      {MISSIONS.map((m) => {
        const count = Math.min(m.target, m.progress(day)),
          claimed = day.claimed.includes(m.id);
        return (
          <div className="mission" key={m.id}>
            <div
              className={`mission-check ${count === m.target ? "done" : ""}`}
            >
              <Icon name={count === m.target ? "check" : "compass"} size={17} />
            </div>
            <div className="mission-copy">
              <strong>{m.name}</strong>
              <span>{m.detail}</span>
              <div className="tiny-progress">
                <i style={{ width: `${(count / m.target) * 100}%` }} />
              </div>
            </div>
            <button
              className="mission-reward"
              disabled={count < m.target || claimed}
              onClick={() => onClaim(m.id)}
              aria-label={`${m.name}の報酬を受け取る`}
            >
              {claimed
                ? "受取済み"
                : count === m.target
                  ? "受け取る"
                  : `${count}/${m.target}`}
              <small>{claimed ? "✓" : `◈ ${m.reward}`}</small>
            </button>
          </div>
        );
      })}
    </div>
  );
}
export default function AdventureHome({
  state,
  onNavigate,
  onPractice,
  onQuest,
  onClaim,
  onClaimLogin,
}) {
  const l = state.learning,
    day = todayProgress(l),
    rank = Math.floor(l.xp / 250) + 1;
  const zone = ZONES.find((z) => !(l.quests[z.id] >= 4)) || ZONES[2];
  const owned = STICKERS.filter((c) => state.collection[c.id]);
  const featured = (
    owned.length
      ? owned
      : STICKERS.filter((c) =>
          [
            "bio-hercules-beetle",
            "bio-tyrannosaurus-rex",
            "bio-triceratops",
          ].includes(c.id),
        )
  ).slice(0, 3);
  return (
    <div className="home-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR NEXT ADVENTURE</p>
          <h1>さあ、きみの力で冒険しよう。</h1>
          <p>そろばんと暗算が、きみの最強の武器になる。</p>
        </div>
        <span className="edition-tag">
          <span className="live-dot" /> ADVENTURE 2.2
        </span>
      </div>
      <section
        className="adventure-hero"
        style={{ backgroundImage: `url(${asset("jungle")})` }}
        aria-label="冒険の入り口"
      >
        <div className="hero-shade" />
        <div className="hero-copy">
          <div className="hero-kicker">
            <span /> LEARN. COLLECT. EVOLVE.
          </div>
          <h2>
            ひらめきが、
            <br />
            世界をひらく。
          </h2>
          <p>
            密林の先に、まだ見ぬ仲間が待っている。
            <br />
            暗算クエストで、新しい冒険へ。
          </p>
          <button
            className="primary-button hero-button"
            onClick={() => onQuest(zone)}
          >
            <Icon name="compass" />
            冒険をはじめる
            <Icon name="arrow" size={18} />
          </button>
          <div className="hero-meta">
            <Icon name="clock" size={14} /> 1回5問 <span>・</span>{" "}
            じっくり考えてOK
          </div>
        </div>
        <div className="hero-location">
          <span className="live-dot" />
          <div>
            <small>EXPEDITION 01</small>
            <strong>はじまりの密林</strong>
          </div>
          <Icon name="compass" />
        </div>
      </section>
      <LoginBonus
        attendance={state.attendance}
        onClaim={onClaimLogin}
        onRecords={() => onNavigate("RECORDS")}
      />
      <div className="stats-strip">
        <div>
          <span className="stat-icon lime">
            <Icon name="trophy" />
          </span>
          <p>
            冒険ランク
            <strong>
              {String(rank).padStart(2, "0")}
              <small> RANK</small>
            </strong>
          </p>
          <div className="rank-progress">
            <span>次まで {250 - (l.xp % 250)} XP</span>
            <div className="tiny-progress">
              <i style={{ width: `${((l.xp % 250) / 250) * 100}%` }} />
            </div>
          </div>
        </div>
        <div>
          <span className="stat-icon amber">
            <Icon name="bolt" />
          </span>
          <p>
            今日のチャレンジ
            <strong>
              {day.answered}
              <small> 問</small>
            </strong>
          </p>
        </div>
        <div>
          <span className="stat-icon cyan">
            <Icon name="cards" />
          </span>
          <p>
            集めたカード
            <strong>
              {owned.length}
              <small> / {STICKERS.length}</small>
            </strong>
          </p>
        </div>
        <div>
          <span className="stat-icon violet">
            <Icon name="check" />
          </span>
          <p>
            学習した日数
            <strong>
              {Object.keys(l.daily).length}
              <small> 日</small>
            </strong>
          </p>
        </div>
      </div>
      <div className="home-columns">
        <div className="home-primary">
          <div className="section-heading">
            <h2>
              <Icon name="abacus" />
              きょうは、何をきたえる？
            </h2>
            <button className="text-button" onClick={() => onNavigate("LEARN")}>
              すべて見る <Icon name="arrow" size={16} />
            </button>
          </div>
          <div className="training-grid">
            <button
              className="training-tile soroban-tile"
              onClick={() => onPractice("soroban")}
            >
              <span className="tile-number">01 / SOROBAN</span>
              <div className="mini-abacus" aria-hidden="true">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n}>
                    <i />
                    <i />
                    <i />
                  </span>
                ))}
              </div>
              <span className="tile-copy">
                <strong>そろばん道場</strong>
                <small>珠をうごかして、数をつかもう。</small>
                <em>
                  基礎からじっくり <Icon name="arrow" size={16} />
                </em>
              </span>
            </button>
            <button
              className="training-tile mental-tile"
              onClick={() => onPractice("mental")}
            >
              <span className="tile-number">02 / MENTAL MATH</span>
              <div className="mental-art" aria-hidden="true">
                <span>7</span>
                <b>＋</b>
                <span>8</span>
                <i>15</i>
              </div>
              <span className="tile-copy">
                <strong>暗算トレーニング</strong>
                <small>ひらめきを、確かな力に。</small>
                <em>
                  たし算・ひき算 <Icon name="arrow" size={16} />
                </em>
              </span>
            </button>
            <button
              className="training-tile flash-tile"
              onClick={() => onNavigate("LEVEL_SELECT")}
            >
              <span className="tile-number">03 / FLASH ANZAN</span>
              <div className="flash-art" aria-hidden="true">
                <Icon name="bolt" size={69} />
                <span>8 3 6</span>
              </div>
              <span className="tile-copy">
                <strong>フラッシュ暗算</strong>
                <small>つぎつぎ現れる数字に挑戦。</small>
                <em>
                  全50レベル <Icon name="arrow" size={16} />
                </em>
              </span>
            </button>
            <button
              className="training-tile hundred-tile"
              onClick={() => onNavigate("HUNDRED")}
            >
              <span className="tile-number">04 / THE 100 STEP ROAD</span>
              <div className="hundred-tile-art" aria-hidden="true">
                <span>1</span>
                <i /> <span>2</span>
                <i /> <span>3</span>
                <b>… 100</b>
              </div>
              <span className="tile-copy">
                <strong>1〜100 そろばんロード</strong>
                <small>順足し・165くり返し。1分にも挑戦！</small>
                <em>
                  全100ステップ <Icon name="arrow" size={16} />
                </em>
              </span>
            </button>
          </div>
          <div className="section-heading worlds-heading">
            <h2>
              <Icon name="compass" />
              冒険のワールド
            </h2>
            <button className="text-button" onClick={() => onNavigate("QUEST")}>
              マップへ <Icon name="arrow" size={16} />
            </button>
          </div>
          <div className="world-preview-grid">
            {ZONES.map((z, i) => {
              const locked = i > 0 && !(l.quests[ZONES[i - 1].id] >= 4);
              return (
                <button
                  key={z.id}
                  className="world-preview"
                  onClick={() => onNavigate("QUEST")}
                  style={{ backgroundImage: `url(${asset(z.image)})` }}
                >
                  <span className="world-status">
                    {locked ? (
                      <>
                        <Icon name="lock" size={13} /> 未解放
                      </>
                    ) : l.quests[z.id] >= 4 ? (
                      "✓ クリア"
                    ) : (
                      "探索できる"
                    )}
                  </span>
                  <div>
                    <small>WORLD 0{i + 1}</small>
                    <strong>{z.title}</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <aside className="home-secondary">
          <section className="panel daily-panel">
            <div className="section-heading">
              <h2>
                <Icon name="gift" />
                デイリーミッション
              </h2>
              <span className="small-badge">TODAY</span>
            </div>
            <p className="panel-intro">小さな一歩で、毎日レベルアップ。</p>
            <MissionList learning={l} onClaim={onClaim} />
          </section>
          <section className="panel companion-panel">
            <div className="section-heading">
              <h2>
                <Icon name="cards" />
                {owned.length ? "きみの仲間" : "これから出会う仲間"}
              </h2>
              <span className="small-badge">COLLECTION</span>
            </div>
            <div className="companion-cards">
              {featured.map((c, i) => (
                <div key={c.id} style={{ "--tilt": `${(i - 1) * 7}deg` }}>
                  <img src={c.imagePath} alt={c.name} loading="lazy" />
                  <span>{state.collection[c.id] ? "MY CARD" : "DISCOVER"}</span>
                </div>
              ))}
            </div>
            <button
              className="secondary-button full-width"
              onClick={() =>
                onNavigate(owned.length ? "ENCYCLOPEDIA" : "GACHA")
              }
            >
              {owned.length ? "生き物図鑑をひらく" : "はじめての仲間をさがす"}
              <Icon name="arrow" size={16} />
            </button>
          </section>
        </aside>
      </div>
      <div className="base-shortcuts">
        <button onClick={() => onNavigate("BATTLE_MAP")}>
          <Icon name="sword" />
          <span>
            <strong>バトルスタジアム</strong>
            <small>集めた仲間で、王国に挑もう。</small>
          </span>
          <Icon name="arrow" />
        </button>
        <button onClick={() => onNavigate("FUSION")}>
          <Icon name="spark" />
          <span>
            <strong>合成ラボ</strong>
            <small>生き物を合成して、新しい姿へ。</small>
          </span>
          <Icon name="arrow" />
        </button>
        <button onClick={() => onPractice("review")}>
          <Icon name="refresh" />
          <span>
            <strong>にがてリベンジ</strong>
            <small>
              {l.mistakes.length
                ? `${l.mistakes.length}問が、つぎの「できた！」に。`
                : "まちがいから、もっと強くなろう。"}
            </small>
          </span>
          <Icon name="arrow" />
        </button>
      </div>
    </div>
  );
}
