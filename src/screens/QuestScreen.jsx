import Icon from "../components/Icon";
import { ZONES, asset } from "../utils/learning";
export default function QuestScreen({ learning, onSelect }) {
  return (
    <div className="quest-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">THE WORLD IS WAITING</p>
          <h1>暗算で、冒険の道をひらこう。</h1>
          <p>
            5問中4問せいかいで次のエリアへ。クリアして新しい仲間を迎えよう。
          </p>
        </div>
        <span className="edition-tag">
          <Icon name="compass" size={17} />
          {ZONES.filter((z) => learning.quests[z.id] >= 4).length} / 3 エリア
        </span>
      </div>
      <div className="quest-map">
        {ZONES.map((z, i) => {
          const locked = i > 0 && !(learning.quests[ZONES[i - 1].id] >= 4),
            clear = learning.quests[z.id] >= 4;
          return (
            <section
              className={`quest-zone ${locked ? "locked" : ""}`}
              key={z.id}
              style={{ "--zone-color": z.color }}
            >
              <div
                className="quest-zone-art"
                style={{ backgroundImage: `url(${asset(z.image)})` }}
              >
                <span className="zone-number">0{i + 1}</span>
                <span className="zone-label">
                  {locked ? (
                    <>
                      <Icon name="lock" size={15} />
                      未解放
                    </>
                  ) : clear ? (
                    <>
                      <Icon name="check" size={15} />
                      クリア
                    </>
                  ) : (
                    "探索できる"
                  )}
                </span>
                <div>
                  <p>EXPEDITION 0{i + 1}</p>
                  <h2>{z.title}</h2>
                </div>
              </div>
              <div className="quest-zone-info">
                <div
                  className="quest-stars"
                  aria-label={`最高${learning.quests[z.id] || 0}問正解`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={
                        n <= (learning.quests[z.id] || 0) ? "earned" : ""
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <h3>{z.subtitle}</h3>
                <p>
                  初回クリア：{z.creature}
                  <br />
                  のカード ＋ 100コイン
                </p>
                <button
                  className={locked ? "secondary-button" : "primary-button"}
                  disabled={locked}
                  onClick={() => onSelect(z)}
                >
                  {locked ? (
                    <>
                      <Icon name="lock" size={16} />
                      {ZONES[i - 1].title}をクリアしよう
                    </>
                  ) : (
                    <>
                      {clear ? "もう一度チャレンジ" : "このエリアを探索"}
                      <Icon name="arrow" size={18} />
                    </>
                  )}
                </button>
              </div>
            </section>
          );
        })}
      </div>
      <div className="quest-guide panel">
        <Icon name="spark" size={28} />
        <div>
          <h2>力をためてからでも、大丈夫。</h2>
          <p>
            むずかしいときは「トレーニング」へ。そろばんで数を確かめてから、暗算に挑戦してみよう。
          </p>
        </div>
      </div>
    </div>
  );
}
