import Icon from "./Icon";
import { HUNDRED_COURSES, HUNDRED_VARIANTS } from "../utils/hundredAbacus";

export default function HundredRecords({ learning }) {
  return (
    <section className="panel hundred-records">
      <div className="section-heading">
        <h2>
          <Icon name="abacus" /> 1〜100 そろばんロード
        </h2>
        <span className="small-badge">100 STEPS</span>
      </div>
      <p>
        順足しと165くり返しの到達点。1分のベストは、時間いっぱい計算して正解した記録です。
      </p>
      <div className="hundred-record-grid">
        {Object.entries(HUNDRED_COURSES).map(([course, item]) => (
          <div className="hundred-record-course" key={course}>
            <strong>{item.name}</strong>
            {Object.entries(HUNDRED_VARIANTS).map(([variant, label]) => {
              const record = learning.hundredRecords[variant][course];
              return (
                <div className="hundred-record-row" key={variant}>
                  <span>{label}</span>
                  <b>
                    {record.best} <small>/ 100</small>
                  </b>
                  <em>
                    {record.firstHundredDate
                      ? `100到達 ${record.firstHundredDate.replaceAll("-", " / ")}`
                      : "100到達はこれから"}
                  </em>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
