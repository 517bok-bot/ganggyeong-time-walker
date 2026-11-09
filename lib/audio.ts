// 강경 타임워커 사운드 엔진
// ─────────────────────────────────────────────────────────────
// 음원 파일 없이 WebAudio로 BGM과 효과음을 실시간 합성합니다. (저작권 걱정 없는 자체 작곡)
// - BGM: 화면별 5곡. 박자 단위로 음표를 미리 예약하는 간단한 시퀀서로 반복 재생
// - 효과음: 20여 종
// 브라우저 정책상 첫 터치/클릭 이후에만 소리가 납니다.

type Inst = "gayageum" | "geomungo" | "yanggeum" | "daegeum" | "sogeum" | "chime";

let ctx: AudioContext | null = null;
let master: GainNode, bgmBus: GainNode, sfxBus: GainNode, verb: ConvolverNode, verbBus: GainNode;
let noiseBuf: AudioBuffer;
let sfxVerb: GainNode;

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
  // 한옥 대청마루 같은 부드러운 잔향: 앞 지연 + 고음이 먼저 사라지는 꼬리
  const len = Math.floor(ctx.sampleRate * 2.8), pre = Math.floor(ctx.sampleRate * 0.025), ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); let lp = 0; for (let i = pre; i < len; i++) { const k = (i - pre) / (len - pre); lp += (Math.random() * 2 - 1 - lp) * (0.6 - 0.5 * k); d[i] = lp * Math.pow(1 - k, 2.2); } }
  verb.buffer = ir;
  const vf = ctx.createBiquadFilter(); vf.type = "lowpass"; vf.frequency.value = 4200;
  verbBus = ctx.createGain(); verbBus.gain.value = 0.32; verbBus.connect(vf); vf.connect(verb); verb.connect(master);
  sfxBus.connect(sfxVerb = ctx.createGain()); sfxVerb.gain.value = 0.25; sfxVerb.connect(verbBus);
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

// ── 현 뜯는 소리: 카플러스-스트롱 물리 모델 (실제 줄의 진동을 흉내 내 전자음 느낌이 없습니다) ──
const ksCache = new Map<string, { buf: AudioBuffer; rate: number }>();
function ksString(freq: number, kind: "silk" | "low" | "bright") {
  const a = ctx!; const sr = a.sampleRate;
  const key = `${kind}:${Math.round(freq * 10)}`;
  const hit = ksCache.get(key); if (hit) return hit;
  const N = Math.max(2, Math.round(sr / freq));
  const secs = kind === "low" ? 3.2 : kind === "bright" ? 1.6 : 2.6;
  const len = Math.floor(sr * secs);
  const buf = a.createBuffer(1, len, sr), out = buf.getChannelData(0);
  const line = new Float32Array(N);
  // 처음 튕김: 손가락(비단줄)은 부드럽게, 술대(거문고)는 둔탁하게, 채(양금)는 맑게
  const soft = kind === "low" ? 0.35 : kind === "bright" ? 0.85 : 0.55;
  let prev = 0; for (let i = 0; i < N; i++) { prev += ((Math.random() * 2 - 1) - prev) * soft; line[i] = prev; }
  const damp = kind === "low" ? 0.9965 : kind === "bright" ? 0.993 : 0.9958;
  let peak = 0;
  for (let i = 0; i < len; i++) {
    const j = i % N, k = (i + 1) % N;
    const v = line[j]; out[i] = v; if (Math.abs(v) > peak) peak = Math.abs(v);
    line[j] = damp * 0.5 * (v + line[k]);
  }
  for (let i = 0; i < len; i++) out[i] /= peak || 1;
  const r = { buf, rate: freq / (sr / N) };
  ksCache.set(key, r); return r;
}

