"use client";
// 게임 상태 Provider
// ─────────────────────────────────────────────────────────────
// - 로컬 모드: Supabase 미설정 또는 로그인 전. 엔진(lib/engine.ts)을 브라우저에서 실행하고 localStorage에 저장.
// - 서버 모드: 로그인 상태. 모든 행동을 /api/game/action 으로 보내고, 서버가 검증·저장한 결과(state)를 받아 씁니다.
//   보상 계산·중복 방지·QR/GPS 검증은 서버에서만 일어나므로 클라이언트 조작으로 보상을 만들 수 없습니다.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { GameState, JarRecord, Proof, VisitMethod } from "./types";
import { QUESTS, questProgress } from "./data/quests";
import { applyAction, expToNext, initialState, normalize, type Action, type Msg } from "./engine";
import { getBrowserSupabase } from "./supabase/browser";
import { sfx, type SfxName } from "./audio";
import { QUESTS as ALL_QUESTS } from "./data/quests";

/** 행동별 성공 효과음 */
const ACTION_SFX: Partial<Record<Action["type"], SfxName>> = {
  visit: "stamp", claimQuest: "quest", villageFind: "coin", npcGift: "coin", startJar: "splash", openJar: "fanfare",
  postcard: "stamp", buyWear: "unlock", equip: "equip", companion: "boing", contribute: "plop", readKnowledge: "page", letter: "stamp", picnic: "fanfare",
};

/** 발표·시연용 샘플 진행 상황 (로컬 모드 전용, 실제 엔진 규칙으로 만든 기록) */
export function buildShowcase(): GameState {
  let s = initialState();
  let t = Date.now() - 3 * 86400_000;
  const run = (a: Action) => { t += 600_000; const o = applyAction(s, a, { now: t, allowDemo: true }); if (o.ok) s = o.state; return o; };
  run({ type: "profile", name: "강경탐험가", avatar: "sage" });
  for (const id of ["welcome-center", "gwangshin", "memory-lighthouse", "photo-studio", "gallery", "honggyori", "coffee-interview", "modern-store"])
    run({ type: "visit", locationId: id, method: "demo" });
  for (const k of ["place:welcome-center", "place:music-library", "place:v-market", "place:romance-square"]) run({ type: "villageFind", key: k });
  for (const n of ["guide", "artisan", "merchant"]) run({ type: "talkNpc", npcId: n });
  for (const k of ["kd-port", "kd-jeotgal", "kd-cats"]) run({ type: "readKnowledge", id: k });
  run({ type: "npcGift", npcId: "artisan", node: "learn", index: 0 });
  for (const [id, ans] of [["qz1", 1], ["qz2", 1], ["qz3", 1]] as const) run({ type: "answerQuiz", quizId: id, answer: ans });
  const j = run({ type: "startJar", typeId: "saeu", ratio: 30, order: ["main", "salt", "topsalt"], useSincerity: false, jarSkin: "basic" });
  if (j.data?.jar) run({ type: "openJar", jarId: j.data.jar.id, fastForward: true });
  run({ type: "postcard", locationId: "gwangshin" });
  for (const q of ALL_QUESTS) run({ type: "claimQuest", questId: q.id });
  run({ type: "buyWear", wearId: "neck-scarf" });
  run({ type: "companion", charId: "kaengi" });
  for (const k of ["picnic:2", "picnic:3", "picnic:4", "picnic:5"]) run({ type: "villageFind", key: k });
  run({ type: "startJar", typeId: "saeu", ratio: 28, order: ["main", "salt", "topsalt"], useSincerity: false, jarSkin: "basic" });
  return s;
}

export { expToNext, initialState };

const KEY = "gtw-save-v1";

export interface Toast { id: number; text: string; icon?: string }
export interface ActResult { ok: boolean; error?: string; data?: { jar?: JarRecord; correct?: boolean } }
export interface SessionUser { id: string; email: string | null; isAnonymous: boolean }

