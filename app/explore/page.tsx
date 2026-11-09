"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useGame } from "@/lib/game";
import { RECOMMENDED_ROUTE, DISTRICT_INFO, locLabel, type GameLocation } from "@/lib/data/locations";
import { useContent } from "@/lib/content";
import { NPC } from "@/lib/data/npcs";
import { ITEMS } from "@/lib/data/jeotgal";
import { PageHeader, Hud, DemoBadge, Modal } from "@/components/ui";
import { CharacterArt, NpcArt } from "@/components/Characters";
import OldMap from "@/components/art/OldMap";
import { LocationScene } from "@/components/art/LocationArt";
import { Ico } from "@/components/art/Icons";
import QrScanner, { verifyQrPayload } from "@/components/QrScanner";
import NpcDialog from "@/components/NpcDialog";
import { sfx } from "@/lib/sfx";

const RealMap = dynamic(() => import("@/components/RealMap"), { ssr: false, loading: () => <div className="h-[60vh] grid place-items-center font-game text-wood">지도를 불러오는 중…</div> });

type Me = { lat: number; lng: number; accuracy: number };

export default function Explore() {
  const { state, visit, toast, mode, demoTools } = useGame();
  const { locations: LOCATIONS, LOC, CHAR } = useContent();
  const [tab, setTab] = useState<"illust" | "real">("illust");
  const [sel, setSel] = useState<GameLocation | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [npcId, setNpcId] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [geoMsg, setGeoMsg] = useState("");
  const [show, setShow] = useState({ route: true, chars: true, npcs: true });
  const [busy, setBusy] = useState(false);

  const handleQr = useCallback(async (payload: string) => {
    setQrOpen(false); setBusy(true);
    const r = await verifyQrPayload(payload);
    setBusy(false);
    if (!r.ok || !r.locationId) { sfx.error(); toast(r.reason ?? "인증 실패", "⚠️"); return; }
    // 서버 모드에서는 QR 원문을 다시 보내 서버가 서명을 검증한 뒤 보상을 지급합니다
    const v = await visit(r.locationId, "qr", { qr: payload });
    if (v.ok) sfx.success();
    setSel(LOC[r.locationId]);
  }, [visit, toast, LOC]);

  // QR을 휴대폰 기본 카메라로 찍으면 /explore?qr=GTW1... 로 열립니다
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
    const v = await visit(loc.id, "gps", { gps: m }); // 서버 모드: 서버가 거리·정확도를 다시 검사
    setBusy(false);
    if (v.ok) sfx.success(); else sfx.error();
  };

  const visitedCount = Object.keys(state.visits).length;
  const routePts = RECOMMENDED_ROUTE.map((id) => `${LOC[id].mapX},${LOC[id].mapY}`).join(" ");

  return (
    <main className="px-3">
      <PageHeader title="강경 탐험" seal="탐험" sub="안내도의 배치를 옮긴 고지도 · 실제 인증은 공식 좌표와 QR로" right={<button className="btn-brick btn-sm" onClick={() => setQrOpen(true)}><Ico name="qr" size={22} />QR</button>} />
      <Hud />

      <div className="flex gap-2 mt-3">
        {([["illust", "그림 지도"], ["real", "실제 지도"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 ${tab === k ? "btn-sage" : "btn-cream"} btn-sm`}><Ico name={k === "illust" ? "map" : "compass"} size={20} />{l}</button>
        ))}
      </div>

      <div className="paper mt-3 p-2 sm:p-3">
        <div className="flex flex-wrap items-center gap-2 px-1 pb-2 text-sm">
          <span className="font-game text-wood-dark">방문 {visitedCount}/{LOCATIONS.length}</span>
          <div className="flex-1" />
          {tab === "illust" && ([["route", "추천 동선"], ["chars", "캐릭터"], ["npcs", "NPC"]] as const).map(([k, l]) => (
            <label key={k} className="chip bg-cream-dark text-wood-dark cursor-pointer">
              <input type="checkbox" className="accent-sage" checked={show[k]} onChange={(e) => setShow({ ...show, [k]: e.target.checked })} /> {l}
            </label>
          ))}
        </div>

        {tab === "illust" ? (
          <div className="overflow-auto no-scrollbar border-2 border-sumi bg-hanji">
            <OldMap locations={LOCATIONS} state={state} show={show} selId={sel?.id} routePts={routePts} onSelect={(l) => { sfx.page(); setSel(l); }} />
          </div>
        ) : (
          <div>
            <RealMap me={me} />
            <p className="text-xs text-wood mt-2">※ 붉은 점선 원은 강경읍 일대의 <b>근사 위치</b>입니다. 개별 장소의 공식 좌표가 확인되면 관리자가 등록하며, 그 전까지는 장소별 QR로 인증하세요.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          <button className="btn-sage btn-sm" onClick={locate}><Ico name="compass" size={20} />내 위치 확인</button>
          <button className="btn-brick btn-sm" onClick={() => setQrOpen(true)}><Ico name="qr" size={20} />QR 인증</button>
          <Link href="/village" className="btn-cream btn-sm"><Ico name="village" size={20} />집에서 탐험하기</Link>
        </div>
        {geoMsg && <p className="text-sm text-wood-dark mt-2">{geoMsg}</p>}
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-wood">
          <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 border-2 border-vermilion bg-hanji-light" />안개 낀 곳(미방문)</span>
          <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 bg-vermilion" />방문 인장</span>
          <span className="flex items-center gap-1"><Ico name="paw" size={16} />캐릭터 단서</span>
          <span className="flex items-center gap-1"><Ico name="lantern" size={16} />NPC</span>
          <span className="flex items-center gap-1"><Ico name="route" size={16} />추천 동선</span>
        </div>
      </div>

      <section className="paper p-4 mt-3 text-sm text-wood-dark">
        <h2 className="font-game text-lg">찾아오시는 길</h2>
        <p>{DISTRICT_INFO.address} · {DISTRICT_INFO.parking}</p>
        <p>관광안내: {DISTRICT_INFO.guideReservation}</p>
        <p className="text-xs text-wood mt-1">안내도 지번 표기: {DISTRICT_INFO.addressOnMap}</p>
      </section>

      {/* 장소 상세 */}
      <Modal open={!!sel} onClose={() => setSel(null)} label="장소 정보">
        {sel && (
          <div className="p-4">
            <div className="relative -mx-1 mb-3 anim-unfold">
              <LocationScene id={sel.id} name={sel.name} />
              {state.visits[sel.id] && <span className="absolute right-3 bottom-3 seal w-16 h-16 text-base rotate-[-10deg] anim-stamp">방문<br />인증</span>}
            </div>
            <div className="flex items-start gap-3">
              <div className="seal w-12 h-12 text-2xl shrink-0">{sel.no}</div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-1">
                  <span className="chip bg-sage text-cream">실제 장소 · 안내도 표기</span>
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
            {sel.historyStatus === "approved" && sel.history ? (
              <div className="mt-2 rounded-xl bg-cream border-2 border-wood/40 p-3 text-sm">
                <p className="font-game font-bold text-sumi">역사적 배경 <span className="chip bg-jade text-hanji-light">승인 자료</span></p>
                <p className="text-wood mt-1 whitespace-pre-line">{sel.history}</p>
              </div>
            ) : (!sel.photoUrl || !sel.description) && (
              <div className="mt-3 rounded-xl bg-cream border-2 border-dashed border-wood/40 p-3 text-sm">
                <p className="font-game font-bold text-sumi flex items-center gap-1"><Ico name="camera" size={18} />대표 사진 · <Ico name="scroll" size={18} />역사적 배경</p>
                <p className="text-wood">공식 자료 확인 후 등록 예정입니다. (검증되지 않은 역사 정보는 표시하지 않아요)</p>
              </div>
            )}
            {sel.gameRole && (
              <p className="mt-2 text-sm rounded-xl bg-gold/30 p-3"><span className="chip bg-wood text-cream mr-1">게임 설정</span>{sel.gameRole}</p>
            )}
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
              방문 보상: +{sel.reward.exp} EXP · +{sel.reward.coins} 코인
              {sel.reward.items && Object.entries(sel.reward.items).map(([k, v]) => ` · ${ITEMS[k].name}×${v}`)}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button className="btn-sage btn-sm flex-wrap !gap-1" disabled={busy || !!state.visits[sel.id]} onClick={() => gpsVerify(sel)}>
                <Ico name="compass" size={18} />GPS 인증{!sel.gps && <span className="text-[10px] basis-full text-center">(좌표 등록 전)</span>}
              </button>
              <button className="btn-brick btn-sm" disabled={busy || !!state.visits[sel.id]} onClick={() => setQrOpen(true)}><Ico name="qr" size={18} />QR 인증</button>
            </div>
            {demoTools && (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <button className="btn-cream btn-sm flex-1" disabled={!!state.visits[sel.id]}
                    onClick={async () => { if ((await visit(sel.id, "demo")).ok) sfx.success(); }}>
                    현장 도착 시뮬레이션
                  </button>
                  <DemoBadge>테스트용</DemoBadge>
                </div>
                <p className="text-[11px] text-wood mt-2">※ 시뮬레이션은 로컬 모드 또는 DEMO_TOOLS=true 일 때만 보여요. 운영 서버에서는 GPS·QR 서버 검증만 허용됩니다.</p>
              </>
            )}
            {state.visits[sel.id] && <Link href={`/postcard?loc=${sel.id}`} className="btn-gold btn-sm w-full mt-3"><Ico name="postcard" size={20} />이 장소로 기념 엽서 만들기</Link>}
          </div>
        )}
      </Modal>

      <QrScanner open={qrOpen} onClose={() => setQrOpen(false)} onResult={handleQr} />
      <NpcDialog npcId={npcId} onClose={() => setNpcId(null)} />
    </main>
  );
}
