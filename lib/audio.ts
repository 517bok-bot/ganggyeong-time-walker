// 강경 타임워커 사운드 엔진
// ─────────────────────────────────────────────────────────────
// 음원 파일 없이 WebAudio로 BGM과 효과음을 실시간 합성합니다. (저작권 걱정 없는 자체 작곡)
// - BGM: 화면별 5곡. 박자 단위로 음표를 미리 예약하는 간단한 시퀀서로 반복 재생
// - 효과음: 20여 종
// 브라우저 정책상 첫 터치/클릭 이후에만 소리가 납니다.

type Inst = "musicbox" | "pluck" | "marimba" | "accordion" | "pad" | "bass" | "flute" | "gayageum" | "daegeum";

let ctx: AudioContext | null = null;
let master: GainNode, bgmBus: GainNode, sfxBus: GainNode, verb: ConvolverNode, verbBus: GainNode;
let noiseBuf: AudioBuffer;

export interface AudioSettings { bgm: number; sfx: number; muted: boolean }
const KEY = "gtw-audio-v1";
export function loadSettings(): AudioSettings {
  try { return { bgm: 0.5, sfx: 0.8, muted: false, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") }; } catch { return { bgm: 0.5, sfx: 0.8, muted: false }; }
}
let settings: AudioSettings = { bgm: 0.5, sfx: 0.8, muted: false };

function init(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch { return null; }
  settings = loadSettings();
  master = ctx.createGain(); master.gain.value = settings.muted ? 0 : 1; master.connect(ctx.destination);
  bgmBus = ctx.createGain(); bgmBus.gain.value = settings.bgm * 0.55; bgmBus.connect(master);
  sfxBus = ctx.createGain(); sfxBus.gain.value = settings.sfx; sfxBus.connect(master);
  // 작은 방 울림 (합성 임펄스)
  verb = ctx.createConvolver();
  const len = ctx.sampleRate * 1.6, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  verb.buffer = ir;
  verbBus = ctx.createGain(); verbBus.gain.value = 0.22; verbBus.connect(verb); verb.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  return ctx;
}

export function unlockAudio() { const a = init(); if (a && a.state === "suspended") a.resume(); }

export function applySettings(s: AudioSettings) {
  settings = s;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  if (!ctx) return;
  const t = ctx.currentTime;
  master.gain.setTargetAtTime(s.muted ? 0 : 1, t, 0.05);
  bgmBus.gain.setTargetAtTime(s.bgm * 0.55, t, 0.1);
  sfxBus.gain.setTargetAtTime(s.sfx, t, 0.05);
}

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** 악기 하나로 음 하나 연주 */
function voice(inst: Inst, midi: number, when: number, dur: number, vel: number, out: AudioNode) {
  if (!ctx) return;
  const f = mtof(midi);
  const g = ctx.createGain(); g.connect(out);
  const send = ctx.createGain(); send.gain.value = inst === "bass" ? 0 : 0.6; g.connect(send); send.connect(verbBus);
  const osc = (type: OscillatorType, freq: number, detune = 0) => { const o = ctx!.createOscillator(); o.type = type; o.frequency.value = freq; o.detune.value = detune; return o; };
  const env = (a: number, peak: number, d: number) => {
    g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(peak * vel, when + a);
    g.gain.exponentialRampToValueAtTime(0.0001, when + d);
  };
  let oscs: OscillatorNode[] = [];
  switch (inst) {
    case "musicbox": { oscs = [osc("sine", f), osc("sine", f * 4.01), osc("triangle", f * 2)]; const p = ctx.createGain(); p.gain.value = 0.18; oscs[1].disconnect(); oscs[1].connect(p); p.connect(g); oscs[0].connect(g); oscs[2].connect(g); env(0.004, 0.22, dur + 1.1); oscs.forEach((o) => { o.start(when); o.stop(when + dur + 1.2); }); return; }
    case "pluck": oscs = [osc("triangle", f), osc("sine", f * 2, 4)]; env(0.004, 0.2, dur + 0.45); break;
    case "marimba": oscs = [osc("sine", f), osc("sine", f * 3.98)]; env(0.002, 0.28, Math.min(0.6, dur + 0.35)); break;
    case "accordion": { const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800; lp.connect(g); oscs = [osc("square", f, -6), osc("sawtooth", f, 6)]; oscs.forEach((o) => o.connect(lp)); g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(0.055 * vel, when + 0.05); g.gain.setValueAtTime(0.055 * vel, when + dur * 0.9); g.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.12); oscs.forEach((o) => { o.start(when); o.stop(when + dur + 0.15); }); return; }
    case "pad": { const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900; lp.connect(g); oscs = [osc("triangle", f, -8), osc("triangle", f, 8), osc("sine", f / 2)]; oscs.forEach((o) => o.connect(lp)); g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(0.06 * vel, when + 0.4); g.gain.setValueAtTime(0.06 * vel, when + dur - 0.1); g.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.6); oscs.forEach((o) => { o.start(when); o.stop(when + dur + 0.7); }); return; }
    case "bass": oscs = [osc("sine", f), osc("triangle", f)]; env(0.01, 0.3, dur + 0.15); break;
    // 가야금풍: 뜯는 소리 + 농현(눌러 올리는 떨림)
    case "gayageum": {
      oscs = [osc("triangle", f), osc("sine", f * 2, 3), osc("sine", f * 3, -4)];
      oscs.forEach((o) => { o.frequency.setValueAtTime(o.frequency.value, when); o.frequency.linearRampToValueAtTime(o.frequency.value * 1.014, when + 0.22); o.frequency.linearRampToValueAtTime(o.frequency.value, when + 0.45); });
      const hp = ctx.createGain(); hp.gain.value = 0.35; oscs[2].connect(hp); hp.connect(g); oscs[0].connect(g); oscs[1].connect(g);
      env(0.003, 0.24, Math.max(0.8, dur + 0.9)); oscs.forEach((o) => { o.start(when); o.stop(when + dur + 1.2); }); return;
    }
    // 대금풍: 숨소리 + 아래에서 밀어 올리는 음 + 깊어지는 떨림
    case "daegeum": {
      oscs = [osc("sine", f), osc("sine", f * 2), osc("triangle", f * 3)];
      oscs.forEach((o) => { const base = o.frequency.value; o.frequency.setValueAtTime(base * 0.965, when); o.frequency.exponentialRampToValueAtTime(base, when + 0.12); });
      const vib = osc("sine", 4.6), vg = ctx.createGain();
      vg.gain.setValueAtTime(0, when); vg.gain.linearRampToValueAtTime(f * 0.012, when + Math.min(0.9, dur));
      vib.connect(vg); oscs.forEach((o) => vg.connect(o.frequency)); vib.start(when); vib.stop(when + dur + 0.3);
      const breath = ctx.createBufferSource(); breath.buffer = noiseBuf; const bf = ctx.createBiquadFilter(); bf.type = "bandpass"; bf.frequency.value = f * 2; bf.Q.value = 3;
      const bg = ctx.createGain(); bg.gain.setValueAtTime(0.02 * vel, when); bg.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.1);
      breath.connect(bf); bf.connect(bg); bg.connect(g); breath.start(when, Math.random() * 0.5); breath.stop(when + dur + 0.2);
      const m = [1, 0.35, 0.12];
      oscs.forEach((o, i) => { const og = ctx!.createGain(); og.gain.value = m[i]; o.connect(og); og.connect(g); o.start(when); o.stop(when + dur + 0.3); });
      g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(0.11 * vel, when + 0.1); g.gain.setValueAtTime(0.1 * vel, when + dur * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.25);
      return;
    }
    case "flute": { oscs = [osc("sine", f), osc("sine", f * 2)]; const vib = osc("sine", 5.2); const vg = ctx.createGain(); vg.gain.value = 4; vib.connect(vg); vg.connect(oscs[0].frequency); vib.start(when); vib.stop(when + dur + 0.2);
      g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(0.13 * vel, when + 0.06); g.gain.setValueAtTime(0.11 * vel, when + dur * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.15); break; }
  }
  oscs.forEach((o) => { o.connect(g); o.start(when); o.stop(when + dur + 1.3); });
}

