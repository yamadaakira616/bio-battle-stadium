export const MODES = {
  soroban: {
    name: "そろばん道場",
    caption: "珠をうごかして、数をつかもう。",
    icon: "abacus",
  },
  mental: {
    name: "暗算トレーニング",
    caption: "たし算・ひき算で、考える力を育てよう。",
    icon: "bolt",
  },
  bonds: {
    name: "5と10のひみつ",
    caption: "あといくつ？ 数のなかまを見つけよう。",
    icon: "spark",
  },
  review: {
    name: "にがてリベンジ",
    caption: "まちがいは、強くなるチャンス。",
    icon: "refresh",
  },
  flash: {
    name: "フラッシュ暗算",
    caption: "数字を見て、頭の中でそろばんを。",
    icon: "bolt",
  },
};

export const ZONES = [
  {
    id: "forest",
    title: "はじまりの密林",
    subtitle: "1けたの たし算・ひき算",
    image: "jungle",
    difficulty: 1,
    color: "#bcf36a",
    reward: "bio-hercules-beetle",
    creature: "ヘラクレスオオカブト",
  },
  {
    id: "ocean",
    title: "蒼海の神殿",
    subtitle: "2けたの たし算・ひき算",
    image: "ocean",
    difficulty: 2,
    color: "#74d7f0",
    reward: "bio-triceratops",
    creature: "トリケラトプス",
  },
  {
    id: "volcano",
    title: "不死鳥の火山",
    subtitle: "3けたの たし算・ひき算",
    image: "volcano",
    difficulty: 3,
    color: "#ffb669",
    reward: "bio-tyrannosaurus-rex",
    creature: "ティラノサウルス",
  },
];

export const asset = (name) =>
  `${import.meta.env.BASE_URL}assets/adventure/${name}.webp`;
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function emptyLearning() {
  return {
    xp: 0,
    answered: 0,
    correct: 0,
    sessions: [],
    mistakes: [],
    daily: {},
    quests: {},
    questFirstClears: {},
    streak: 0,
    lastDate: null,
    skills: {},
  };
}
export function normalizeLearning(value) {
  const base = emptyLearning();
  if (!value || typeof value !== "object" || Array.isArray(value)) return base;
  const merged = { ...base, ...value };
  for (const key of ["xp", "answered", "correct", "streak"])
    if (!Number.isFinite(merged[key]) || merged[key] < 0) merged[key] = 0;
  for (const key of ["sessions", "mistakes"])
    if (!Array.isArray(merged[key])) merged[key] = [];
  for (const key of ["daily", "quests", "skills"])
    if (
      !merged[key] ||
      typeof merged[key] !== "object" ||
      Array.isArray(merged[key])
    )
      merged[key] = {};
  const dates = merged.questFirstClears;
  merged.questFirstClears = Object.fromEntries(
    Object.entries(merged.quests)
      .filter(([, score]) => score >= 4)
      .map(([id]) => [id, typeof dates?.[id] === "string" ? dates[id] : null]),
  );
  return merged;
}
export function todayProgress(learning, date = new Date()) {
  return (
    learning.daily[dateKey(date)] || {
      answered: 0,
      correct: 0,
      modes: [],
      claimed: [],
    }
  );
}
export const MISSIONS = [
  {
    id: "start",
    name: "5問にチャレンジ",
    detail: "練習かクエストを最後まで",
    reward: 50,
    target: 5,
    progress: (day) => day.answered,
  },
  {
    id: "accurate",
    name: "せいかいを10こ",
    detail: "自分のペースで、じっくり",
    reward: 100,
    target: 10,
    progress: (day) => day.correct,
  },
  {
    id: "explore",
    name: "2つの練習を体験",
    detail: "ちがう力もきたえよう",
    reward: 75,
    target: 2,
    progress: (day) => day.modes.length,
  },
];
const int = (min, max, rng) => Math.floor(rng() * (max - min + 1)) + min;
export function generateLearningProblem(
  mode,
  difficulty = 1,
  index = 0,
  rng = Math.random,
) {
  if (mode === "bonds") {
    const target = difficulty === 1 ? 5 : 10;
    const a = int(1, target - 1, rng);
    return {
      id: `bonds-${target}-${a}`,
      mode,
      prompt: `${a} ＋ □ ＝ ${target}`,
      answer: target - a,
      a,
      b: target - a,
      operator: "+",
      hint: `${target}を ${a}と、もうひとつの数に分けよう。`,
      explanation: `${target} − ${a} ＝ ${target - a}。${a}と${target - a}で${target}のなかまだよ。`,
    };
  }
  const digits = Math.max(1, Math.min(3, difficulty));
  const min = digits === 1 ? 1 : 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  let a = int(min, max, rng),
    b = int(min, max, rng);
  const subtract = index % 2 === 1;
  if (subtract && a < b) [a, b] = [b, a];
  const answer = subtract ? a - b : a + b;
  const operator = subtract ? "−" : "＋";
  let hint, explanation;
  if (digits === 1 && !subtract && a < 5 && b < 5 && a + b >= 5 && a + b < 10) {
    hint = `5のなかまを使おう。${b}は 5 − ${5 - b} と同じ。`;
    explanation = `${a} ＋ ${b} は、5をたして ${5 - b}をひくと ${answer}。`;
  } else if (digits === 1 && !subtract && answer >= 10) {
    hint = `${a}は、あと${10 - a}で10。${b}を${10 - a}と${b - (10 - a)}に分けよう。`;
    explanation = `${a} ＋ ${10 - a} ＝ 10。のこりの${b - (10 - a)}をたして ${answer}。そろばんでは10をたして${10 - b}をひいても同じだよ。`;
  } else if (digits === 1 && subtract && a >= 5 && b < 5 && a % 5 < b) {
    hint = `${b}をひくときは、5をひいて ${5 - b}をたしても同じだよ。`;
    explanation = `${a} − 5 ＝ ${a - 5}。${5 - b}をたして ${answer}。5のなかまを使ったひき算だよ。`;
  } else if (digits === 1) {
    hint = subtract
      ? `${a}から${b}をひこう。上の珠は5、下の珠は1だよ。`
      : "上の珠は5、下の珠は1。横の線に寄せた珠を数えよう。";
    explanation = `${a} ${operator} ${b} ＝ ${answer}。${answer >= 5 && answer < 10 ? `5と${answer - 5}で${answer}を作れるよ。` : "珠でもたしかめてみよう。"}`;
  } else {
    const parts = [100, 10, 1]
      .filter((p) => Math.floor(b / p) % 10)
      .map((p) => (Math.floor(b / p) % 10) * p);
    hint = `${b}を ${parts.join(" と ")} に分けて、大きい位から${subtract ? "ひこう" : "たそう"}。`;
    let running = a;
    explanation = parts
      .map((p) => {
        const before = running;
        running += subtract ? -p : p;
        return `${before} ${operator} ${p} ＝ ${running}`;
      })
      .join(" → ");
  }
  return {
    id: `${mode}-${a}-${operator}-${b}`,
    mode,
    prompt: `${a} ${operator} ${b}`,
    a,
    b,
    operator,
    answer,
    hint,
    explanation,
  };
}

