"use client";
// 탐험: 화면 전체가 게임 판. 손가락으로 지도를 밀고 벌려 보고, 장소·시간 조각을 톡 누르면 내 캐릭터가 걸어가요.
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGame } from "@/lib/game";
import { DISTRICT_INFO, type GameLocation } from "@/lib/data/locations";
import { useContent } from "@/lib/content";
import { NPC } from "@/lib/data/npcs";
import { ITEMS } from "@/lib/data/jeotgal";
import { DemoBadge, MiniHud, Sheet } from "@/components/ui";
import { CharacterArt, NpcArt, WalkerArt } from "@/components/Characters";
import { MAP_BOX } from "@/components/art/OldMap";
import WorldMap from "@/components/art/WorldMap";
import { LocationScene } from "@/components/art/LocationArt";
import { Ico } from "@/components/art/Icons";
import QrScanner, { verifyQrPayload } from "@/components/QrScanner";
import NpcDialog from "@/components/NpcDialog";
import CatchGame, { SparkGem } from "@/components/CatchGame";
import StoryPlayer from "@/components/StoryPlayer";
import { sfx } from "@/lib/sfx";
import { dayKeyKST, sparkSpots, SPARKS_PER_DAY, type SparkInfo } from "@/lib/data/sparks";
import { CHAPTERS, chapterProgress, currentChapter, fogCleared, objectiveLine, type Chapter } from "@/lib/data/story";
import { haptic } from "@/lib/fx";
import { useDaytime, PHASE_LABEL, PHASE_BG } from "@/lib/daytime";
import { inDistrict, latLngToMap, metersToMapDelta, toMeters, metersPerUnit, distanceM } from "@/lib/geomap";

const RealMap = dynamic(() => import("@/components/RealMap"), { ssr: false, loading: () => <div className="h-[50vh] grid place-items-center font-game text-wood">지도를 불러오는 중…</div> });

type Me = { lat: number; lng: number; accuracy: number };
type View = { x: number; y: number; k: number };
const W = MAP_BOX.w, H = MAP_BOX.h;
const toPx = (x: number, y: number) => ({ x: x - MAP_BOX.x, y: y - MAP_BOX.y });
const SEEN_KEY = "gtw-intro-seen";
const seenIntros = (): string[] => { try { return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]"); } catch { return []; } };
const markIntro = (id: string) => { try { localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set([...seenIntros(), id])])); } catch { /* ignore */ } };

