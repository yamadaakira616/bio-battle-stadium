import { dateKey } from "./learning";

export const LOGIN_REWARDS = [50, 60, 70, 80, 100, 120, 200];

export function validDateKey(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const [year, month, day] = value.split("-").map(Number);
  return dateKey(new Date(year, month - 1, day, 12)) === value;
}

export function normalizeAttendance(value, daily = {}) {
  const source = value && typeof value === "object" ? value : {};
  const claims = Object.fromEntries(
    Object.entries(source.claims || {}).filter(
      ([day, reward]) => validDateKey(day) && LOGIN_REWARDS.includes(reward),
    ),
  );
  const days = [
    ...new Set(
      [
        ...(Array.isArray(source.days) ? source.days : []),
        ...Object.keys(daily),
        ...Object.keys(claims),
      ].filter(validDateKey),
    ),
  ].sort();
  return { days, claims };
}

export function recordVisit(state, date = new Date()) {
  const key = dateKey(date);
  const attendance = normalizeAttendance(
    state.attendance,
    state.learning?.daily,
  );
  if (state.attendance?.days?.includes(key)) return state;
  return {
    ...state,
    attendance: {
      ...attendance,
      days: [...new Set([...attendance.days, key])].sort(),
    },
  };
}

export function loginProgress(attendance, date = new Date()) {
  const normalized = normalizeAttendance(attendance);
  const today = dateKey(date),
    claimedToday = Object.hasOwn(normalized.claims, today);
  const count = Object.keys(normalized.claims).length;
  const step = (count - (claimedToday ? 1 : 0)) % LOGIN_REWARDS.length;
  return {
    claimedToday,
    step,
    count,
    reward: claimedToday ? normalized.claims[today] : LOGIN_REWARDS[step],
  };
}

export function claimLoginBonus(state, date = new Date()) {
  const visited = recordVisit(state, date);
  const attendance = normalizeAttendance(
    visited.attendance,
    state.learning?.daily,
  );
  const progress = loginProgress(attendance, date);
  if (progress.claimedToday) return visited;
  return {
    ...visited,
    coins: visited.coins + progress.reward,
    attendance: {
      ...attendance,
      claims: { ...attendance.claims, [dateKey(date)]: progress.reward },
    },
  };
}

export function attendanceStats(attendance, date = new Date()) {
  const today = dateKey(date);
  const days = normalizeAttendance(attendance).days.filter(
    (day) => day <= today,
  );
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  let longest = 0,
    run = 0,
    last = null;
  for (const day of days) {
    const [y, m, d] = day.split("-").map(Number);
    const before = new Date(y, m - 1, d, 12);
    before.setDate(before.getDate() - 1);
    run = last === dateKey(before) ? run + 1 : 1;
    longest = Math.max(longest, run);
    last = day;
  }
  return {
    total: days.length,
    streak: last === today || last === dateKey(previous) ? run : 0,
    longest,
    first: days[0] || null,
  };
}

// A null date means a clear predates date tracking; never invent or overwrite it.
export function normalizeFirstClears(dates, scores, threshold = 1) {
  const result = {};
  for (const [id, score] of Object.entries(scores || {})) {
    if (score >= threshold)
      result[id] = validDateKey(dates?.[id]) ? dates[id] : null;
  }
  return result;
}

export function saveLevelResult(state, level, stars, date = new Date()) {
  if (
    !Number.isInteger(level) ||
    level < 1 ||
    level > 50 ||
    !Number.isInteger(stars) ||
    stars < 1 ||
    stars > 3
  )
    return state;
  const key = String(level),
    previous = state.levelStars[key] || 0;
  if (stars <= previous) return state;
  const levelStars = { ...state.levelStars, [key]: stars };
  const firstClears = normalizeFirstClears(
    state.levelFirstClears,
    state.levelStars,
  );
  if (previous === 0) firstClears[key] = dateKey(date);
  return {
    ...state,
    levelStars,
    levelFirstClears: firstClears,
    totalStars: Object.values(levelStars).reduce(
      (sum, value) => sum + value,
      0,
    ),
  };
}
