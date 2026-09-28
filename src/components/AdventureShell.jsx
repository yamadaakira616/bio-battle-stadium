import Icon from "./Icon";
const NAV = [
  ["HOME", "home", "冒険基地"],
  ["QUEST", "compass", "暗算クエスト"],
  ["LEARN", "abacus", "トレーニング"],
  ["ENCYCLOPEDIA", "cards", "生き物図鑑"],
  ["BATTLE_MAP", "sword", "バトルスタジアム"],
  ["GACHA", "gift", "カードガチャ"],
  ["FUSION", "spark", "合成ラボ"],
  ["RECORDS", "chart", "成長のきろく"],
];
const MOBILE_LABELS = {
  LEARN: "練習",
  ENCYCLOPEDIA: "図鑑",
  GACHA: "ガチャ",
  RECORDS: "きろく",
};
export default function AdventureShell({
  screen,
  state,
  onNavigate,
  onSound,
  children,
}) {
  const rank = Math.floor((state.learning?.xp || 0) / 250) + 1;
  const current = NAV.find((n) => n[0] === screen)?.[2] || "チャレンジ中";
  return (
    <div className="adventure-app">
      <a className="skip-link" href="#main-content">
        メインへすすむ
      </a>
      <aside className="base-sidebar">
        <button
          className="brand"
          onClick={() => onNavigate("HOME")}
          aria-label="冒険基地へ"
        >
          <span className="brand-symbol">
            <Icon name="compass" size={29} />
          </span>
          <span>
            BIO BATTLE<small>STADIUM</small>
          </span>
        </button>
        <div className="nav-label">EXPLORE & LEARN</div>
        <nav aria-label="メインメニュー">
          {NAV.map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`nav-item ${screen === id ? "active" : ""}`}
              aria-current={screen === id ? "page" : undefined}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {id === "QUEST" && <small>NEW</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-tip">
          <Icon name="spark" />
          <strong>「できた！」が、きみの力。</strong>
          <p>1日5問から、冒険をはじめよう。</p>
        </div>
        <div className="sidebar-version">
          <span className="live-dot" /> ADVENTURE UPDATE <b>2.2.1</b>
        </div>
      </aside>
      <div className="base-body">
        <header className="base-header">
          <div className="breadcrumb">
            <span>BIO BATTLE STADIUM</span>
            <span>/</span>
            <strong>{current}</strong>
          </div>
          <div className="header-resources">
            <span className="coin-pill">
              <span>◈</span> {state.coins.toLocaleString()}
              <small>コイン</small>
            </span>
            <button
              className="sound-button"
              onClick={onSound}
              aria-label={
                state.soundEnabled ? "音をオフにする" : "音をオンにする"
              }
            >
              <Icon name={state.soundEnabled ? "sound" : "mute"} />
            </button>
            <span className="rank-avatar" title={`冒険ランク ${rank}`}>
              {String(rank).padStart(2, "0")}
            </span>
          </div>
        </header>
        {state.storageError && (
          <div className="storage-warning" role="alert">
            この端末に記録を保存できません。ブラウザーの保存容量・設定を確認してください。
          </div>
        )}
        <main id="main-content" tabIndex={-1} className="base-main">
          {children}
        </main>
        <footer className="base-footer">
          <span>BIO BATTLE STADIUM</span>
          <span>学ぶ。集める。もっと強くなる。</span>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="クイックメニュー">
        {NAV.filter((n) =>
          ["HOME", "QUEST", "LEARN", "ENCYCLOPEDIA", "GACHA", "RECORDS"].includes(n[0]),
        ).map(([id, icon, label]) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            aria-current={screen === id ? "page" : undefined}
            className={[screen === id && "active", id === "GACHA" && "gacha-entry"]
              .filter(Boolean)
              .join(" ")}
          >
            <Icon name={icon} />
            <span>{MOBILE_LABELS[id] || label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