type Perc = "shaker" | "wood" | "kick" | "tick" | "kung" | "deok";
function perc(kind: Perc, when: number, vel: number, out: AudioNode) {
  if (!ctx) return;
  const g = ctx.createGain(); g.connect(out);
  if (kind === "kung" || kind === "deok") {
    // 장구: 궁편(낮고 둥근 소리) / 채편(덕, 높고 마른 소리)
    const o = ctx.createOscillator(); o.type = "sine";
    const [f0, f1, d, a] = kind === "kung" ? [110, 58, 0.35, 0.42] : [420, 300, 0.07, 0.16];
    o.frequency.setValueAtTime(f0, when); o.frequency.exponentialRampToValueAtTime(f1, when + d);
    g.gain.setValueAtTime(a * vel, when); g.gain.exponentialRampToValueAtTime(0.0001, when + d);
    o.connect(g); o.start(when); o.stop(when + d + 0.02);
    const nz = ctx.createBufferSource(); nz.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = kind === "kung" ? 260 : 3200; f.Q.value = 1.2;
    const ng = ctx.createGain(); ng.gain.setValueAtTime((kind === "kung" ? 0.08 : 0.12) * vel, when); ng.gain.exponentialRampToValueAtTime(0.0001, when + (kind === "kung" ? 0.12 : 0.05));
    nz.connect(f); f.connect(ng); ng.connect(out); nz.start(when, Math.random() * 0.5); nz.stop(when + 0.15);
    return;
  }
  if (kind === "shaker" || kind === "tick") {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = kind === "tick" ? 7000 : 5000;
    s.connect(hp); hp.connect(g);
    g.gain.setValueAtTime(0.06 * vel, when); g.gain.exponentialRampToValueAtTime(0.0001, when + (kind === "tick" ? 0.03 : 0.07));
    s.start(when, Math.random() * 0.5); s.stop(when + 0.1);
  } else {
    const o = ctx.createOscillator(); o.type = "sine";
    const [f0, f1, d, a] = kind === "wood" ? [900, 600, 0.08, 0.2] : [140, 45, 0.25, 0.4];
    o.frequency.setValueAtTime(f0, when); o.frequency.exponentialRampToValueAtTime(f1, when + d);
    g.gain.setValueAtTime(a * vel, when); g.gain.exponentialRampToValueAtTime(0.0001, when + d);
    o.connect(g); o.start(when); o.stop(when + d + 0.02);
  }
}

