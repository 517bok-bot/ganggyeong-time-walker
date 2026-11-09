"use client";
// 빈티지 기념 엽서 만들기
// - 합성은 브라우저에서 합니다. 사용자 사진은 '동의' 체크 후에만 합성되고, 서버 저장을 누를 때만 업로드됩니다.
// - 로그인 시: 서버(Storage + postcards 테이블)에 저장, 공개 여부 선택, 삭제 가능
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGame } from "@/lib/game";
import { useContent } from "@/lib/content";
import { locLabel } from "@/lib/data/locations";
import { Building } from "@/components/Building";
import { CharacterSvg } from "@/components/Characters";
import { LOCATION_ART, LocationGlyph } from "@/components/art/LocationArt";
import { Modal } from "@/components/ui";
import { PageHeader, DemoBadge } from "@/components/ui";
import { sfx } from "@/lib/sfx";
import { Ico } from "@/components/art/Icons";

const W = 600, H = 400;
// 목판 여행 기념 판화 엽서 틀
const TEMPLATES = {
  moon: { name: "달밤 판화", frame: "#263D40", paper: "#F2E7D0", ink: "#39332F", accent: "#B58B48", sky: "#263D40" },
  seal: { name: "주홍 인장", frame: "#963F38", paper: "#F2E7D0", ink: "#39332F", accent: "#963F38", sky: "#3B5659" },
  dream: { name: "보랏빛 꿈", frame: "#65516F", paper: "#F2E7D0", ink: "#39332F", accent: "#B58B48", sky: "#4A3A52" },
} as const;
type TemplateId = keyof typeof TEMPLATES;
interface TextItem { x: number; y: number; size: number; family: string; color: string; text: string; anchor?: "start" | "middle" | "end"; weight?: number }

async function toDataUrl(url: string): Promise<string | null> {
  try { const b = await (await fetch(url)).blob(); return await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result as string); fr.readAsDataURL(b); }); }
  catch { return null; }
}
/** 사진을 최대 800px로 줄이고 다시 인코딩 (EXIF 위치정보 등 메타데이터 제거) */
async function shrinkPhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = new Image(); img.src = url; await img.decode();
  const k = Math.min(1, 800 / Math.max(img.width, img.height));
  const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL("image/jpeg", 0.85);
}

interface Saved { id: string; url: string; location_id: string; is_public: boolean; created_at: string; message: string | null }

