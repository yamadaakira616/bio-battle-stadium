let ctx = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}
function tone(freq, type, vol, start, dur) {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.value = freq; o.type = type;
    const t = c.currentTime + start;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur);
  } catch {}
}

// ===== ゲーム音 =====
export function playFlash() { tone(660, 'sine', 0.05, 0, 0.08); }
export function playCorrect() {
  [[523,'sine',0.3,0,0.25],[659,'sine',0.3,0.15,0.25],[784,'sine',0.3,0.3,0.35]]
    .forEach(([f,t,v,s,d]) => tone(f,t,v,s,d));
}
export function playWrong() { tone(180, 'sawtooth', 0.2, 0, 0.4); }
export function playLevelUp() {
  [[523,'sine',0.3,0,0.2],[659,'sine',0.3,0.15,0.2],[784,'sine',0.3,0.3,0.2],[1047,'sine',0.4,0.45,0.5]]
    .forEach(([f,t,v,s,d]) => tone(f,t,v,s,d));
}
export function playPerfect() {
  // 全問正解ファンファーレ（豪華版）
  [[523,'sine',0.35,0,0.15],[659,'sine',0.35,0.1,0.15],[784,'sine',0.35,0.2,0.15],
   [1047,'sine',0.4,0.3,0.2],[1319,'sine',0.4,0.45,0.2],[1568,'sine',0.5,0.6,0.5],
   [2093,'triangle',0.3,0.75,0.8]]
    .forEach(([f,t,v,s,d]) => tone(f,t,v,s,d));
}
export function playCombo() { tone(880, 'sine', 0.15, 0, 0.15); }
export function playCountdown() { tone(440, 'sine', 0.1, 0, 0.1); }
export function playGo() { tone(880, 'triangle', 0.3, 0, 0.2); }
export function playCoinGet() {
  // コイン獲得（ビッグボーナス時）
  [[1047,'sine',0.3,0,0.1],[1319,'sine',0.3,0.08,0.1],[1568,'sine',0.3,0.16,0.1],[2093,'sine',0.4,0.24,0.3]]
    .forEach(([f,t,v,s,d]) => tone(f,t,v,s,d));
}

// ===== ガチャ音 =====
export function playGachaTick() {
  tone(400 + Math.random() * 300, 'square', 0.04, 0, 0.05);
}
export function playGachaSlowTick() {
  tone(350 + Math.random() * 150, 'triangle', 0.07, 0, 0.12);
}
export function playGachaReveal(rarity) {
  const fanfares = {
    common: [[440,'sine',0.2,0,0.2],[550,'sine',0.2,0.15,0.3]],
    rare: [[523,'sine',0.3,0,0.15],[659,'sine',0.3,0.12,0.15],[880,'sine',0.3,0.25,0.4]],
    superRare: [
      [659,'sine',0.35,0,0.15],[784,'sine',0.35,0.12,0.15],[988,'sine',0.35,0.24,0.15],
      [1175,'sine',0.4,0.36,0.5],[1568,'triangle',0.3,0.5,0.4],
    ],
    ultra: [
      [523,'sine',0.3,0,0.1],[659,'sine',0.3,0.08,0.1],[784,'sine',0.3,0.16,0.1],
      [1047,'sine',0.4,0.24,0.15],[1319,'sine',0.4,0.35,0.15],[1568,'sine',0.5,0.46,0.2],
      [2093,'triangle',0.4,0.6,0.6],[1047,'sawtooth',0.15,0.7,0.5],
    ],
    legend: [
      [261,'sawtooth',0.2,0,0.3],[523,'sine',0.4,0.1,0.2],[659,'sine',0.4,0.2,0.2],
      [784,'sine',0.4,0.3,0.2],[1047,'sine',0.5,0.4,0.2],[1319,'sine',0.5,0.5,0.25],
      [1568,'sine',0.5,0.6,0.25],[2093,'sine',0.6,0.72,0.3],[2637,'triangle',0.5,0.88,0.6],
      [1047,'triangle',0.2,0.9,0.8],[523,'sawtooth',0.1,1.0,0.6],
    ],
  };
  (fanfares[rarity] ?? fanfares.common).forEach(([f,t,v,s,d]) => tone(f,t,v,s,d));
}
export function playGachaFlash() {
  tone(1200, 'sine', 0.25, 0, 0.06);
  tone(1600, 'sine', 0.2, 0.04, 0.06);
}

// ===== バトル音 =====
export function playBattleAttack() {
  // 剣の振り音（ノイズ風）
  tone(200, 'sawtooth', 0.15, 0, 0.08);
  tone(300, 'sawtooth', 0.1, 0.03, 0.1);
}
export function playBattleHit() {
  // 打撃音
  tone(100, 'square', 0.3, 0, 0.05);
  tone(150, 'sawtooth', 0.2, 0.02, 0.1);
}
export function playBattleCritical() {
  // クリティカル（高音インパクト）
  tone(1200, 'sine', 0.3, 0, 0.05);
  tone(880, 'square', 0.25, 0.04, 0.1);
  tone(440, 'sawtooth', 0.2, 0.08, 0.15);
}
export function playBattleWin() {
  [[523,'sine',0.35,0,0.2],[659,'sine',0.35,0.15,0.2],[784,'sine',0.35,0.3,0.2],
   [1047,'sine',0.4,0.45,0.3],[1319,'sine',0.4,0.65,0.3],[1047,'triangle',0.3,0.85,0.5]]
    .forEach(([f,t,v,s,d]) => tone(f,t,v,s,d));
}
export function playBattleLose() {
  [[392,'sine',0.25,0,0.4],[330,'sine',0.25,0.3,0.4],[261,'sine',0.3,0.6,0.6]]
    .forEach(([f,t,v,s,d]) => tone(f,t,v,s,d));
}
export function playBattleStart() {
  tone(440, 'triangle', 0.2, 0, 0.1);
  tone(660, 'triangle', 0.25, 0.1, 0.15);
  tone(880, 'triangle', 0.3, 0.22, 0.25);
}