// ── 작곡 데이터 ────────────────────────────────────────
// 음 표기: 음계 숫자(1~7, 위아래 옥타브는 '와 ,), 0 = 쉼표, 뒤 숫자 = 길이(박)
// 예: "5:1 6:0.5 1':1.5" → 솔 1박, 라 반박, 높은 도 1.5박
type Part = { inst: Inst; oct: number; notes: string; vel?: number };
interface Song { bpm: number; key: number; beatsPerBar: number; bars: number; chords: number[][]; parts: Part[]; drums?: { pattern: string; kind: Perc }[] }

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
function parseNotes(s: string) {
  return s.trim().split(/\s+/).map((tok) => {
    const [n, d] = tok.split(":");
    const dur = Number(d ?? 1);
    if (n === "0") return { semi: null as number | null, dur };
    const deg = Number(n[0]), up = (n.match(/'/g) ?? []).length, down = (n.match(/,/g) ?? []).length;
    const acc = n.includes("#") ? 1 : n.includes("b") ? -1 : 0;
    return { semi: MAJOR[deg - 1] + 12 * (up - down) + acc, dur };
  });
}

// 모든 곡은 5음 음계(궁·상·각·치·우 = 1 2 3 5 6)로 지은 자체 창작곡입니다.
const SONGS: Record<string, Song> = {
  // 메인 「달빛 강경」: 세마치풍 3박, 가야금 + 대금 + 장구
  title: {
    bpm: 66, key: 62, beatsPerBar: 3, bars: 8, chords: [],
    parts: [
      { inst: "gayageum", oct: 1, notes: "5:1 6:1 1':1 6:2 5:1 3:1.5 2:0.5 3:1 5:3 6:1 5:1 3:1 2:2 1:1 2:1 3:1 2:1 1:3" },
      { inst: "daegeum", oct: 1, notes: "0:6 5:3 6:3 0:6 3:3 2:3", vel: 0.8 },
      { inst: "pad", oct: -1, notes: "1:6 6,:6 1:6 5,:6", vel: 0.7 },
    ],
    drums: [{ kind: "kung", pattern: "x....." }, { kind: "deok", pattern: "...x.x" }],
  },
  // 탐험 「길 위의 타임워커」: 걷는 4박, 가야금 선율 + 대금 응답
  explore: {
    bpm: 100, key: 60, beatsPerBar: 4, bars: 4, chords: [],
    parts: [
      { inst: "gayageum", oct: 1, notes: "1:0.5 2:0.5 3:1 5:1 6:0.5 5:0.5 3:1 2:1 3:0.5 5:0.5 6:2 5:1 3:0.5 2:0.5 1:1 2:1 3:1 1:2" },
      { inst: "daegeum", oct: 1, notes: "0:8 6:2 5:2 3:2 5:2", vel: 0.75 },
      { inst: "bass", oct: -1, notes: "1:2 5,:2 6,:2 3,:2 1:2 5,:2 6,:2 5,:2" },
    ],
    drums: [{ kind: "kung", pattern: "x...x..." }, { kind: "deok", pattern: "..x...x." }, { kind: "shaker", pattern: "xxxxxxxx" }],
  },
  // 온라인 마을 「장터 풍경」: 흥겨운 장단
  village: {
    bpm: 112, key: 65, beatsPerBar: 4, bars: 4, chords: [],
    parts: [
      { inst: "gayageum", oct: 1, notes: "5:0.5 6:0.5 5:0.5 3:0.5 2:0.5 3:0.5 5:1 6:0.5 1':0.5 6:0.5 5:0.5 3:1 2:1 3:0.5 5:0.5 3:0.5 2:0.5 1:1 2:1 3:0.5 2:0.5 1:1 2:1 1:1" },
      { inst: "daegeum", oct: 2, notes: "0:4 5:2 6:2 0:4 3:2 2:2", vel: 0.6 },
      { inst: "bass", oct: -1, notes: "1:1 5,:1 1:1 5,:1 6,:1 3,:1 6,:1 3,:1 5,:1 2:1 5,:1 2:1 1:1 5,:1 1:2" },
    ],
    drums: [{ kind: "kung", pattern: "x..x..x." }, { kind: "deok", pattern: "..x...x." }, { kind: "tick", pattern: "xxxxxxxx" }],
  },
  // 젓갈 공방 「옹기 장단」: 통통 두드리는 소리
  workshop: {
    bpm: 92, key: 67, beatsPerBar: 4, bars: 4, chords: [],
    parts: [
      { inst: "gayageum", oct: 0, notes: "1:1 3:0.5 2:0.5 1:1 5,:1 6,:1 1:1 2:2 3:1 5:0.5 3:0.5 2:1 1:1 2:1 3:1 1:2" },
      { inst: "marimba", oct: 0, notes: "1:2 5,:2 6,:2 5,:2 1:2 5,:2 2:2 1:2", vel: 0.5 },
    ],
    drums: [{ kind: "wood", pattern: "x..x..x." }, { kind: "kung", pattern: "x...x..." }],
  },
  // 도감·앨범·우체국 「고서의 밤」: 대금 독주 + 은은한 바탕음
  calm: {
    bpm: 60, key: 64, beatsPerBar: 4, bars: 4, chords: [],
    parts: [
      { inst: "daegeum", oct: 1, notes: "3:2 5:1 6:1 5:2 3:2 2:3 1:1 2:2 3:2" },
      { inst: "gayageum", oct: 1, notes: "0:2 1':1 0:3 6:1 0:3 5:1 0:5", vel: 0.6 },
      { inst: "pad", oct: -1, notes: "1:8 5,:8", vel: 0.6 },
    ],
  },
};

const ROUTE_TRACK: [RegExp, string][] = [
  [/^\/$/, "title"], [/^\/explore/, "explore"], [/^\/village/, "village"], [/^\/jeotgal/, "workshop"],
  [/^\/(dex|quests|me|album|postcard|login|wardrobe|post)/, "calm"], [/^\/picnic/, "village"],
];
export const trackForPath = (p: string) => ROUTE_TRACK.find(([r]) => r.test(p))?.[1] ?? null;

// ── 시퀀서 ─────────────────────────────────────────────
let current: { name: string; gain: GainNode; timer: number; } | null = null;

function startSong(name: string) {
  const a = init(); if (!a) return;
  const song = SONGS[name]; if (!song) return;
  const out = a.createGain(); out.gain.value = 0.0001; out.connect(bgmBus);
  out.gain.exponentialRampToValueAtTime(1, a.currentTime + 1.2);
  const spb = 60 / song.bpm, loopBeats = song.beatsPerBar * song.bars, loopDur = loopBeats * spb;
  const parts = song.parts.map((p) => ({ ...p, seq: parseNotes(p.notes) }));
  let loopStart = a.currentTime + 0.15, scheduledUntil = loopStart;
  const schedule = () => {
    if (!ctx) return;
    while (scheduledUntil < ctx.currentTime + 0.6) {
      const t0 = scheduledUntil;
      for (const p of parts) {
        let beat = 0;
        for (const n of p.seq) {
          if (beat >= loopBeats) break;
          if (n.semi !== null) voice(p.inst, song.key + 12 * p.oct + n.semi, t0 + beat * spb, n.dur * spb * 0.95, (p.vel ?? 1) * (0.85 + Math.random() * 0.15), out);
          beat += n.dur;
        }
      }
      for (const d of song.drums ?? []) {
        const steps = d.pattern.length, stepDur = (song.beatsPerBar * spb) / steps;
        for (let bar = 0; bar < song.bars; bar++) for (let i = 0; i < steps; i++)
          if (d.pattern[i] === "x") perc(d.kind, t0 + bar * song.beatsPerBar * spb + i * stepDur, 0.8 + Math.random() * 0.2, out);
      }
      scheduledUntil = t0 + loopDur;
      loopStart = scheduledUntil;
    }
  };
  schedule();
  const timer = window.setInterval(schedule, 200);
  current = { name, gain: out, timer };
}

export function playBgm(name: string | null) {
  const a = init(); if (!a) return;
  if (current?.name === name) return;
  if (current) {
    const old = current; current = null;
    window.clearInterval(old.timer);
    old.gain.gain.cancelScheduledValues(a.currentTime);
    old.gain.gain.setTargetAtTime(0.0001, a.currentTime, 0.35);
    setTimeout(() => old.gain.disconnect(), 2500);
  }
  if (name) startSong(name);
}

// ── 효과음 ─────────────────────────────────────────────
function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.12, delay = 0, slideTo?: number) {
  const a = init(); if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur: number, freq: number, gain = 0.15, delay = 0, type: BiquadFilterType = "bandpass", q = 1) {
  const a = init(); if (!a) return;
  const t = a.currentTime + delay;
  const s = a.createBufferSource(); s.buffer = noiseBuf;
  const f = a.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = a.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}
const arp = (notes: number[], step: number, type: OscillatorType = "triangle", gain = 0.1, len = 0.3) =>
  notes.forEach((m, i) => tone(mtof(m), len, type, gain, i * step));

let lastTap = 0;
export const sfx = {
  tap: () => { const n = Date.now(); if (n - lastTap < 80) return; lastTap = n; tone(880, 0.06, "triangle", 0.07); },
  hover: () => tone(1320, 0.03, "sine", 0.03),
  back: () => tone(520, 0.08, "triangle", 0.07, 0, 380),
  plop: () => { tone(260, 0.14, "sine", 0.22, 0, 120); noise(0.12, 700, 0.06, 0.03); },
  splash: () => { noise(0.35, 1200, 0.18, 0, "bandpass", 0.7); tone(400, 0.18, "sine", 0.1, 0.02, 160); },
  bubble: () => { tone(500 + Math.random() * 300, 0.09, "sine", 0.08, 0, 1100); },
  coin: () => { tone(1568, 0.08, "square", 0.05); tone(2093, 0.25, "square", 0.05, 0.07); },
  collect: () => arp([72, 76, 79, 84, 88], 0.07, "triangle", 0.1, 0.35),
  success: () => arp([67, 72, 76], 0.1, "sine", 0.13, 0.4),
  quest: () => { arp([60, 64, 67, 72], 0.09, "square", 0.05, 0.25); arp([72, 76, 79, 84], 0.09, "triangle", 0.1, 0.5); },
  levelUp: () => { arp([60, 64, 67, 72, 76, 79, 84], 0.06, "triangle", 0.1, 0.3); tone(mtof(84), 0.9, "sine", 0.1, 0.45); noise(0.6, 9000, 0.04, 0.45, "highpass"); },
  error: () => { tone(220, 0.12, "square", 0.05); tone(185, 0.18, "square", 0.05, 0.1); },
  meow: () => { const a = init(); if (!a) return; const t = a.currentTime; const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = 1400; f.Q.value = 2; o.type = "sawtooth";
    o.frequency.setValueAtTime(620, t); o.frequency.linearRampToValueAtTime(980, t + 0.13); o.frequency.linearRampToValueAtTime(540, t + 0.42);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.12, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.5); },
  boing: () => tone(300, 0.3, "sine", 0.14, 0, 700),
  step: () => { noise(0.05, 400 + Math.random() * 200, 0.07, 0, "lowpass"); },
  stamp: () => { tone(110, 0.18, "sine", 0.3, 0, 50); noise(0.1, 2500, 0.12); },
  shutter: () => { noise(0.04, 3000, 0.2); noise(0.06, 2000, 0.15, 0.07); tone(1800, 0.03, "square", 0.03, 0.12); },
  page: () => { noise(0.22, 3500, 0.07, 0, "bandpass", 0.5); },
  open: () => arp([79, 84], 0.08, "sine", 0.1, 0.5),
  unlock: () => { tone(1200, 0.05, "square", 0.05); arp([76, 83, 88], 0.06, "triangle", 0.09, 0.3); },
  equip: () => { noise(0.25, 8000, 0.05, 0, "highpass"); arp([84, 91], 0.05, "sine", 0.08, 0.25); },
  talk: () => tone(600 + Math.random() * 400, 0.04, "triangle", 0.04),
  qr: () => { tone(1500, 0.07, "square", 0.05); tone(2000, 0.12, "square", 0.05, 0.08); },
  fanfare: () => { [[67, 0], [72, 0.15], [76, 0.3], [79, 0.45], [84, 0.65]].forEach(([m, d]) => tone(mtof(m), 0.35, "square", 0.05, d)); tone(mtof(84), 1.1, "triangle", 0.1, 0.65); },
};
export type SfxName = keyof typeof sfx;
