import { useState } from "react";
import Icon from "./Icon";
import { dateKey } from "../utils/learning";
import { attendanceStats, normalizeAttendance } from "../utils/attendance";

export default function AttendanceRecords({ attendance, learning }) {
  const [offset, setOffset] = useState(0);
  const now = new Date(),
    today = dateKey(now);
  const stats = attendanceStats(attendance, now),
    data = normalizeAttendance(attendance);
  const month = new Date(now.getFullYear(), now.getMonth() + offset, 1, 12);
  const last = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
    12,
  ).getDate();
  const cells = [
    ...Array(month.getDay()).fill(null),
    ...Array.from({ length: last }, (_, i) => i + 1),
  ];
  return (
    <section className="panel attendance-records">
      <div className="section-heading">
        <h2>
          <Icon name="compass" />
          きみのプレイの足あと
        </h2>
        <span className="small-badge">MY JOURNEY</span>
      </div>
      <div className="attendance-layout">
        <div>
          <div className="attendance-totals">
            {[
              [stats.total, "累計プレイ日数"],
              [stats.streak, "連続プレイ"],
              [stats.longest, "最長連続記録"],
            ].map(([value, label]) => (
              <div key={label}>
                <strong>
                  {value}
                  <small>日</small>
                </strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="attendance-note">
            記録のはじまり：
            {stats.first
              ? stats.first.replaceAll("-", " / ")
              : "まだ記録がありません"}
            <br />
            アプリを開いた日を、1日1回カウントします。
            <br />
            学習を最後まで終えた日は、カレンダーに星がつきます。
          </p>
          <div className="calendar-legend">
            <span>
              <i />
              プレイした日
            </span>
            <span>★ 学習した日</span>
            <span>◈ ボーナス受取</span>
          </div>
        </div>
        <div>
          <div className="calendar-heading">
            <button
              className="sound-button"
              aria-label="前の月"
              onClick={() => setOffset((o) => o - 1)}
            >
              <Icon name="back" size={17} />
            </button>
            <h3>
              {month.getFullYear()}年 {month.getMonth() + 1}月
            </h3>
            <button
              className="sound-button"
              aria-label="次の月"
              disabled={offset === 0}
              onClick={() => setOffset((o) => Math.min(0, o + 1))}
            >
              <Icon name="arrow" size={17} />
            </button>
          </div>
          <div
            className="play-calendar"
            role="grid"
            aria-label={`${month.getFullYear()}年${month.getMonth() + 1}月のプレイ記録`}
          >
            <div className="calendar-row" role="row">
              {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                <span key={d} role="columnheader">
                  {d}
                </span>
              ))}
            </div>
            {Array.from({ length: Math.ceil(cells.length / 7) }, (_, week) => (
              <div className="calendar-row" role="row" key={week}>
                {Array.from({ length: 7 }, (_, column) => {
                  const day = cells[week * 7 + column];
                  if (!day) return <span role="gridcell" key={column} />;
                  const key = dateKey(
                      new Date(month.getFullYear(), month.getMonth(), day, 12),
                    ),
                    visited = data.days.includes(key),
                    studied = learning.daily[key]?.answered > 0,
                    claimed = !!data.claims[key];
                  return (
                    <div
                      role="gridcell"
                      key={column}
                      className={`calendar-day ${visited ? "visited" : ""} ${key === today ? "today" : ""}`}
                      aria-current={key === today ? "date" : undefined}
                      aria-label={`${month.getMonth() + 1}月${day}日${visited ? "、プレイ済み" : ""}${studied ? "、学習済み" : ""}${claimed ? "、ボーナス受取済み" : ""}`}
                    >
                      <b>{day}</b>
                      <span>
                        {studied ? "★" : ""}
                        {claimed ? " ◈" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