export default function Explore() {
  const { state, visit, toast, mode, demoTools, act, ready } = useGame();
  const { locations: LOCATIONS, LOC, CHAR } = useContent();
  const [sel, setSel] = useState<GameLocation | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [realOpen, setRealOpen] = useState(false);
  const [npcId, setNpcId] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [geoMsg, setGeoMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [catching, setCatching] = useState<{ index: number; info: SparkInfo } | null>(null);
  const [story, setStory] = useState<{ ch: Chapter; part: "intro" | "outro" } | null>(null);
  const [chapterOpen, setChapterOpen] = useState(false);

  // ── 지도 카메라 (밀기·벌리기·휠) ─────────────────────────
  const box = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const view = useRef<View>({ x: 0, y: 0, k: 1 });
  const dragged = useRef(false);
  const apply = (animate = false) => {
    const el = layer.current; if (!el) return;
    el.style.transition = animate ? "transform .9s var(--out)" : "none";
    const v = view.current;
    el.style.transform = `translate3d(${v.x}px, ${v.y}px, 0) scale(${v.k})`;
  };
  const clamp = (v: View): View => {
    const b = box.current; if (!b) return v;
    const vw = b.clientWidth, vh = b.clientHeight;
    // 그림은 지도 둘레로 200만큼 더 그려져 있어요. 그 안에서만 움직이고 축소되게
    const M = 200;
    const minK = Math.max(vw / (W + 2 * M), vh / (H + 2 * M), 0.35);
    const k = Math.min(2.4, Math.max(minK, v.k));
    const pad = M * k;
    const x = Math.min(pad, Math.max(vw - W * k - pad, v.x));
    const y = Math.min(pad, Math.max(vh - H * k - pad, v.y));
    return { x, y, k };
  };
  const centerOn = useCallback((mx: number, my: number, animate = true, k?: number) => {
    const b = box.current; if (!b) return;
    const kk = k ?? view.current.k;
    const p = toPx(mx, my);
    view.current = clamp({ k: kk, x: b.clientWidth / 2 - p.x * kk, y: b.clientHeight * 0.55 - p.y * kk });
    apply(animate);
  }, []);

  // 내 캐릭터 위치 (지도 좌표) — 이 기기에만 저장
  const [walker, setWalker] = useState({ x: LOC["welcome-center"]?.mapX ?? 410, y: (LOC["welcome-center"]?.mapY ?? 962) + 30, flip: false, moving: false, dur: 0 });
  useEffect(() => {
    let pos = walker;
    try { const s = JSON.parse(localStorage.getItem("gtw-pos") ?? "null"); if (s?.x) pos = { ...walker, x: s.x, y: s.y }; } catch { /* ignore */ }
    setWalker(pos);
    requestAnimationFrame(() => centerOn(pos.x, pos.y, false, Math.max(0.8, (box.current?.clientWidth ?? 400) / 700)));
    const onResize = () => { view.current = clamp(view.current); apply(); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const walkerRef = useRef(walker);
  walkerRef.current = walker;
  const walkTo = useCallback((x: number, y: number) => new Promise<void>((done) => {
    const w = walkerRef.current;
    const dist = Math.hypot(x - w.x, y - w.y);
    const dur = Math.round(Math.min(1500, 250 + dist * 2.2));
    try { localStorage.setItem("gtw-pos", JSON.stringify({ x, y })); } catch { /* ignore */ }
    const steps = Math.max(1, Math.floor(dur / 260));
    for (let i = 0; i < steps; i++) setTimeout(() => sfx.step(), i * 260);
    setWalker({ x, y, flip: x < w.x, moving: dist > 4, dur });
    setTimeout(() => { setWalker((v) => ({ ...v, moving: false })); done(); }, dur);
    const b = box.current;
    if (b) { // 카메라도 함께 따라감
      const p = toPx(x, y); const k = view.current.k;
      view.current = clamp({ k, x: b.clientWidth / 2 - p.x * k, y: b.clientHeight * 0.55 - p.y * k });
      const el = layer.current; if (el) { el.style.transition = `transform ${dur}ms var(--out)`; el.style.transform = `translate3d(${view.current.x}px, ${view.current.y}px, 0) scale(${k})`; }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  useEffect(() => {
    const b = box.current; if (!b) return;
    const pts = new Map<number, { x: number; y: number }>();
    let start: { v: View; d: number; cx: number; cy: number; x: number; y: number } | null = null;
    const snap = () => {
      const arr = [...pts.values()];
      const cx = arr.reduce((s, p) => s + p.x, 0) / arr.length, cy = arr.reduce((s, p) => s + p.y, 0) / arr.length;
      const d = arr.length > 1 ? Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y) : 0;
      start = { v: { ...view.current }, d, cx, cy, x: cx, y: cy };
    };
    const down = (e: PointerEvent) => { if (e.pointerType === "mouse" && e.button !== 0) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); dragged.current = false; snap(); };
    const move = (e: PointerEvent) => {
      if (!pts.has(e.pointerId) || !start) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const arr = [...pts.values()];
      const cx = arr.reduce((s, p) => s + p.x, 0) / arr.length, cy = arr.reduce((s, p) => s + p.y, 0) / arr.length;
      if (Math.hypot(cx - start.x, cy - start.y) > 6) dragged.current = true;
      let k = start.v.k;
      if (arr.length > 1 && start.d) { k = start.v.k * (Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y) / start.d); dragged.current = true; }
      const r = b.getBoundingClientRect();
      const ox = start.cx - r.left, oy = start.cy - r.top;
      const mx = (ox - start.v.x) / start.v.k, my = (oy - start.v.y) / start.v.k;
      view.current = clamp({ k, x: cx - r.left - mx * k, y: cy - r.top - my * k });
      apply();
    };
    const up = (e: PointerEvent) => { pts.delete(e.pointerId); if (pts.size) snap(); else start = null; };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = b.getBoundingClientRect();
      const k = view.current.k * (e.deltaY < 0 ? 1.12 : 0.89);
      const mx = (e.clientX - r.left - view.current.x) / view.current.k, my = (e.clientY - r.top - view.current.y) / view.current.k;
      view.current = clamp({ k, x: e.clientX - r.left - mx * k, y: e.clientY - r.top - my * k });
      apply();
    };
    b.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    b.addEventListener("wheel", wheel, { passive: false });
    return () => { b.removeEventListener("pointerdown", down); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); b.removeEventListener("wheel", wheel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const zoom = (f: number) => { const b = box.current; if (!b) return; const v = view.current; const cx = b.clientWidth / 2, cy = b.clientHeight / 2; const k = v.k * f; view.current = clamp({ k, x: cx - ((cx - v.x) / v.k) * k, y: cy - ((cy - v.y) / v.k) * k }); apply(true); };

  // ── 시간 조각 ─────────────────────────
  const [today, setToday] = useState("");
  useEffect(() => { setToday(dayKeyKST(Date.now())); }, []);
  const anchors = useMemo(() => LOCATIONS.map((l) => ({ x: l.mapX, y: l.mapY })), [LOCATIONS]);
  const spots = useMemo(() => (today ? sparkSpots(today, anchors) : []), [today, anchors]);
  const got = state.sparks?.day === today ? state.sparks.got : [];
  const left = spots.filter((s) => !got.includes(s.index));

  const [heading, setHeading] = useState(false); // 걸어가는 중에는 이야기 장면이 끼어들지 않게
  const tapSpark = async (s: (typeof spots)[number]) => {
    if (dragged.current || busy || heading) return;
    sfx.tap(); setHeading(true);
    await walkTo(s.x, s.y + 20);
    setCatching({ index: s.index, info: s.info }); setHeading(false);
  };
  const catchSpark = async () => {
    if (!catching) return null;
    const r = await act({ type: "spark", index: catching.index });
    return r.ok ? r.data?.spark ?? catching.info : null;
  };

  // ── 장소 ─────────────────────────
  const tapLocation = async (l: GameLocation) => {
    if (dragged.current || heading) return;
    sfx.page(); setHeading(true);
    await walkTo(l.mapX + 26, l.mapY + 40);
    setSel(l); setHeading(false);
  };

  const handleQr = useCallback(async (payload: string) => {
    setQrOpen(false); setBusy(true);
    const r = await verifyQrPayload(payload);
    setBusy(false);
    if (!r.ok || !r.locationId) { sfx.error(); toast(r.reason ?? "인증 실패", "⚠️"); return; }
    const v = await visit(r.locationId, "qr", { qr: payload });
    if (v.ok) sfx.success();
    const l = LOC[r.locationId];
    if (l) { centerOn(l.mapX, l.mapY); setWalker((w) => ({ ...w, x: l.mapX + 26, y: l.mapY + 40 })); }
    setSel(l);
  }, [visit, toast, LOC, centerOn]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("qr");
    if (q) { handleQr(q); window.history.replaceState(null, "", "/explore"); }
  }, [handleQr]);

  const locate = () => new Promise<Me | null>((resolve) => {
    if (!navigator.geolocation) { setGeoMsg("이 기기는 위치 기능을 지원하지 않아요. QR 인증이나 온라인 마을을 이용하세요."); return resolve(null); }
    setGeoMsg("현재 위치를 확인하는 중…");
    navigator.geolocation.getCurrentPosition(
      (p) => { const m = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }; setMe(m); setGeoMsg(`현재 위치 확인 (정확도 ±${Math.round(m.accuracy)}m)`); resolve(m); },
      () => { setGeoMsg("위치 권한이 거부되었어요. QR 인증과 온라인 마을은 그대로 이용할 수 있어요."); resolve(null); },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  });

  const gpsVerify = async (loc: GameLocation) => {
    const m = await locate();
    if (!m) return;
    setBusy(true);
    if (mode === "local") {
      const r = await fetch("/api/gps/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ locationId: loc.id, ...m }) })
        .then((x) => x.json()).catch(() => ({ ok: false, reason: "서버 연결 실패" }));
      if (!r.ok) { setBusy(false); sfx.error(); toast(r.reason, "📡"); return; }
    }
    const v = await visit(loc.id, "gps", { gps: m });
    setBusy(false);
    if (v.ok) sfx.success(); else sfx.error();
  };

  // ── 실제 걸음 모드: 휴대폰 위치를 따라 캐릭터가 걸어요 (피크민처럼) ─────────────
  // 강경근대거리 안에서는 실제 위치에 맞춰 서고, 밖에서는 내가 걸은 만큼만 지도 위에서 움직여요.
  const [walkMode, setWalkMode] = useState(false);
  const [walkInfo, setWalkInfo] = useState<{ acc: number; absolute: boolean; meters: number } | null>(null);
  const lastFix = useRef<{ lat: number; lng: number } | null>(null);
  const smooth = useRef<{ x: number; y: number } | null>(null);
  const walkedM = useRef(0);
  const arrived = useRef(new Set<string>());
  const sparkNear = useRef(new Set<number>());
  useEffect(() => { try { walkedM.current = Number(localStorage.getItem("gtw-walked-" + dayKeyKST(Date.now())) ?? 0); } catch { /* ignore */ } }, []);
  useEffect(() => {
    if (!walkMode) return;
    if (!navigator.geolocation) { toast("이 기기는 위치 기능을 지원하지 않아요", "📡"); setWalkMode(false); return; }
    toast("실제 걸음 모드! 걸으면 캐릭터도 함께 걸어요", "🐾");
    { const w = walkerRef.current; LOCATIONS.forEach((l) => { if (Math.hypot(l.mapX - w.x, l.mapY - w.y) * metersPerUnit() < 18) arrived.current.add(l.id); }); }
    const id = navigator.geolocation.watchPosition((pos) => {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      if (accuracy > 60) { setWalkInfo((w) => ({ acc: accuracy, absolute: w?.absolute ?? false, meters: walkedM.current })); return; }
      const here = { lat, lng };
      const absolute = inDistrict(here);
      const w = walkerRef.current;
      let target: { x: number; y: number };
      if (absolute) target = latLngToMap(here);
      else if (lastFix.current) { const m = toMeters(here, lastFix.current); const d = metersToMapDelta(m.e, m.n); target = { x: w.x + d.dx, y: w.y + d.dy }; }
      else target = { x: w.x, y: w.y };
      if (lastFix.current) {
        const step = distanceM(here, lastFix.current);
        if (step < Math.max(3, accuracy * 0.4)) { setWalkInfo({ acc: accuracy, absolute, meters: walkedM.current }); if (!absolute) return; } // 제자리 흔들림 무시
        else { walkedM.current += step; try { localStorage.setItem("gtw-walked-" + dayKeyKST(Date.now()), String(Math.round(walkedM.current))); } catch { /* ignore */ } }
      }
      lastFix.current = here;
      // 부드럽게: 이전 위치와 섞음
      const sm = smooth.current ?? target;
      const k = absolute ? 0.55 : 1;
      const nx = sm.x + (target.x - sm.x) * k, ny = sm.y + (target.y - sm.y) * k;
      smooth.current = { x: nx, y: ny };
      setWalkInfo({ acc: accuracy, absolute, meters: walkedM.current });
      if (Math.hypot(nx - w.x, ny - w.y) > 2) walkTo(nx, ny);
    }, () => { toast("위치 권한이 필요해요. 설정에서 허용해 주세요", "📡"); setWalkMode(false); }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 });
    return () => { navigator.geolocation.clearWatch(id); lastFix.current = null; smooth.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walkMode]);

  // 걸어서 가까이 가면: 장소 도착 알림 · 시간 조각 붙잡기
  useEffect(() => {
    if (!walkMode || !walkInfo || catching || story || sel) return; // 첫 위치를 받은 뒤부터
    const near = (x: number, y: number, m: number) => Math.hypot(walker.x - x, walker.y - y) * metersPerUnit() < m;
    const spark = left.find((s) => near(s.x, s.y, 15) && !sparkNear.current.has(s.index));
    if (spark) { sparkNear.current.add(spark.index); haptic([20, 30, 20]); sfx.open(); setCatching({ index: spark.index, info: spark.info }); return; }
    const loc = LOCATIONS.find((l) => near(l.mapX, l.mapY, 18) && !arrived.current.has(l.id));
    if (loc) {
      arrived.current.add(loc.id); haptic([30, 40, 30]); sfx.success();
      toast(state.visits[loc.id] ? `${loc.name}에 다시 왔어요!` : `${loc.name} 도착! 장소의 QR을 찍어 도장을 받아요`, "📍");
      setSel(loc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walker.x, walker.y, walkMode, walkInfo?.meters]);

  // ── 이야기 ─────────────────────────
  const cur = currentChapter(state);
  const prog = cur ? chapterProgress(cur, state) : null;
  const cleared = fogCleared(state);
  useEffect(() => {
    if (!ready || !cur || story || catching || sel || heading) return;
    const seen = seenIntros();
    // 목표를 다 이뤘으면 마무리 장면을 한 번 자동으로, 새 장이 열렸으면 도입 장면을 한 번 자동으로
    if (prog?.complete && !seen.includes(`${cur.id}:outro`)) { markIntro(`${cur.id}:outro`); const t = setTimeout(() => setStory({ ch: cur, part: "outro" }), 600); return () => clearTimeout(t); }
    if (cur.id !== "ch0" && !seen.includes(cur.id)) { const t = setTimeout(() => setStory({ ch: cur, part: "intro" }), 700); return () => clearTimeout(t); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, cur?.id, prog?.complete, story, catching, sel, heading]);

  const finishStory = async () => {
    if (!story) return;
    const { ch, part } = story;
    setStory(null);
    if (part === "intro") { markIntro(ch.id); return; }
    const r = await act({ type: "chapter", id: ch.id });
    if (r.ok) { sfx.quest(); haptic([20, 40, 60]); }
  };
  const openChapter = () => {
    if (!cur) { setChapterOpen(true); return; }
    if (prog?.complete) { sfx.open(); setStory({ ch: cur, part: "outro" }); return; }
    setChapterOpen(true);
  };

  const visitedCount = Object.keys(state.visits).length;
  const companion = state.companion;
  const dt = useDaytime();
  const wp = toPx(walker.x, walker.y);

  return (
    <main className="fixed inset-0 overflow-hidden" style={{ background: PHASE_BG[dt.phase], transition: "background 2s" }}>
      {/* ── 지도 판 ── */}
      <div ref={box} className="absolute inset-0 touch-none select-none" onClickCapture={(e) => { if (dragged.current) { e.stopPropagation(); e.preventDefault(); } }}>
        <div ref={layer} className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ width: W, height: H }}>
          <WorldMap locations={LOCATIONS} state={state} selId={sel?.id} onSelect={tapLocation} className="absolute inset-0 w-full h-full block" />
          {/* 망각의 안개: 이야기가 진행될수록 걷힘 */}
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-[2000ms]" style={{ opacity: 0.28 * (1 - cleared) }}>
            <div className="absolute inset-0 anim-fog" style={{ background: "radial-gradient(ellipse 40% 18% at 30% 30%, rgba(236,232,220,.9), transparent 70%), radial-gradient(ellipse 45% 16% at 70% 60%, rgba(236,232,220,.85), transparent 70%), radial-gradient(ellipse 50% 20% at 40% 85%, rgba(236,232,220,.8), transparent 70%)" }} />
          </div>
          {/* 시간 조각 */}
          {left.map((s) => {
            const p = toPx(s.x, s.y);
            return (
              <button key={s.index} onClick={() => tapSpark(s)} aria-label={`${s.info.name} 붙잡기`}
                className="absolute -translate-x-1/2 -translate-y-1/2 p-2 anim-pop" style={{ left: p.x, top: p.y, animationDelay: `${s.index * 0.08}s` }}>
                <span className="block spark-float" style={{ animationDelay: `${s.index * -0.4}s` }}><SparkGem kind={s.info.kind} size={s.info.kind === "golden" ? 56 : 46} /></span>
              </button>
            );
          })}
          {/* 나 + 동행 친구 */}
          <div className="absolute pointer-events-none" style={{ left: 0, top: 0, transform: `translate(${wp.x}px, ${wp.y}px)`, transition: `transform ${walker.moving ? walker.dur : 0}ms linear` }}>
            {companion && (
              <div className="absolute w-12 h-12 -translate-x-1/2 -translate-y-full" style={{ left: walker.flip ? 34 : -34, top: 6, transition: "left .4s var(--out)" }}>
                <div className={walker.moving ? "anim-walk w-full h-full" : "anim-idle w-full h-full"}><CharacterArt id={companion} className="w-full h-full" /></div>
              </div>
            )}
            <div className="absolute w-16 h-[88px] -translate-x-1/2 -translate-y-full">
              <div className="absolute -inset-3 rounded-full bg-antique-light/40 blur-md anim-glow" />
              <div className="w-full h-full"><WalkerArt avatar={state.player.avatar} walking={walker.moving} flip={walker.flip} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 위: 명패 + 이야기 띠 ── */}
      <div className="absolute top-0 inset-x-0 p-3 pt-[max(12px,env(safe-area-inset-top))] flex items-start gap-2 pointer-events-none">
        <div className="pointer-events-auto"><MiniHud /></div>
        <div className="flex-1" />
        <div className="pointer-events-auto flex flex-col items-end gap-1.5 mr-12">
          <span className="chip bg-[#FFFDF8]/95 text-sumi shadow-card !text-[13px] !py-1" title="강경의 지금 시각">{dt.phase === "night" ? "🌙" : dt.phase === "dusk" ? "🌇" : dt.phase === "dawn" ? "🌅" : "☀️"} {PHASE_LABEL[dt.phase]} {dt.clock}</span>
          <span className="chip bg-[#FFFDF8]/95 text-sumi shadow-card !text-[13px] !py-1"><SparkGem kind="moment" size={18} />{got.length}/{SPARKS_PER_DAY}</span>
          <span className="chip bg-[#FFFDF8]/95 text-sumi shadow-card !text-[13px] !py-1"><Ico name="stamp" size={16} />{visitedCount}/{LOCATIONS.length}</span>
        </div>
      </div>
      {/* 이야기 알약: 한 줄로 작게 — 지도를 가리지 않게 */}
      <button onClick={openChapter} className={`absolute left-3 top-[calc(max(12px,env(safe-area-inset-top))+70px)] max-w-[calc(100%-120px)] flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full shadow-card text-left ${prog?.complete ? "bg-vermilion text-white" : "bg-[#FFFDF8]/95 text-sumi"}`}
        style={{ animation: prog?.complete ? "glow-pulse 2.4s ease-in-out infinite" : undefined }} aria-label="이야기 보기">
        <span className={`font-game font-bold text-[11px] shrink-0 px-2 py-0.5 rounded-full ${prog?.complete ? "bg-white/25" : "bg-vermilion text-white"}`}>{cur ? cur.no : "완결"}</span>
        <span className="min-w-0 truncate text-[13px] font-game font-bold">{cur ? (prog?.complete ? "이야기 이어보기 ▶" : objectiveLine(cur, state)) : "시간 조각은 매일 새로 떨어져요"}</span>
      </button>

      {walkMode && (
        <div className="absolute left-3 top-[calc(max(12px,env(safe-area-inset-top))+112px)] px-3 py-1.5 rounded-full bg-vermilion text-white text-[12px] font-game font-bold shadow-card flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white anim-glow" />
          {walkInfo ? (walkInfo.acc > 60 ? `위치 잡는 중… (±${Math.round(walkInfo.acc)}m)` : `${walkInfo.absolute ? "강경근대거리" : "내가 걸은 만큼"} · 오늘 ${Math.round(walkInfo.meters)}m`) : "위치 찾는 중…"}
        </div>
      )}
      {/* ── 오른쪽: 확대/축소 · 내 위치 · 실제 지도 ── */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {[["+", () => zoom(1.25), "확대"], ["−", () => zoom(0.8), "축소"]].map(([t, f, l]) => (
          <button key={l as string} onClick={f as () => void} aria-label={l as string} className="w-11 h-11 rounded-full bg-[#FFFDF8]/95 shadow-card font-game text-2xl text-sumi active:scale-90 transition-transform">{t as string}</button>
        ))}
        <button onClick={() => centerOn(walker.x, walker.y)} aria-label="내 캐릭터로" className="w-11 h-11 rounded-full grid place-items-center bg-[#FFFDF8]/95 shadow-card active:scale-90 transition-transform"><Ico name="person" size={24} /></button>
        <button onClick={() => { sfx.tap(); setWalkMode((v) => !v); }} aria-label={walkMode ? "실제 걸음 모드 끄기" : "실제 걸음 모드 켜기"} aria-pressed={walkMode}
          className={`w-11 h-11 rounded-full grid place-items-center shadow-card active:scale-90 transition-transform ${walkMode ? "bg-vermilion text-white" : "bg-[#FFFDF8]/95"}`}>
          <Ico name="paw" size={24} />
        </button>
        <button onClick={() => setRealOpen(true)} aria-label="실제 지도와 GPS" className="w-11 h-11 rounded-full grid place-items-center bg-[#FFFDF8]/95 shadow-card active:scale-90 transition-transform"><Ico name="compass" size={24} /></button>
      </div>

      {/* ── 아래: QR 큰 버튼 + 온라인 마을 ── */}
      <div className="absolute inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] flex items-end justify-between px-4 pointer-events-none">
        <Link href={sel ? `/postcard?loc=${sel.id}` : "/postcard"} className="pointer-events-auto flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl bg-[#FFFDF8]/95 shadow-card text-[12px] font-game font-bold text-sumi active:scale-95 transition-transform"><Ico name="camera" size={26} />캐릭터 엽서</Link>
        <button onClick={() => setQrOpen(true)} aria-label="QR로 현장 인증" className="pointer-events-auto relative w-[74px] h-[74px] rounded-full grid place-items-center text-white active:scale-90 transition-transform"
          style={{ background: "linear-gradient(#C35A4F, #963F38)", boxShadow: "inset 0 3px 0 rgba(255,255,255,.28), 0 5px 0 #6E2A24, 0 12px 22px -6px rgba(150,63,56,.6)" }}>
          <span className="flex flex-col items-center"><Ico name="qr" size={30} /><span className="text-[11px] font-game font-bold -mt-0.5">현장 인증</span></span>
        </button>
      </div>

      {/* ── 장소 시트 ── */}
      <Sheet open={!!sel} onClose={() => setSel(null)} label="장소 정보">
        {sel && (
          <div className="px-4 pb-5">
            <div className="relative -mx-1 mb-3 anim-unfold">
              <LocationScene id={sel.id} name={sel.name} />
              {state.visits[sel.id] && <span className="absolute right-3 bottom-3 seal w-16 h-16 text-base rotate-[-10deg] anim-stamp">방문<br />인증</span>}
            </div>
            <div className="flex items-start gap-3">
              <div className="seal w-12 h-12 text-2xl shrink-0">{sel.no}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1">
                  <span className="chip bg-sage text-cream">실제 장소</span>
                  <span className="chip bg-cream-dark text-wood">{sel.zone === "street" ? "강경근대거리" : "강경구락부"}</span>
                  {state.visits[sel.id] && <span className="chip bg-gold text-wood-dark">방문 완료 ({state.visits[sel.id].method.toUpperCase()})</span>}
                </div>
                <h2 className="font-story text-3xl text-sumi mt-1">{sel.name}</h2>
                {sel.note && <p className="text-sm text-wood">안내도 표기: {sel.note}</p>}
              </div>
            </div>
            {sel.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sel.photoUrl} alt={`${sel.name} 사진`} className="mt-3 w-full rounded-xl border-2 border-wood object-cover max-h-56" />
            )}
            {sel.description && <p className="mt-2 text-sm text-wood-dark">{sel.description}</p>}
            {sel.historyStatus === "approved" && sel.history && (
              <div className="mt-2 rounded-xl bg-cream border-2 border-wood/40 p-3 text-sm">
                <p className="font-game font-bold text-sumi">역사적 배경 <span className="chip bg-jade text-hanji-light">승인 자료</span></p>
                <p className="text-wood mt-1 whitespace-pre-line">{sel.history}</p>
              </div>
            )}
            {sel.gameRole && <p className="mt-2 text-sm rounded-xl bg-gold/30 p-3"><span className="chip bg-wood text-cream mr-1">게임 설정</span>{sel.gameRole}</p>}
            {(sel.characterIds?.length || sel.npcId) && (
              <div className="mt-3 flex gap-3 items-center">
                {sel.characterIds?.map((cid) => (
                  <div key={cid} className="text-center">
                    <div className="w-16 h-16"><CharacterArt id={cid} silhouette={!state.characters[cid]} className="w-full h-full anim-idle" /></div>
                    <p className="text-xs font-game">{state.characters[cid] ? CHAR[cid].name : "???"}</p>
                  </div>
                ))}
                {sel.npcId && (
                  <button className="flex items-center gap-2 rounded-xl bg-cream border-2 border-wood p-2" onClick={() => setNpcId(sel.npcId!)}>
                    <div className="w-12 h-12"><NpcArt look={NPC[sel.npcId].look} /></div>
                    <span className="font-game text-sm text-left">{NPC[sel.npcId].title}<br />{NPC[sel.npcId].name}와 대화</span>
                  </button>
                )}
              </div>
            )}
            <p className="mt-3 text-sm text-wood-dark font-game">
              방문 보상: +{sel.reward.exp} EXP · 엽전 {sel.reward.coins}
              {sel.reward.items && Object.entries(sel.reward.items).map(([k, v]) => ` · ${ITEMS[k].name}×${v}`)}
            </p>
            {!state.visits[sel.id] && <p className="text-xs text-sumi-light mt-1">현장에 가서 장소의 QR을 찍거나 GPS로 인증하면 도장을 받고 숨은 친구를 만나요.</p>}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button className="btn-brick btn-sm" disabled={busy || !!state.visits[sel.id]} onClick={() => setQrOpen(true)}><Ico name="qr" size={18} />QR 인증</button>
              <button className="btn-sage btn-sm flex-wrap !gap-1" disabled={busy || !!state.visits[sel.id]} onClick={() => gpsVerify(sel)}>
                <Ico name="compass" size={18} />GPS 인증{!sel.gps && <span className="text-[10px] basis-full text-center">(좌표 등록 전)</span>}
              </button>
            </div>
            {geoMsg && <p className="text-sm text-wood-dark mt-2">{geoMsg}</p>}
            <Link href={`/postcard?loc=${sel.id}`} className="btn-gold btn-sm w-full mt-2"><Ico name="camera" size={20} />이 장소에서 캐릭터 엽서 찍기</Link>
            {demoTools && (
              <div className="mt-2 flex items-center gap-2">
                <button className="btn-cream btn-sm flex-1" disabled={!!state.visits[sel.id]}
                  onClick={async () => { if ((await visit(sel.id, "demo")).ok) sfx.success(); }}>현장 도착 시뮬레이션</button>
                <DemoBadge>시연용</DemoBadge>
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* ── 실제 지도 시트 ── */}
      <Sheet open={realOpen} onClose={() => setRealOpen(false)} label="실제 지도">
        <div className="px-4 pb-5">
          <h2 className="font-story text-2xl text-sumi">실제 강경 지도</h2>
          <div className="mt-2 border-2 border-sumi overflow-hidden"><RealMap me={me} /></div>
          <button className="btn-sage btn-sm w-full mt-2" onClick={locate}><Ico name="compass" size={20} />내 위치 확인</button>
          {geoMsg && <p className="text-sm text-wood-dark mt-2">{geoMsg}</p>}
          <Link href="/calibrate" className="btn-soft btn-sm w-full mt-2">현장 위치 보정 (운영자용)</Link>
          <p className="text-xs text-wood mt-2">※ 붉은 점선 원은 강경읍 일대의 근사 위치예요. 장소별 공식 좌표가 등록되기 전에는 QR로 인증하세요.</p>
          <p className="text-sm text-wood-dark mt-3">{DISTRICT_INFO.address} · {DISTRICT_INFO.parking}<br />관광안내: {DISTRICT_INFO.guideReservation}</p>
        </div>
      </Sheet>

      {/* ── 이야기 목록 시트 ── */}
      <Sheet open={chapterOpen} onClose={() => setChapterOpen(false)} label="이야기">
        <div className="px-4 pb-5">
          <h2 className="font-story text-2xl text-sumi">멈춘 시간의 포구</h2>
          <p className="text-sm text-sumi-light">시간의 종을 고치고, 흩어진 고양이 가족을 다시 만나게 해 주세요.</p>
          <ol className="mt-3 space-y-2">
            {CHAPTERS.map((c) => {
              const p = chapterProgress(c, state);
              const isCur = cur?.id === c.id;
              return (
                <li key={c.id} className={`p-3 border-[1.5px] ${isCur ? "border-vermilion bg-hanji-light" : "border-sumi/20 bg-hanji/60"} ${!p.claimed && !isCur ? "opacity-60" : ""}`} style={{ borderRadius: 6 }}>
                  <div className="flex items-center gap-2">
                    <span className={`seal w-10 h-10 text-[11px] shrink-0 ${p.claimed ? "" : "!bg-transparent !text-vermilion !shadow-none border border-vermilion"}`}>{p.claimed ? "완" : c.no}</span>
                    <div className="flex-1 min-w-0"><p className="font-story text-lg text-sumi leading-tight">{c.title}</p><p className="text-xs text-sumi-light">{c.sub}</p></div>
                    {(p.claimed || isCur) && <button className="btn-cream btn-sm !px-2 !py-1 text-sm" onClick={() => { setChapterOpen(false); setStory({ ch: c, part: p.claimed ? "outro" : "intro" }); }}>다시 보기</button>}
                  </div>
                  {isCur && (
                    <ul className="mt-2 space-y-1">
                      {c.objectives.map((o) => {
                        const d = o.done(state);
                        return <li key={o.label}><Link href={o.href} onClick={() => setChapterOpen(false)} className="flex items-start gap-2 text-sm"><span className={`mt-0.5 w-4 h-4 shrink-0 grid place-items-center border ${d ? "bg-jade border-jade text-hanji-light" : "border-sumi/50"}`}>{d && "✓"}</span><span className={d ? "line-through text-sumi-light" : "font-game font-bold text-sumi"}>{o.label}<span className="block text-xs font-normal text-sumi-light no-underline">{o.hint}</span></span></Link></li>;
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </Sheet>

      <CatchGame info={catching?.info ?? null} onCatch={catchSpark} onClose={() => setCatching(null)} />
      <StoryPlayer chapter={story?.ch ?? null} part={story?.part ?? "intro"} onDone={finishStory} />
      <QrScanner open={qrOpen} onClose={() => setQrOpen(false)} onResult={handleQr} />
      <NpcDialog npcId={npcId} onClose={() => setNpcId(null)} />
    </main>
  );
}