/** 악기 하나로 음 하나 연주 */
function voice(inst: Inst, midi: number, when: number, dur: number, vel: number, out: AudioNode) {
  if (!ctx) return;
  const f = mtof(midi);
  const g = ctx.createGain(); g.connect(out);
  const send = ctx.createGain(); send.gain.value = inst === "geomungo" ? 0.35 : 0.7; g.connect(send); send.connect(verbBus);
  if (inst === "gayageum" || inst === "geomungo" || inst === "yanggeum") {
    const kind = inst === "gayageum" ? "silk" : inst === "geomungo" ? "low" : "bright";
    const { buf, rate } = ksString(f, kind);
    const src = ctx.createBufferSource(); src.buffer = buf;
    src.playbackRate.setValueAtTime(rate, when);
    if (inst === "gayageum" && dur > 0.5) { // 농현: 줄을 눌러 음을 살짝 밀어 올렸다 내림
      src.playbackRate.setValueAtTime(rate, when + 0.18);
      src.playbackRate.linearRampToValueAtTime(rate * 1.018, when + 0.36);
      src.playbackRate.linearRampToValueAtTime(rate * 0.998, when + 0.6);
      src.playbackRate.linearRampToValueAtTime(rate * 1.012, when + 0.85);
      src.playbackRate.linearRampToValueAtTime(rate, when + 1.1);
    }
    const tone = ctx.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = inst === "geomungo" ? 1400 : inst === "yanggeum" ? 6000 : 3600;
    const body = ctx.createBiquadFilter(); body.type = "peaking"; body.frequency.value = inst === "geomungo" ? 180 : 320; body.gain.value = 4; body.Q.value = 1;
    src.connect(tone); tone.connect(body); body.connect(g);
    const amp = (inst === "geomungo" ? 0.42 : inst === "yanggeum" ? 0.16 : 0.26) * vel;
    const tail = Math.min(buf.duration / rate, dur + (inst === "yanggeum" ? 0.8 : 1.6));
    g.gain.setValueAtTime(amp, when); g.gain.setValueAtTime(amp, when + tail - 0.25); g.gain.linearRampToValueAtTime(0.0001, when + tail);
    src.start(when); src.stop(when + tail + 0.05);
    return;
  }
  if (inst === "chime") { // 풍경·경쇠: 어긋난 배음이 오래 울리는 쇳소리
    [[1, 1, 3.2], [2.76, 0.45, 1.8], [5.4, 0.22, 1.1], [8.93, 0.1, 0.6]].forEach(([m, a, d]) => {
      const o = ctx!.createOscillator(); o.type = "sine"; o.frequency.value = f * m;
      const og = ctx!.createGain(); og.gain.setValueAtTime(0.0001, when); og.gain.linearRampToValueAtTime(0.06 * a * vel, when + 0.004); og.gain.exponentialRampToValueAtTime(0.0001, when + d);
      o.connect(og); og.connect(g); o.start(when); o.stop(when + d + 0.05);
    });
    g.gain.value = 1;
    return;
  }
  // 대금·소금: 숨이 섞인 대나무 피리 (아래에서 밀어 올리는 시김새 + 점점 깊어지는 떨림)
  const high = inst === "sogeum";
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = high ? 4200 : 2600; lp.connect(g);
  const oscs = [1, 2, 3].map((h) => { const o = ctx!.createOscillator(); o.type = "sine"; o.frequency.value = f * h; return o; });
  oscs.forEach((o) => { const base = o.frequency.value; o.frequency.setValueAtTime(base * 0.955, when); o.frequency.exponentialRampToValueAtTime(base, when + 0.16); });
  const vib = ctx.createOscillator(); vib.frequency.value = 4.2 + Math.random() * 0.8; const vg = ctx.createGain();
  vg.gain.setValueAtTime(0, when); vg.gain.linearRampToValueAtTime(f * 0.016, when + Math.min(1.2, dur));
  vib.connect(vg); oscs.forEach((o, i) => { vg.connect(o.frequency); const og = ctx!.createGain(); og.gain.value = [1, 0.28, 0.08][i]; o.connect(og); og.connect(lp); o.start(when); o.stop(when + dur + 0.4); });
  vib.start(when); vib.stop(when + dur + 0.4);
  // 숨소리 (청울림 같은 거친 결)
  const breath = ctx.createBufferSource(); breath.buffer = noiseBuf; breath.loop = true;
  const bf = ctx.createBiquadFilter(); bf.type = "bandpass"; bf.frequency.value = f * 1.5; bf.Q.value = 1.4;
  const bg = ctx.createGain(); bg.gain.setValueAtTime(0.0001, when); bg.gain.linearRampToValueAtTime(0.05 * vel, when + 0.06); bg.gain.exponentialRampToValueAtTime(0.012 * vel, when + 0.4); bg.gain.setValueAtTime(0.012 * vel, when + dur); bg.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.3);
  breath.connect(bf); bf.connect(bg); bg.connect(lp); breath.start(when, Math.random() * 0.5); breath.stop(when + dur + 0.35);
  const pk = (high ? 0.06 : 0.1) * vel;
  g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(pk, when + 0.14); g.gain.linearRampToValueAtTime(pk * 0.8, when + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.35);
}

