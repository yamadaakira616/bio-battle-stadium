export default function Soroban({
  value,
  onChange,
  disabled = false,
  showValue = true,
}) {
  const places = [1000, 100, 10, 1],
    names = ["千", "百", "十", "一"];
  return (
    <div className="soroban-widget">
      <div className="soroban-frame" role="group" aria-label="4けたのそろばん">
        {places.map((place, col) => {
          const digit = Math.floor(value / place) % 10,
            lower = digit % 5,
            upper = digit >= 5;
          function update(next) {
            onChange(value + (next - digit) * place);
          }
          return (
            <div className="soroban-rod" key={place}>
              <span className="rod-label">{names[col]}の位</span>
              <div className="upper-chamber">
                <button
                  type="button"
                  className={`bead upper-bead ${upper ? "engaged" : ""}`}
                  disabled={disabled}
                  aria-label={`${names[col]}の位の5の珠`}
                  aria-pressed={upper}
                  onClick={() => update(upper ? digit - 5 : digit + 5)}
                />
              </div>
              <div className="reckoning-bar">
                <span />
              </div>
              <div className="lower-chamber">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={`bead lower-bead ${n <= lower ? "engaged" : ""}`}
                    style={{ top: `${(n - 1) * 34 + (n <= lower ? 3 : 37)}px` }}
                    disabled={disabled}
                    aria-label={`${names[col]}の位の1の珠${n}`}
                    aria-pressed={n <= lower}
                    onClick={() =>
                      update((upper ? 5 : 0) + (n <= lower ? n - 1 : n))
                    }
                  />
                ))}
              </div>
              <span className="rod-value">{showValue ? digit : "・"}</span>
            </div>
          );
        })}
      </div>
      {showValue && (
        <div className="soroban-total">
          いまの数 <output aria-live="polite">{value.toLocaleString()}</output>
        </div>
      )}
      <p className="soroban-help">
        上の珠は <b>5</b>、下の珠はひとつ <b>1</b>。横の線に寄せた珠を数えます。
      </p>
    </div>
  );
}
