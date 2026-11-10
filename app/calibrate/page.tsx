"use client";
// 현장 위치 보정: 장소 앞에 서서 '지금 여기가 이 장소'를 누르면 실제 위치와 게임 지도를 맞춥니다.
// 2곳 이상 찍으면 크기·방향까지 맞춰져요. 기록은 이 기기에만 저장되고, 아래 코드를 복사해 개발자에게 보내면 모든 사람에게 반영할 수 있어요.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useContent } from "@/lib/content";
import { loadCalib, saveCalib, metersPerUnit, latLngToMap, type CalibPoint } from "@/lib/geomap";

export default function Calibrate() {
  const { locations } = useContent();
  const [points, setPoints] = useState<CalibPoint[]>([]);
  const [sel, setSel] = useState(locations[0]?.id ?? "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setPoints(loadCalib()); }, []);

  const mark = () => {
    const l = locations.find((x) => x.id === sel); if (!l) return;
    if (!navigator.geolocation) { setMsg("이 기기는 위치 기능을 지원하지 않아요"); return; }
    setBusy(true); setMsg("위치를 정확하게 잡는 중… (5초 정도)");
    const samples: GeolocationCoordinates[] = [];
    const id = navigator.geolocation.watchPosition((p) => { samples.push(p.coords); }, () => { setMsg("위치 권한을 허용해 주세요"); setBusy(false); }, { enableHighAccuracy: true });
    setTimeout(() => {
      navigator.geolocation.clearWatch(id); setBusy(false);
      const good = samples.filter((c) => c.accuracy <= 40);
      if (!good.length) { setMsg("정확도가 낮아요. 하늘이 보이는 곳에서 다시 눌러 주세요"); return; }
      const lat = good.reduce((s, c) => s + c.latitude, 0) / good.length, lng = good.reduce((s, c) => s + c.longitude, 0) / good.length;
      const next = [...points.filter((p) => p.id !== l.id), { id: l.id, mapX: l.mapX, mapY: l.mapY, lat, lng }];
      setPoints(next); saveCalib(next);
      setMsg(`${l.name} 기록 완료 (±${Math.round(Math.min(...good.map((c) => c.accuracy)))}m)`);
    }, 5000);
  };
  const remove = (id: string) => { const next = points.filter((p) => p.id !== id); setPoints(next); saveCalib(next); };

  return (
    <main className="px-4 pt-[max(20px,env(safe-area-inset-top))]">
      <h1 className="font-story text-[28px] text-sumi pr-12">현장 위치 보정</h1>
      <p className="text-sm text-sumi-light mt-1">장소 바로 앞에 서서 아래에서 장소를 고르고 버튼을 눌러 주세요. 서로 멀리 떨어진 2곳 이상(예: 웰컴센터와 강경모던상회)을 찍으면 가장 정확해요.</p>
      <section className="card p-4 mt-3">
        <label className="text-sm font-game font-bold text-sumi">지금 서 있는 장소
          <select value={sel} onChange={(e) => setSel(e.target.value)} className="mt-1 w-full rounded-xl bg-hanji/60 px-3 py-2">
            {locations.map((l) => <option key={l.id} value={l.id}>{l.no}. {l.name}{l.note ? ` (${l.note})` : ""}</option>)}
          </select>
        </label>
        <button className="btn-primary w-full mt-3" disabled={busy} onClick={mark}>{busy ? "위치 잡는 중…" : "지금 여기가 이 장소예요"}</button>
        {msg && <p className="text-sm text-sumi mt-2">{msg}</p>}
      </section>
      <section className="card p-4 mt-3 text-sm">
        <p className="font-game font-bold text-sumi">기록한 장소 {points.length}곳 {points.length >= 2 ? "· 크기·방향까지 맞춤" : points.length === 1 ? "· 위치만 맞춤" : "· 기본 추정값 사용 중"}</p>
        <ul className="mt-2 space-y-1">
          {points.map((p) => { const l = locations.find((x) => x.id === p.id); const m = latLngToMap(p); const err = Math.round(Math.hypot(m.x - p.mapX, m.y - p.mapY) * metersPerUnit());
            return <li key={p.id} className="flex items-center justify-between gap-2"><span>{l?.name} <span className="text-sumi-light">오차 약 {err}m</span></span><button className="text-vermilion text-xs" onClick={() => remove(p.id)}>지우기</button></li>; })}
        </ul>
        {points.length > 0 && (
          <>
            <p className="mt-3 text-xs text-sumi-light">모든 사람에게 반영하려면 아래 코드를 복사해 개발자에게 보내 주세요.</p>
            <textarea readOnly className="mt-1 w-full h-24 rounded-xl bg-hanji/50 p-2 text-[11px] font-mono" value={JSON.stringify(points.map((p) => ({ id: p.id, lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6) })))} onFocus={(e) => e.currentTarget.select()} />
          </>
        )}
      </section>
      <Link href="/explore" className="btn-soft w-full mt-3">지도로 돌아가기</Link>
    </main>
  );
}