type Perc = "kung" | "deok" | "buk" | "moktak" | "bakk";
function perc(kind: Perc, when: number, vel: number, out: AudioNode) {
  if (!ctx) return;
  const g = ctx.createGain(); g.connect(out);
  const membrane = (f0: number, f1: number, d: number, a: number, partial = 1.59) => {
    [1, partial].forEach((m, i) => {
      const o = ctx!.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(f0 * m, when); o.frequency.exponentialRampToValueAtTime(f1 * m, when + d);
      const og = ctx!.createGain(); og.gain.setValueAtTime((i ? 0.35 : 1) * a * vel, when); og.gain.exponentialRampToValueAtTime(0.0001, when + d * (i ? 0.6 : 1));
      o.connect(og); og.connect(g); o.start(when); o.stop(when + d + 0.05);
    });
  };
  const hit = (freq: number, q: number, d: number, a: number, type: BiquadFilterType = "bandpass") => {
    const nz = ctx!.createBufferSource(); nz.buffer = noiseBuf; const f = ctx!.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const ng = ctx!.createGain(); ng.gain.setValueAtTime(a * vel, when); ng.gain.exponentialRampToValueAtTime(0.0001, when + d);
    nz.connect(f); f.connect(ng); ng.connect(g); nz.start(when, Math.random() * 0.5); nz.stop(when + d + 0.02);
  };
  const send = ctx.createGain(); send.gain.value = 0.3; g.connect(send); send.connect(verbBus);
  switch (kind) {
    case "kung": membrane(120, 70, 0.45, 0.45); hit(300, 1, 0.08, 0.05); break; // 장구 궁편: 둥
    case "deok": membrane(380, 330, 0.09, 0.08, 2.1); hit(2600, 1.5, 0.05, 0.14); break; // 장구 채편: 덕
    case "buk": membrane(90, 55, 0.6, 0.55); hit(180, 0.8, 0.1, 0.08); break; // 북: 쿵
    case "moktak": membrane(720, 690, 0.09, 0.22, 2.4); hit(900, 6, 0.06, 0.1); break; // 목탁: 똑
    case "bakk": hit(1800, 3, 0.04, 0.22); hit(3200, 5, 0.03, 0.12); break; // 박: 딱
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

// 모든 곡은 5음 음계(궁·상·각·치·우 = 1 2 3 5 6)로 지은 자체 창작곡입니다. 전자 악기 없이 국악기 소리만 씁니다.
const SONGS: Record<string, Song> = {
  // 메인 「달빛 강경」: 느린 세마치(3박) · 가야금 선율, 대금 긴 숨, 거문고 밑음, 풍경
  title: {
    bpm: 58, key: 62, beatsPerBar: 3, bars: 8, chords: [],
    parts: [
      { inst: "gayageum", oct: 1, notes: "5:1 6:1 1':1 6:2 5:1 3:1.5 2:0.5 3:1 5:3 6:1 5:1 3:1 2:2 1:1 2:1 3:1 2:1 1:3" },
      { inst: "daegeum", oct: 1, notes: "0:6 5:3 6:3 0:6 3:3 2:3", vel: 0.85 },
      { inst: "geomungo", oct: -1, notes: "1:3 1:3 6,:3 6,:3 1:3 1:3 5,:3 5,:3", vel: 0.8 },
      { inst: "chime", oct: 2, notes: "0:5 5:1 0:11 3:1 0:6", vel: 0.5 },
    ],
    drums: [{ kind: "kung", pattern: "x....." }, { kind: "deok", pattern: "...x.x" }],
  },
  // 탐험 「길 위의 타임워커」: 걷는 굿거리풍 · 가야금 + 대금 응답 + 거문고
  explore: {
    bpm: 88, key: 60, beatsPerBar: 4, bars: 4, chords: [],
    parts: [
      { inst: "gayageum", oct: 1, notes: "1:0.5 2:0.5 3:1 5:1 6:0.5 5:0.5 3:1 2:1 3:0.5 5:0.5 6:2 5:1 3:0.5 2:0.5 1:1 2:1 3:1 1:2" },
      { inst: "daegeum", oct: 1, notes: "0:8 6:2 5:2 3:2 5:2", vel: 0.8 },
      { inst: "geomungo", oct: -1, notes: "1:2 5,:2 6,:2 3,:2 1:2 5,:2 6,:2 5,:2", vel: 0.85 },
    ],
    drums: [{ kind: "kung", pattern: "x.....x...x....." }, { kind: "deok", pattern: "....x.......x.x." }],
  },
  // 온라인 마을 「장터 풍경」: 자진모리풍 · 소금 + 가야금 + 북
  village: {
    bpm: 104, key: 65, beatsPerBar: 4, bars: 4, chords: [],
    parts: [
      { inst: "gayageum", oct: 1, notes: "5:0.5 6:0.5 5:0.5 3:0.5 2:0.5 3:0.5 5:1 6:0.5 1':0.5 6:0.5 5:0.5 3:1 2:1 3:0.5 5:0.5 3:0.5 2:0.5 1:1 2:1 3:0.5 2:0.5 1:1 2:1 1:1" },
      { inst: "sogeum", oct: 2, notes: "0:4 5:2 6:2 0:4 3:2 2:2", vel: 0.7 },
      { inst: "geomungo", oct: -1, notes: "1:2 5,:2 6,:2 3,:2 5,:2 2:2 1:2 5,:2", vel: 0.8 },
    ],
    drums: [{ kind: "buk", pattern: "x.....x." }, { kind: "kung", pattern: "...x...." }, { kind: "deok", pattern: "..x...xx" }],
  },
  // 젓갈 공방 「옹기 장단」: 목탁처럼 똑똑 두드리는 소리 + 양금
  workshop: {
    bpm: 84, key: 67, beatsPerBar: 4, bars: 4, chords: [],
    parts: [
      { inst: "gayageum", oct: 0, notes: "1:1 3:0.5 2:0.5 1:1 5,:1 6,:1 1:1 2:2 3:1 5:0.5 3:0.5 2:1 1:1 2:1 3:1 1:2" },
      { inst: "yanggeum", oct: 1, notes: "1:2 5,:2 6,:2 5,:2 1:2 5,:2 2:2 1:2", vel: 0.6 },
      { inst: "geomungo", oct: -1, notes: "1:4 6,:4 1:4 5,:4", vel: 0.7 },
    ],
    drums: [{ kind: "moktak", pattern: "x..x..x." }, { kind: "kung", pattern: "x...x..." }],
  },
  // 도감·화첩·우체국 「고서의 밤」: 대금 독주 + 가야금 몇 음 + 풍경
  calm: {
    bpm: 54, key: 64, beatsPerBar: 4, bars: 4, chords: [],
    parts: [
      { inst: "daegeum", oct: 1, notes: "3:2 5:1 6:1 5:2 3:2 2:3 1:1 2:2 3:2" },
      { inst: "gayageum", oct: 1, notes: "0:2 1':1 0:3 6:1 0:3 5:1 0:5", vel: 0.6 },
      { inst: "geomungo", oct: -1, notes: "1:8 5,:8", vel: 0.6 },
      { inst: "chime", oct: 2, notes: "0:7 6:1 0:7 5:1", vel: 0.4 },
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

// ── 효과음 (국악기·생활 소리로만) ─────────────────────
function noise(dur: number, freq: number, gain = 0.15, delay = 0, type: BiquadFilterType = "bandpass", q = 1) {
  const a = init(); if (!a) return;
  const t = a.currentTime + delay;
  const s = a.createBufferSource(); s.buffer = noiseBuf;
  const f = a.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = a.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}
const now = (d = 0) => (init()?.currentTime ?? 0) + d;
const pl = (inst: Inst, midi: number, d = 0, dur = 0.4, vel = 1) => { if (init()) voice(inst, midi, now(d), dur, vel, sfxBus); };
const pk = (kind: Perc, d = 0, vel = 1) => { if (init()) perc(kind, now(d), vel, sfxBus); };
// 5음 음계 오름 (가야금 훑기)
const run = (inst: Inst, notes: number[], step: number, vel = 1) => notes.forEach((m, i) => pl(inst, m, i * step, 0.5, vel));
/** 엽전 부딪는 소리: 짧고 어긋난 쇳소리 두 번 */
function clink(delay = 0, pitch = 1) {
  const a = init(); if (!a) return;
  const t = a.currentTime + delay;
  [3100, 4630, 6870].forEach((fr, i) => { const o = a.createOscillator(); o.frequency.value = fr * pitch; const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05 / (i + 1), t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18 - i * 0.04); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.2); });
}

let lastTap = 0;
export const sfx = {
  tap: () => { const n = Date.now(); if (n - lastTap < 80) return; lastTap = n; pk("moktak", 0, 0.35); },
  hover: () => pl("chime", 96, 0, 0.1, 0.15),
  back: () => pl("gayageum", 62, 0, 0.3, 0.6),
  plop: () => { pk("kung", 0, 0.5); noise(0.12, 700, 0.05, 0.03); },
  splash: () => { noise(0.4, 1100, 0.16, 0, "bandpass", 0.7); noise(0.25, 2500, 0.06, 0.08, "bandpass", 1); },
  bubble: () => pl("yanggeum", 79 + Math.floor(Math.random() * 5), 0, 0.2, 0.5),
  coin: () => { clink(0); clink(0.07, 1.12); },
  collect: () => { run("gayageum", [72, 74, 76, 79, 81, 84], 0.06, 0.9); pl("chime", 96, 0.38, 0.5, 0.7); },
  success: () => run("gayageum", [67, 72, 76], 0.11, 1),
  quest: () => { pk("buk", 0, 0.8); run("gayageum", [60, 62, 64, 67, 69, 72], 0.07); pl("chime", 84, 0.45, 0.6, 0.8); },
  levelUp: () => { pk("buk", 0, 0.9); pk("buk", 0.28, 0.7); run("gayageum", [60, 64, 67, 69, 72, 76, 79, 84], 0.06); [84, 91, 88].forEach((m, i) => pl("chime", m, 0.5 + i * 0.12, 0.8, 0.8)); },
  error: () => { pl("geomungo", 45, 0, 0.2, 0.7); pl("geomungo", 44, 0.12, 0.25, 0.6); },
  meow: () => { const a = init(); if (!a) return; const t = a.currentTime; const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter(), f2 = a.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 4; f2.type = "bandpass"; f2.frequency.value = 2400; f2.Q.value = 5; o.type = "sawtooth";
    o.frequency.setValueAtTime(560, t); o.frequency.linearRampToValueAtTime(880, t + 0.14); o.frequency.linearRampToValueAtTime(500, t + 0.45);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.1, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
    o.connect(f); o.connect(f2); f.connect(g); f2.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.5); },
  boing: () => { const a = init(); if (!a) return; const { buf, rate } = ksString(mtof(67), "silk"); const s = a.createBufferSource(); s.buffer = buf; const t = a.currentTime; s.playbackRate.setValueAtTime(rate, t); s.playbackRate.linearRampToValueAtTime(rate * 1.33, t + 0.25); const g = a.createGain(); g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6); s.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + 0.65); },
  step: () => { noise(0.05, 380 + Math.random() * 200, 0.06, 0, "lowpass"); },
  stamp: () => { pk("buk", 0, 0.6); noise(0.1, 2200, 0.1); },
  shutter: () => { noise(0.04, 3000, 0.2); noise(0.06, 2000, 0.15, 0.07); },
  page: () => { noise(0.25, 3200, 0.06, 0, "bandpass", 0.5); },
  open: () => { pl("chime", 88, 0, 0.6, 0.7); pl("chime", 93, 0.1, 0.6, 0.6); },
  unlock: () => { clink(0); run("yanggeum", [76, 79, 84], 0.07, 0.8); },
  equip: () => { noise(0.3, 6000, 0.04, 0, "highpass"); pl("chime", 91, 0.08, 0.5, 0.5); },
  talk: () => pk("moktak", 0, 0.15 + Math.random() * 0.1),
  qr: () => { pl("chime", 88, 0, 0.4, 0.6); pl("chime", 95, 0.09, 0.5, 0.6); },
  fanfare: () => { pk("buk", 0, 0.9); pk("kung", 0.2, 0.6); run("gayageum", [67, 69, 72, 74, 76, 79], 0.08); pl("daegeum", 79, 0.5, 1.2, 0.9); pl("chime", 91, 0.6, 0.8, 0.7); },
};
export type SfxName = keyof typeof sfx;