export function sessionReward(rows) {
  return rows.filter((r) => r.correct).length * 20;
}
export function recordLearningSession(state, session, date = new Date()) {
  const learning = normalizeLearning(state.learning);
  if (
    !session.id ||
    learning.sessions.some((s) => s.id === session.id) ||
    !Array.isArray(session.rows) ||
    !session.rows.length
  )
    return state;
  const rows = session.rows.slice(0, 10);
  const correct = rows.filter((r) => r.correct).length;
  const key = dateKey(date);
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const day = todayProgress(learning, date);
  const modes = [...new Set([...day.modes, session.mode])];
  const skills = { ...learning.skills };
  const prev = skills[session.mode] || { correct: 0, answered: 0 };
  skills[session.mode] = {
    correct: prev.correct + correct,
    answered: prev.answered + rows.length,
  };
  const mistakes = new Map(learning.mistakes.map((p) => [p.id, p]));
  rows.forEach((row) => {
    if (row.correct) mistakes.delete(row.problem.id);
    else mistakes.set(row.problem.id, row.problem);
  });
  const zone = ZONES.find((z) => z.id === session.zoneId);
  const zoneIndex = ZONES.indexOf(zone);
  const unlocked =
    zoneIndex === 0 ||
    (zoneIndex > 0 && learning.quests[ZONES[zoneIndex - 1].id] >= 4);
  const clear = !!zone && unlocked && rows.length === 5 && correct >= 4;
  const firstClear = clear && !(learning.quests[zone.id] >= 4);
  const quests = { ...learning.quests };
  if (zone && unlocked)
    quests[zone.id] = Math.max(quests[zone.id] || 0, correct);
  return {
    ...state,
    coins:
      state.coins +
      (session.legacyReward && session.mode === "flash"
        ? 0
        : sessionReward(rows)) +
      (firstClear ? 100 : 0),
    collection: firstClear
      ? {
          ...state.collection,
          [zone.reward]: (state.collection[zone.reward] || 0) + 1,
        }
      : state.collection,
    learning: {
      ...learning,
      xp: learning.xp + correct * 20 + rows.length * 5,
      answered: learning.answered + rows.length,
      correct: learning.correct + correct,
      lastDate: key,
      streak:
        learning.lastDate === key
          ? learning.streak
          : learning.lastDate === dateKey(yesterday)
            ? learning.streak + 1
            : 1,
      skills,
      quests,
      questFirstClears: firstClear
        ? { ...learning.questFirstClears, [zone.id]: key }
        : learning.questFirstClears,
      mistakes: [...mistakes.values()].slice(-50),
      daily: {
        ...learning.daily,
        [key]: {
          ...day,
          answered: day.answered + rows.length,
          correct: day.correct + correct,
          modes,
        },
      },
      sessions: [
        ...learning.sessions,
        {
          id: session.id,
          date: key,
          mode: session.mode,
          level: session.level ?? null,
          difficulty: session.difficulty ?? null,
          zoneId: session.zoneId ?? null,
          correct,
          total: rows.length,
          seconds: session.seconds || 0,
        },
      ].slice(-200),
    },
  };
}
export function claimLearningMission(state, id, date = new Date()) {
  const learning = normalizeLearning(state.learning),
    day = todayProgress(learning, date);
  const mission = MISSIONS.find((m) => m.id === id);
  if (
    !mission ||
    day.claimed.includes(id) ||
    mission.progress(day) < mission.target
  )
    return state;
  return {
    ...state,
    coins: state.coins + mission.reward,
    learning: {
      ...learning,
      daily: {
        ...learning.daily,
        [dateKey(date)]: { ...day, claimed: [...day.claimed, id] },
      },
    },
  };
}