interface Ctx {
  state: GameState;
  ready: boolean;
  mode: "local" | "remote";
  user: SessionUser | null;
  authConfigured: boolean;
  demoTools: boolean;
  toasts: Toast[];
  collectQueue: string[];
  dismissCollect: () => void;
  toast: (text: string, icon?: string) => void;
  act: (a: Action, opts?: { proof?: Proof; quiet?: boolean }) => Promise<ActResult>;
  visit: (locId: string, method: VisitMethod, proof?: Proof) => Promise<ActResult>;
  findOnline: (charId: string) => Promise<ActResult>;
  villageFind: (key: string) => Promise<boolean>;
  claimQuest: (id: string) => Promise<ActResult>;
  talkNpc: (id: string) => void;
  readKnowledge: (id: string) => void;
  startJar: (j: { typeId: string; ratio: number; order: string[]; useSincerity: boolean; jarSkin: string }) => Promise<boolean>;
  openJar: (id: string, fastForward?: boolean) => Promise<JarRecord | null>;
  answerQuiz: (id: string, answer: number) => Promise<boolean | null>;
  contribute: (itemId: string) => Promise<boolean>;
  rename: (name: string, avatar: string, house?: string) => Promise<ActResult>;
  reset: () => Promise<void>;
  signOut: () => Promise<void>;
  loadShowcase: () => void;
}

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children, authConfigured, demoToolsRemote }: { children: React.ReactNode; authConfigured: boolean; demoToolsRemote: boolean }) {
  const [state, setState] = useState<GameState>(initialState);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"local" | "remote">("local");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [collectQueue, setCollectQueue] = useState<string[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  // 세션 확인(로컬/서버 모드 결정)이 끝나기 전의 행동은 대기시킵니다. (예: QR 링크로 앱이 열린 직후)
  const readyGate = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);
  if (!readyGate.current) { let resolve!: () => void; const promise = new Promise<void>((r) => { resolve = r; }); readyGate.current = { promise, resolve }; }
  useEffect(() => { if (ready) readyGate.current!.resolve(); }, [ready]);

  const toast = useCallback((text: string, icon?: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const loadLocal = useCallback(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setState(raw ? normalize(JSON.parse(raw)) : initialState());
    } catch { setState(initialState()); }
    setMode("local");
  }, []);

  const loadRemote = useCallback(async () => {
    const r = await fetch("/api/game/state", { cache: "no-store" });
    if (!r.ok) throw new Error("state load failed");
    const j = await r.json();
    setState(normalize(j.state));
    setMode("remote");
  }, []);

  // 세션 확인 → 모드 결정
  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!authConfigured || !sb) { loadLocal(); setReady(true); return; }
    let alive = true;
    const apply = async (u: { id: string; email?: string | null; is_anonymous?: boolean } | null) => {
      if (!alive) return;
      if (u) {
        setUser({ id: u.id, email: u.email ?? null, isAnonymous: !!u.is_anonymous });
        try { await loadRemote(); } catch { toast("서버에서 기록을 불러오지 못했어요. 로컬 모드로 계속해요.", "⚠️"); loadLocal(); }
      } else { setUser(null); loadLocal(); }
      setReady(true);
    };
    sb.auth.getUser().then(({ data }) => apply(data.user));
    const { data: sub } = sb.auth.onAuthStateChange((ev, session) => {
      if (ev === "SIGNED_IN" || ev === "SIGNED_OUT" || ev === "USER_UPDATED") apply(session?.user ?? null);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [authConfigured, loadLocal, loadRemote, toast]);

  // 로컬 모드 저장
  useEffect(() => {
    if (!ready || mode !== "local") return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, ready, mode]);

  const act = useCallback((a: Action, opts?: { proof?: Proof; quiet?: boolean }): Promise<ActResult> => {
    const run = async (): Promise<ActResult> => {
      await readyGate.current!.promise;
      const prevLevel = stateRef.current.player.level;
      let res: { ok: boolean; error?: string; newly?: string[]; messages?: Msg[]; data?: ActResult["data"]; state?: GameState };
      if (modeRef.current === "remote") {
        try {
          const r = await fetch("/api/game/action", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: a, proof: opts?.proof }) });
          res = await r.json();
        } catch { res = { ok: false, error: "서버에 연결할 수 없어요" }; }
        if (res.state) { const ns = normalize(res.state); stateRef.current = ns; setState(ns); }
      } else {
        const out = applyAction(stateRef.current, a, { now: Date.now(), allowDemo: true });
        if (out.ok) { stateRef.current = out.state; setState(out.state); }
        res = out;
      }
      if (res.ok) {
        res.messages?.forEach((m) => toast(m.text, m.icon));
        if (res.newly?.length) setCollectQueue((q) => [...q, ...res.newly!]);
        const snd = ACTION_SFX[a.type];
        if (snd && (res.messages?.length || a.type === "equip" || a.type === "openJar")) sfx[snd]();
        const lv = stateRef.current.player.level;
        if (lv > prevLevel) setTimeout(() => { sfx.levelUp(); toast(`레벨 업! Lv.${lv} 달성`, "🎉"); }, 500);
      } else if (!opts?.quiet && res.error) { sfx.error(); toast(res.error, "ℹ️"); }
      return { ok: res.ok, error: res.error, data: res.data };
    };
    const p = queue.current.then(run, run); // 서버 버전 충돌을 막기 위해 순차 실행
    queue.current = p;
    return p;
  }, [toast]);

  const value = useMemo<Ctx>(() => ({
    state, ready, mode, user, authConfigured,
    demoTools: mode === "local" || demoToolsRemote,
    toasts, collectQueue, toast, act,
    dismissCollect: () => setCollectQueue((q) => q.slice(1)),
    visit: (locationId, method, proof) => act({ type: "visit", locationId, method }, { proof }),
    findOnline: (charId) => act({ type: "findOnline", charId }),
    villageFind: async (key) => (await act({ type: "villageFind", key }, { quiet: true })).ok,
    claimQuest: (questId) => act({ type: "claimQuest", questId }),
    talkNpc: (npcId) => { if (!stateRef.current.npcTalked.includes(npcId)) act({ type: "talkNpc", npcId }, { quiet: true }); },
    readKnowledge: (id) => { if (!stateRef.current.knowledgeRead.includes(id)) act({ type: "readKnowledge", id }, { quiet: true }); },
    startJar: async (j) => (await act({ type: "startJar", ...j })).ok,
    openJar: async (jarId, fastForward) => (await act({ type: "openJar", jarId, fastForward })).data?.jar ?? null,
    answerQuiz: async (quizId, answer) => { const r = await act({ type: "answerQuiz", quizId, answer }); return r.ok ? !!r.data?.correct : null; },
    contribute: async (itemId) => (await act({ type: "contribute", itemId })).ok,
    rename: (name, avatar, house) => act({ type: "profile", name, avatar, house }),
    reset: async () => {
      if (modeRef.current === "remote") {
        const r = await fetch("/api/game/state", { method: "DELETE" });
        if (r.ok) setState(normalize((await r.json()).state));
      } else setState(initialState());
      setCollectQueue([]);
    },
    signOut: async () => { await getBrowserSupabase()?.auth.signOut(); },
    loadShowcase: () => { if (modeRef.current !== "local") return; const ns = buildShowcase(); stateRef.current = ns; setState(ns); sfx.fanfare(); toast("발표용 샘플 기록을 불러왔어요", "🎬"); },
  }), [state, ready, mode, user, authConfigured, demoToolsRemote, toasts, collectQueue, toast, act]);

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const c = useContext(GameCtx);
  if (!c) throw new Error("useGame must be used inside GameProvider");
  return c;
}

export function claimableCount(s: GameState) {
  return QUESTS.filter((q) => { const p = questProgress(q, s); return p.complete && !p.claimed; }).length;
}