export default function PostcardPage() {
  const { state, act, mode, toast } = useGame();
  const { locations, LOC, CHAR } = useContent();
  const visited = locations.filter((l) => state.visits[l.id]);
  const [locId, setLocId] = useState("");
  const [charId, setCharId] = useState("");
  const [tpl, setTpl] = useState<TemplateId>("moon");
  const [reveal, setReveal] = useState<string | null>(null);
  const [bg, setBg] = useState<"illust" | "photo">("illust");
  const [bgData, setBgData] = useState<string | null>(null);
  const [msg, setMsg] = useState("시간을 걷는 곳, 강경에서!");
  const [consent, setConsent] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<Saved[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("loc");
    if (q && state.visits[q]) setLocId(q);
    else if (!locId && visited[0]) setLocId(visited[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.visits]);
  useEffect(() => { const first = Object.keys(state.characters)[0]; if (!charId && first) setCharId(first); }, [state.characters, charId]);

  const loc = locId ? LOC[locId] : null;
  useEffect(() => {
    setBgData(null);
    if (bg === "photo" && loc?.photoUrl) toDataUrl(loc.photoUrl).then(setBgData);
  }, [bg, loc?.photoUrl]);

  const loadSaved = () => { if (mode === "remote") fetch("/api/postcards", { cache: "no-store" }).then((r) => r.json()).then((j) => setSaved(j.postcards ?? [])).catch(() => {}); };
  useEffect(loadSaved, [mode]);

  const t = TEMPLATES[tpl];
  const date = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  // 장소 이름은 세로로 한 글자씩 (캔버스에서도 같은 좌표로 다시 그림)
  const vName = loc ? [...loc.name.replace(/\s/g, "")].slice(0, 7) : [];
  const texts: TextItem[] = useMemo(() => loc ? [
    ...vName.map((ch, i) => ({ x: 548, y: 132 + i * 30, size: 26, family: "Song Myung", color: t.ink, text: ch, anchor: "middle" as const })),
    { x: 412, y: 120, size: 10, family: "Nanum Myeongjo", weight: 800, color: t.accent, text: "강경 타임워커 · 여행 기념" },
    { x: 412, y: 140, size: 11, family: "Nanum Myeongjo", weight: 700, color: t.ink, text: loc.note ? `(${loc.note})` : loc.zone === "street" ? "강경근대거리" : "강경구락부" },
    { x: 412, y: 196, size: 17, family: "Nanum Pen Script", color: t.ink, text: msg.slice(0, 12) },
    { x: 412, y: 222, size: 17, family: "Nanum Pen Script", color: t.ink, text: msg.slice(12, 24) },
    { x: 412, y: 248, size: 17, family: "Nanum Pen Script", color: t.ink, text: msg.slice(24, 36) },
    { x: 412, y: 274, size: 17, family: "Nanum Pen Script", color: t.ink, text: msg.slice(36, 40) },
    { x: 412, y: 330, size: 11, family: "Nanum Myeongjo", weight: 700, color: t.ink, text: date },
    { x: 412, y: 350, size: 15, family: "Nanum Pen Script", color: t.ink, text: `${state.player.name} 씀` },
    { x: 470, y: 70, size: 8, family: "Nanum Myeongjo", weight: 800, color: "#963F38", text: "강경", anchor: "middle" as const },
  ] : [], [loc, msg, date, state.player.name, t, vName.join("")]);


  const exportPng = async (): Promise<Blob | null> => {
    const svg = svgRef.current; if (!svg) return null;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll("[data-text]").forEach((n) => n.remove());
    // 전역 텍스처·필터 정의를 함께 넣어 독립 이미지에서도 판화 질감이 유지되게
    const defs = document.getElementById("art-defs")?.querySelector("defs");
    if (defs) clone.insertBefore(defs.cloneNode(true), clone.firstChild);
    clone.setAttribute("width", String(W)); clone.setAttribute("height", String(H));
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const src = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement("canvas"); c.width = W * 2; c.height = H * 2;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(src);
    ctx.scale(2, 2);
    for (const tx of texts) {
      const font = `${tx.weight ?? 400} ${tx.size}px '${tx.family}', sans-serif`;
      try { await document.fonts.load(font, tx.text); } catch { /* 기본 글꼴 */ }
      ctx.font = font; ctx.fillStyle = tx.color; ctx.textAlign = (tx.anchor === "middle" ? "center" : tx.anchor ?? "start") as CanvasTextAlign;
      ctx.fillText(tx.text, tx.x, tx.y);
    }
    return await new Promise((r) => c.toBlob(r, "image/png"));
  };

  const reward = async () => { if (loc) await act({ type: "postcard", locationId: loc.id }, { quiet: true }); };

  const download = async () => {
    setBusy(true); const b = await exportPng(); setBusy(false);
    if (!b) return;
    const url = URL.createObjectURL(b);
    const a = document.createElement("a"); a.href = url; a.download = `강경타임워커_${loc?.name ?? "엽서"}.png`; a.click();
    sfx.stamp(); setReveal(url); reward();
  };
  const share = async () => {
    const b = await exportPng(); if (!b) return;
    const file = new File([b], "ganggyeong-postcard.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "강경 타임워커 엽서", text: "시간을 걷는 곳, 강경으로!" }); reward(); } catch { /* 취소 */ }
    } else toast("이 브라우저는 파일 공유를 지원하지 않아요. 이미지 저장 후 SNS에 올려 주세요.", "ℹ️");
  };
  const saveServer = async () => {
    if (!loc) return;
    setBusy(true);
    const b = await exportPng();
    if (!b) { setBusy(false); return; }
    const fd = new FormData();
    fd.set("image", b, "postcard.png"); fd.set("location_id", loc.id); fd.set("template", tpl); fd.set("message", msg.slice(0, 40));
    fd.set("uses_user_photo", String(!!userPhoto)); fd.set("photo_consent", String(consent)); fd.set("is_public", String(isPublic));
    const r = await fetch("/api/postcards", { method: "POST", body: fd }).then((x) => x.json()).catch(() => ({ ok: false, error: "서버 연결 실패" }));
    setBusy(false);
    if (!r.ok) { sfx.error(); toast(r.error ?? "저장 실패", "⚠️"); return; }
    sfx.stamp(); setReveal(URL.createObjectURL(b)); toast("엽서를 내 엽서함에 저장했어요", "💌"); reward(); loadSaved();
  };
  const removeSaved = async (id: string) => {
    if (!confirm("이 엽서를 삭제할까요? 이미지 파일도 함께 지워져요.")) return;
    await fetch(`/api/postcards?id=${id}`, { method: "DELETE" }); loadSaved();
  };
  const togglePublic = async (p: Saved) => {
    await fetch(`/api/postcards?id=${p.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ is_public: !p.is_public }) }); loadSaved();
  };

  if (!visited.length) {
    return (
      <main className="px-3">
        <PageHeader title="여행 기념 판화" seal="엽서" sub="방문한 장소를 목판 엽서 한 장에 담아요" />
        <div className="paper p-6 text-center">
          <Ico name="postcard" size={64} className="mx-auto" />
          <p className="font-game text-lg text-wood-dark mt-2">아직 방문 인증한 장소가 없어요</p>
          <p className="text-wood text-sm">강경근대거리에서 GPS 또는 QR로 방문을 인증하면 그 장소의 엽서를 만들 수 있어요.</p>
          <Link href="/explore" className="btn-sage mt-4"><Ico name="pin" size={20} />탐험하러 가기</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-3">
      <PageHeader title="여행 기념 판화" seal="엽서" sub="방문한 장소를 목판 엽서 한 장에 담아요" />
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-3">
        <section className="paper p-3">
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto shadow-card" role="img" aria-label="엽서 미리보기" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="pc-photo"><rect x={26} y={26} width={360} height={348} /></clipPath>
              <clipPath id="pc-user"><circle cx={48} cy={48} r={46} /></clipPath>
              <linearGradient id="pc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={t.sky} /><stop offset=".7" stopColor="#5E6F68" /><stop offset="1" stopColor="#C9B994" /></linearGradient>
            </defs>
            {/* 판화 바탕 */}
            <rect width={W} height={H} fill={t.paper} />
            <rect width={W} height={H} fill="url(#pt-grain)" />
            <rect x={8} y={8} width={W - 16} height={H - 16} fill="none" stroke={t.frame} strokeWidth={5} />
            <rect x={16} y={16} width={W - 32} height={H - 32} fill="none" stroke={t.accent} strokeWidth={1.2} />
            {/* 그림 칸 */}
            <g clipPath="url(#pc-photo)">
              {bg === "photo" && bgData ? (
                <image href={bgData} x={26} y={26} width={360} height={348} preserveAspectRatio="xMidYMid slice" />
              ) : (
                <g>
                  <rect x={26} y={26} width={360} height={348} fill="url(#pc-sky)" />
                  <rect x={26} y={26} width={360} height={348} fill="url(#pt-hatch)" opacity={0.3} />
                  <circle cx={312} cy={88} r={34} fill="#EFE2C2" />
                  <circle cx={312} cy={88} r={58} fill="#EFE2C2" opacity={0.14} />
                  <path d="M26 230 Q100 190 180 222 Q260 186 386 216 V374 H26Z" fill="#65516F" opacity={0.5} />
                  {loc && (() => { const a = LOCATION_ART[loc.id] ?? { style: "shop" as const, w: 140, h: 120 }; const k = 250 / Math.max(a.w, a.h * 1.2);
                    return <g transform={`translate(${206 - (a.w * k) / 2} ${318 - a.h * k}) scale(${k})`}><Building w={a.w} h={a.h} style={a.style} wall={a.wall} roof={a.roof} /></g>; })()}
                  <rect x={26} y={316} width={360} height={58} fill="#C4AC80" />
                  <path d="M26 317 H386" stroke="#39332F" strokeWidth={2} />
                  <ellipse cx={206} cy={330} rx={220} ry={16} fill="#E8D8B8" opacity={0.5} filter="url(#soft-fog)" />
                  {[[60, 60], [110, 140], [250, 50], [350, 180]].map(([px, py], i) => <path key={i} d={`M${px} ${py} q5 6 0 14 q-5 -8 0 -14Z`} fill="#D9A79B" opacity={0.85} transform={`rotate(${i * 40} ${px} ${py})`} />)}
                </g>
              )}
              {charId && <CharacterSvg id={charId} mood="wave" box={{ x: 36, y: 238, width: 110, height: 121 }} />}
              {userPhoto && consent && (
                <g transform="translate(268 240)">
                  <circle cx={48} cy={48} r={52} fill="#F2E7D0" stroke="#39332F" strokeWidth={2} />
                  <g clipPath="url(#pc-user)"><image href={userPhoto} x={0} y={0} width={96} height={96} preserveAspectRatio="xMidYMid slice" /></g>
                  <circle cx={48} cy={48} r={46} fill="none" stroke={t.accent} strokeWidth={1.5} />
                </g>
              )}
            </g>
            <rect x={26} y={26} width={360} height={348} fill="none" stroke="#39332F" strokeWidth={2.4} />
            {/* 오른쪽: 세로 제목 칸 · 우표 · 소인 */}
            <rect x={530} y={104} width={36} height={Math.max(60, vName.length * 30 + 14)} fill="none" stroke={t.accent} strokeWidth={1} />
            <g transform="translate(436 30)">
              <rect x={0} y={0} width={64} height={78} fill="#F2E7D0" stroke="#39332F" strokeWidth={1} strokeDasharray="3 2" />
              <rect x={6} y={6} width={52} height={54} fill={t.frame} />
              <circle cx={46} cy={18} r={6} fill="#EFE2C2" />
              {loc && <g transform="translate(32 58)"><LocationGlyph id={loc.id} scale={0.3} /></g>}
            </g>
            <g transform="translate(410 74)" opacity={0.75}>
              <circle r={26} fill="none" stroke="#963F38" strokeWidth={1.8} />
              <circle r={20} fill="none" stroke="#963F38" strokeWidth={0.8} />
              <path d="M30 -8 q20 -6 40 0 q20 6 40 0 M30 4 q20 -6 40 0 q20 6 40 0" fill="none" stroke="#963F38" strokeWidth={1.2} />
            </g>
            {[202, 228, 254, 280].map((y) => <path key={y} d={`M410 ${y + 4} H520`} stroke={t.accent} strokeWidth={0.8} opacity={0.6} />)}
            <path d="M400 100 V370" stroke={t.accent} strokeWidth={1} opacity={0.6} />
            {/* 낙관 */}
            <g transform="translate(530 330)"><rect width={36} height={36} rx={3} fill="#963F38" filter="url(#seal-rough)" /><rect x={4} y={4} width={28} height={28} fill="none" stroke="#F2E7D0" strokeWidth={1} /></g>
            {texts.map((tx, i) => (
              <text key={i} data-text="1" x={tx.x} y={tx.y} fontSize={tx.size} fontFamily={`'${tx.family}', serif`} fontWeight={tx.weight ?? 400} fill={tx.color} textAnchor={tx.anchor ?? "start"}>{tx.text}</text>
            ))}
            <text data-text="1" x={548} y={354} textAnchor="middle" fontSize={11} fontFamily="'Song Myung', serif" fill="#F2E7D0">강경</text>
          </svg>
          <div className="flex flex-wrap gap-2 mt-3">
            <button className="btn-brick btn-sm" disabled={busy} onClick={download}><Ico name="brush" size={20} />이미지 저장</button>
            <button className="btn-sage btn-sm" disabled={busy} onClick={share}><Ico name="letter" size={20} />공유하기</button>
            {mode === "remote"
              ? <button className="btn-gold btn-sm" disabled={busy} onClick={saveServer}><Ico name="album" size={20} />내 엽서함에 저장</button>
              : <Link href="/login" className="btn-cream btn-sm"><Ico name="key" size={20} />로그인하면 엽서함에 저장돼요</Link>}
          </div>
          {mode === "remote" && (
            <label className="flex items-center gap-2 mt-2 text-sm text-wood-dark">
              <input type="checkbox" className="w-4 h-4 accent-sage" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> 다른 여행자에게 공개 (기본: 비공개)
            </label>
          )}
        </section>

        <section className="paper p-4 space-y-3 text-sm">
          <label className="block"><span className="font-game text-wood-dark">장소 (방문 인증한 곳)</span>
            <select value={locId} onChange={(e) => setLocId(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-wood bg-cream px-3 py-2 font-game">
              {visited.map((l) => <option key={l.id} value={l.id}>{l.no}. {locLabel(l)}</option>)}
            </select>
          </label>
          <div><span className="font-game text-wood-dark">배경</span>
            <div className="flex gap-2 mt-1">
              <button className={`btn btn-sm flex-1 ${bg === "illust" ? "bg-sage text-cream" : "bg-cream-light text-wood-dark"}`} onClick={() => setBg("illust")}>일러스트</button>
              <button className={`btn btn-sm flex-1 ${bg === "photo" ? "bg-sage text-cream" : "bg-cream-light text-wood-dark"}`} disabled={!loc?.photoUrl} onClick={() => setBg("photo")}>관광지 사진{!loc?.photoUrl && " (준비 중)"}</button>
            </div>
          </div>
          <div><span className="font-game text-wood-dark">함께할 캐릭터</span>
            <div className="flex flex-wrap gap-1 mt-1">
              <button className={`chip !text-sm ${!charId ? "bg-brick text-cream" : "bg-cream-dark text-wood-dark"}`} onClick={() => setCharId("")}>없음</button>
              {Object.keys(state.characters).map((id) => (
                <button key={id} className={`chip !text-sm ${charId === id ? "bg-brick text-cream" : "bg-cream-dark text-wood-dark"}`} onClick={() => setCharId(id)}>{CHAR[id]?.name}</button>
              ))}
            </div>
            {!Object.keys(state.characters).length && <p className="text-xs text-wood mt-1">캐릭터를 만나면 엽서에 넣을 수 있어요.</p>}
          </div>
          <div><span className="font-game text-wood-dark">판화 틀</span>
            <div className="flex gap-2 mt-1">
              {(Object.keys(TEMPLATES) as TemplateId[]).map((k) => (
                <button key={k} onClick={() => setTpl(k)} className={`chip !text-sm !py-1 border-2 ${tpl === k ? "!border-antique-light outline outline-2 outline-sumi" : "border-transparent"}`} style={{ background: TEMPLATES[k].frame, color: "#F2E7D0" }}>{TEMPLATES[k].name}</button>
              ))}
            </div>
          </div>
          <label className="block"><span className="font-game text-wood-dark">여행 문구 ({msg.length}/40)</span>
            <input value={msg} maxLength={40} onChange={(e) => setMsg(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-wood bg-cream px-3 py-2" />
          </label>
          <div className="rounded-xl bg-cream border-2 border-dashed border-wood/40 p-3">
            <span className="font-game text-wood-dark">내 사진 추가 (선택)</span>
            <label className="flex items-start gap-2 mt-1 text-xs text-wood-dark">
              <input type="checkbox" className="mt-0.5 w-4 h-4 accent-brick" checked={consent} onChange={(e) => { setConsent(e.target.checked); if (!e.target.checked) setUserPhoto(null); }} />
              <span>사진 사용에 동의합니다. 원본 사진 파일은 바꾸지 않고, 엽서용 사본만 이 기기에서 만들어 위치정보(EXIF)를 지워요. ‘엽서함에 저장’을 누를 때만 서버에 올라가고, 언제든 삭제할 수 있어요.</span>
            </label>
            <input type="file" accept="image/*" disabled={!consent} className="mt-2 text-xs w-full"
              onChange={async (e) => { const f = e.target.files?.[0]; if (f) setUserPhoto(await shrinkPhoto(f)); }} />
            {userPhoto && <button className="text-xs underline text-wood mt-1" onClick={() => setUserPhoto(null)}>사진 빼기</button>}
          </div>
          <p className="text-xs text-wood">장소마다 첫 엽서를 만들면 +20EXP · 엽서 도감에 기록돼요.</p>
        </section>
      </div>

      <section className="paper p-4 mt-3">
        <div className="flex items-center gap-2"><h2 className="title-ribbon !bg-wood">내 엽서함</h2>{mode !== "remote" && <DemoBadge>로그인 필요</DemoBadge>}</div>
        {mode !== "remote" ? <p className="text-sm text-wood mt-3">로컬 모드에서는 엽서를 이미지로 저장하거나 공유할 수 있어요. 로그인하면 엽서함에 보관돼요.</p>
          : saved.length === 0 ? <p className="text-sm text-wood mt-3">저장한 엽서가 없어요.</p> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {saved.map((p) => (
                <div key={p.id} className="rounded-xl bg-cream border-2 border-wood/30 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="저장한 엽서" className="w-full rounded" />
                  <p className="text-xs font-game mt-1">{LOC[p.location_id]?.name} · {new Date(p.created_at).toLocaleDateString("ko-KR")}</p>
                  <div className="flex gap-1 mt-1">
                    <button className="chip bg-cream-dark text-wood-dark" onClick={() => togglePublic(p)}>{p.is_public ? "공개" : "비공개"}</button>
                    <button className="chip bg-brick text-cream" onClick={() => removeSaved(p.id)}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>
      <Modal open={!!reveal} onClose={() => setReveal(null)} label="완성된 엽서">
        {reveal && (
          <div className="p-4 text-center">
            <p className="font-story text-2xl text-sumi">판화 한 장이 찍혀 나왔어요</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={reveal} alt="완성된 여행 기념 엽서" className="w-full mt-3 border border-sumi shadow-card anim-unfold" />
            <button className="btn-sage w-full mt-4" onClick={() => setReveal(null)}>고이 간직하기</button>
          </div>
        )}
      </Modal>
    </main>
  );
}
