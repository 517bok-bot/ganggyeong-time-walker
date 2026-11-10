"use client";
// 캐릭터 엽서: 휴대폰 카메라로 실제 장소를 비추면, 오늘 만난 캐릭터가 옆에 서요.
// 찍은 사진은 10×15cm 엽서(1200×1800) 이미지로 만들어 저장·공유하고, 강경모던상회에서 인쇄할 수 있어요.
// 사진은 이 휴대폰 안에서만 만들어지고 서버로 올라가지 않아요.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGame } from "@/lib/game";
import { useContent } from "@/lib/content";
import { charImg } from "@/components/Characters";
import { Ico } from "@/components/art/Icons";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/fx";

const PW = 1200, PH = 1800; // 10×15cm @ 약 300dpi
const FREE_PRINT_STAMPS = 5;
type Sticker = { key: string; src: string[]; x: number; y: number; s: number; flip: boolean };

const playerLayers = (avatar: string, eq: Record<string, string | undefined>) => {
  const base = eq.outfit ? eq.outfit : `base-${avatar || "sage"}`;
  return [base, eq.neck, eq.face, eq.hat, eq.prop].filter(Boolean).map((l) => `/player/${l}.webp`);
};
const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

export default function Postcard() {
  const { state, act, ready } = useGame();
  const { locations, LOC, CHAR } = useContent();
  const [locId, setLocId] = useState<string>("");
  const [msg, setMsg] = useState("강경에서 보낸 하루");
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [cam, setCam] = useState<"off" | "on" | "denied">("off");
  const [photo, setPhoto] = useState<string | null>(null); // 찍은(또는 고른) 사진
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const fileIn = useRef<HTMLInputElement>(null);

  const met = Object.keys(state.characters).filter((id) => CHAR[id]);
  const stamps = Object.keys(state.visits).length;
  const loc = locId ? LOC[locId] : null;

  const inited = useRef(false);
  useEffect(() => {
    if (!ready || inited.current) return; inited.current = true;
    const q = new URLSearchParams(window.location.search).get("loc");
    const visited = Object.keys(state.visits);
    setLocId(q && LOC[q] ? q : visited[visited.length - 1] ?? locations[0]?.id ?? "");
    // 처음엔 '나'와 가장 최근에 만난 친구 하나
    const first: Sticker[] = [{ key: "me", src: playerLayers(state.player.avatar, state.equipped as Record<string, string | undefined>), x: 0.3, y: 0.78, s: 0.32, flip: false }];
    const last = met[met.length - 1];
    if (last) first.push({ key: last, src: [charImg(last, "wave")], x: 0.7, y: 0.8, s: 0.28, flip: true });
    setStickers(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const startCam = useCallback(async () => {
    try {
      const st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false });
      stream.current = st;
      if (video.current) { video.current.srcObject = st; await video.current.play().catch(() => {}); }
      setCam("on"); setPhoto(null);
    } catch { setCam("denied"); }
  }, []);
  useEffect(() => () => { stream.current?.getTracks().forEach((t) => t.stop()); }, []);

  // 손가락으로 캐릭터 옮기기
  const drag = useRef<{ key: string; dx: number; dy: number } | null>(null);
  const onDown = (e: React.PointerEvent, st: Sticker) => {
    e.stopPropagation(); (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const r = stage.current!.getBoundingClientRect();
    drag.current = { key: st.key, dx: (e.clientX - r.left) / r.width - st.x, dy: (e.clientY - r.top) / r.height - st.y };
    setActive(st.key);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return; const r = stage.current!.getBoundingClientRect(); const d = drag.current;
    const x = Math.min(0.95, Math.max(0.05, (e.clientX - r.left) / r.width - d.dx)), y = Math.min(1, Math.max(0.15, (e.clientY - r.top) / r.height - d.dy));
    setStickers((ss) => ss.map((s) => (s.key === d.key ? { ...s, x, y } : s)));
  };
  const onUp = () => { drag.current = null; };
  const update = (key: string, f: (s: Sticker) => Sticker) => setStickers((ss) => ss.map((s) => (s.key === key ? f(s) : s)));
  const toggleFriend = (id: string) => {
    sfx.tap();
    setStickers((ss) => ss.some((s) => s.key === id) ? ss.filter((s) => s.key !== id)
      : ss.length >= 4 ? ss : [...ss, { key: id, src: [charImg(id, "wave")], x: 0.5, y: 0.8, s: 0.26, flip: false }]);
    setActive(id);
  };

  const shoot = () => {
    const v = video.current; if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0); setPhoto(c.toDataURL("image/jpeg", 0.92));
    stream.current?.getTracks().forEach((t) => t.stop()); setCam("off");
    sfx.shutter(); haptic(30);
  };
  const pickFile = (f?: File) => { if (!f) return; const r = new FileReader(); r.onload = () => { setPhoto(r.result as string); stream.current?.getTracks().forEach((t) => t.stop()); setCam("off"); }; r.readAsDataURL(f); };

  // 엽서 이미지 만들기
  const make = async () => {
    if (!photo || !loc) return;
    setBusy(true);
    try {
      const c = document.createElement("canvas"); c.width = PW; c.height = PH; const g = c.getContext("2d")!;
      g.fillStyle = "#FBF6EA"; g.fillRect(0, 0, PW, PH);
      const M = 48, IH = PH - 360; // 사진 영역
      const img = await loadImg(photo);
      const sc = Math.max((PW - M * 2) / img.width, IH / img.height);
      const w = img.width * sc, h = img.height * sc;
      g.save(); g.beginPath(); g.roundRect(M, M, PW - M * 2, IH, 28); g.clip();
      g.drawImage(img, M + (PW - M * 2 - w) / 2, M + (IH - h) / 2, w, h);
      // 캐릭터
      for (const st of [...stickers].sort((a, b) => a.y - b.y)) {
        const layers = await Promise.all(st.src.map(loadImg));
        const ch = st.s * IH * 1.15, cw = ch * (layers[0].width / layers[0].height);
        const cx = M + st.x * (PW - M * 2), by = M + st.y * IH;
        g.save(); g.translate(cx, by); if (st.flip) g.scale(-1, 1);
        g.globalAlpha = 0.25; g.fillStyle = "#000"; g.beginPath(); g.ellipse(0, -ch * 0.03, cw * 0.32, ch * 0.04, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
        for (const L of layers) g.drawImage(L, -cw / 2, -ch, cw, ch);
        g.restore();
      }
      g.restore();
      // 아래 띠: 장소·날짜·문구·도장
      const y0 = M + IH + 40;
      g.fillStyle = "#963F38"; g.font = "700 30px 'Gowun Dodum', sans-serif"; g.fillText("강경 타임워커 · 江景近代거리", M + 8, y0 + 10);
      g.fillStyle = "#2B2220"; g.font = "700 64px 'Song Myung', serif"; g.fillText(loc.name, M + 8, y0 + 90);
      g.fillStyle = "#5A4A42"; g.font = "500 38px 'Nanum Pen Script', 'Gowun Dodum', cursive"; g.fillText(msg.slice(0, 24), M + 8, y0 + 160);
      g.fillStyle = "#8A7A6A"; g.font = "500 26px 'Gowun Dodum', sans-serif";
      g.fillText(`${new Date().toLocaleDateString("ko-KR")} · ${state.player.name}`, M + 8, y0 + 215);
      // 방문 도장
      const sx = PW - M - 120, sy = y0 + 95;
      g.save(); g.translate(sx, sy); g.rotate(-0.15);
      g.strokeStyle = state.visits[loc.id] ? "#B23A30" : "#B9A890"; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, 92, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, 78, 0, Math.PI * 2); g.stroke();
      g.fillStyle = g.strokeStyle; g.textAlign = "center"; g.font = "700 30px 'Song Myung', serif"; g.fillText(state.visits[loc.id] ? "방문 인증" : "강경", 0, -6);
      g.font = "700 22px 'Gowun Dodum', sans-serif"; g.fillText(loc.name.slice(0, 6), 0, 30); g.restore();
      setResult(c.toDataURL("image/jpeg", 0.93));
      if (state.visits[loc.id]) act({ type: "postcard", locationId: loc.id });
      sfx.stamp(); haptic([20, 40, 20]);
    } finally { setBusy(false); }
  };

  const save = async () => {
    if (!result) return;
    const blob = await (await fetch(result)).blob();
    const file = new File([blob], `강경엽서-${loc?.name ?? "강경"}.jpg`, { type: "image/jpeg" });
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    if (nav.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: "강경 타임워커 엽서" }); return; } catch { /* 취소 */ } }
    const a = document.createElement("a"); a.href = result; a.download = file.name; a.click();
  };

  return (
    <main className="px-4 pt-[max(16px,env(safe-area-inset-top))]">
      <h1 className="font-story text-[28px] text-sumi pr-12">캐릭터 엽서</h1>
      <p className="text-sm text-sumi-light">카메라로 장소를 비추고, 오늘 만난 친구를 옆에 세워 찍어요.</p>

      <label className="block mt-3 text-sm font-game font-bold text-sumi">어디에서 찍나요?
        <select value={locId} onChange={(e) => setLocId(e.target.value)} className="mt-1 w-full rounded-xl bg-white/80 px-3 py-2 shadow-card">
          {locations.map((l) => <option key={l.id} value={l.id}>{state.visits[l.id] ? "✓ " : ""}{l.name}{l.note ? ` (${l.note})` : ""}</option>)}
        </select>
      </label>

      {!result && (
        <>
          {/* 촬영 화면 (2:3) */}
          <div ref={stage} className="relative mt-3 w-full aspect-[2/3] max-h-[62vh] mx-auto rounded-3xl overflow-hidden bg-sumi touch-none select-none shadow-card"
            onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerDown={() => setActive(null)}>
            <video ref={video} playsInline muted className={`absolute inset-0 w-full h-full object-cover ${cam === "on" ? "" : "hidden"}`} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {photo && <img src={photo} alt="찍은 사진" className="absolute inset-0 w-full h-full object-cover" />}
            {cam !== "on" && !photo && (
              <div className="absolute inset-0 grid place-items-center text-center p-6 text-hanji-light">
                <div>
                  <Ico name="camera" size={48} className="mx-auto" />
                  <p className="mt-2 font-game font-bold">{cam === "denied" ? "카메라를 쓸 수 없어요. 사진을 골라 주세요" : "카메라를 켜서 장소를 비춰 주세요"}</p>
                </div>
              </div>
            )}
            {stickers.map((st) => (
              <div key={st.key} className={`absolute ${active === st.key ? "ring-2 ring-white/80 rounded-2xl" : ""}`} onPointerDown={(e) => onDown(e, st)}
                style={{ left: `${st.x * 100}%`, top: `${st.y * 100}%`, height: `${st.s * 115}%`, aspectRatio: "10 / 11", transform: `translate(-50%, -100%) scaleX(${st.flip ? -1 : 1})`, touchAction: "none" }}>
                {st.src.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="" draggable={false} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                ))}
              </div>
            ))}
            {/* 아래 띠 미리보기 */}
            <div className="absolute inset-x-0 bottom-0 px-4 py-2 bg-gradient-to-t from-black/60 to-transparent text-white pointer-events-none">
              <p className="font-story text-xl leading-none">{loc?.name}</p>
            </div>
          </div>

          {/* 캐릭터 조절 */}
          {active && (
            <div className="card mt-2 p-3 flex items-center gap-3">
              <span className="text-sm font-game font-bold text-sumi shrink-0">{active === "me" ? "나" : CHAR[active]?.name.split(" · ")[0]}</span>
              <input type="range" min={0.12} max={0.6} step={0.01} value={stickers.find((s) => s.key === active)?.s ?? 0.3} onChange={(e) => update(active, (s) => ({ ...s, s: Number(e.target.value) }))} className="flex-1 accent-vermilion" aria-label="크기" />
              <button className="btn-soft btn-sm !px-3" onClick={() => update(active, (s) => ({ ...s, flip: !s.flip }))}>뒤집기</button>
            </div>
          )}

          {/* 친구 고르기 */}
          <div className="mt-3">
            <p className="text-sm font-game font-bold text-sumi">함께 찍을 친구 {met.length === 0 && <span className="font-normal text-sumi-light">· 장소 QR을 찍으면 친구를 만나요</span>}</p>
            <div className="flex gap-2 mt-1.5 overflow-x-auto no-scrollbar pb-1">
              <button onClick={() => { const has = stickers.some((s) => s.key === "me"); setStickers((ss) => has ? ss.filter((s) => s.key !== "me") : [...ss, { key: "me", src: playerLayers(state.player.avatar, state.equipped as Record<string, string | undefined>), x: 0.3, y: 0.8, s: 0.3, flip: false }]); }}
                className={`shrink-0 w-16 rounded-2xl p-1 text-center ${stickers.some((s) => s.key === "me") ? "bg-vermilion/15 ring-2 ring-vermilion" : "bg-white/70"}`}>
                <div className="relative w-14 h-14 mx-auto">{playerLayers(state.player.avatar, state.equipped as Record<string, string | undefined>).map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="" className="absolute inset-0 w-full h-full object-contain" />))}</div>
                <span className="text-[11px] font-game font-bold">나</span>
              </button>
              {met.map((id) => (
                <button key={id} onClick={() => toggleFriend(id)} className={`shrink-0 w-16 rounded-2xl p-1 text-center ${stickers.some((s) => s.key === id) ? "bg-vermilion/15 ring-2 ring-vermilion" : "bg-white/70"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={charImg(id, "happy")} alt="" className="w-14 h-14 mx-auto object-contain" />
                  <span className="text-[11px] font-game font-bold truncate block">{CHAR[id].name.split(" · ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="block mt-2 text-sm font-game font-bold text-sumi">한 줄 문구
            <input value={msg} maxLength={24} onChange={(e) => setMsg(e.target.value)} className="mt-1 w-full rounded-xl bg-white/80 px-3 py-2 shadow-card" />
          </label>

          <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
            {cam === "on" ? <button className="btn-primary col-span-2" onClick={shoot}><Ico name="camera" size={22} />찰칵!</button>
              : photo ? <>
                  <button className="btn-soft" onClick={startCam}>다시 찍기</button>
                  <button className="btn-primary" disabled={busy} onClick={make}>{busy ? "만드는 중…" : "엽서 완성"}</button>
                </>
              : <>
                  <button className="btn-primary" onClick={startCam}><Ico name="camera" size={22} />카메라 켜기</button>
                  <button className="btn-soft" onClick={() => fileIn.current?.click()}>사진 고르기</button>
                </>}
          </div>
          <input ref={fileIn} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
        </>
      )}

      {result && (
        <div className="mt-3 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result} alt="완성된 엽서" className="w-full max-w-sm mx-auto rounded-xl shadow-card anim-card-up" />
          <div className="card p-4 mt-3 text-sm">
            {stamps >= FREE_PRINT_STAMPS ? (
              <>
                <p className="font-story text-xl text-vermilion">무료 인쇄 쿠폰</p>
                <p className="text-sumi mt-1">강경모던상회에서 이 화면을 보여 주고, 엽서 사진을 전송하면 실물 엽서로 인쇄해 드려요.</p>
                <p className="mt-2 inline-block px-3 py-1 rounded-full bg-vermilion text-white font-game font-bold">도장 {stamps}개 · {state.player.name} · {new Date().toLocaleDateString("ko-KR")}</p>
              </>
            ) : (
              <p className="text-sumi">도장을 <b>{FREE_PRINT_STAMPS - stamps}개</b> 더 모으면 강경모던상회에서 <b>실물 엽서로 무료 인쇄</b>할 수 있어요. (지금 {stamps}/{FREE_PRINT_STAMPS})</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button className="btn-soft" onClick={() => { setResult(null); }}>다시 꾸미기</button>
            <button className="btn-primary" onClick={save}>저장 · 공유</button>
          </div>
          <Link href="/explore" className="btn-soft w-full mt-2">지도로 돌아가기</Link>
        </div>
      )}
      <p className="text-[11px] text-sumi-light text-center mb-2">사진은 이 휴대폰 안에서만 만들어지고 서버로 올라가지 않아요.</p>
    </main>
  );
}
