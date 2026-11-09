import AdminGate from "./AdminGate";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { LOCATIONS, LOC } from "@/lib/data/locations";
import { CHAR } from "@/lib/data/characters";
import { seedContent } from "./actions";
import SubmitButton from "./SubmitButton";

export const dynamic = "force-dynamic";

async function loadStats() {
  const sb = getServiceSupabase();
  const [stats, visits, finds, content] = await Promise.all([
    sb.from("admin_stats").select("*").single(),
    sb.from("location_visits").select("location_id,method"),
    sb.from("collections").select("item_id").eq("item_type", "character"),
    sb.from("locations").select("id,lat,photo_url,history_status"),
  ]);
  const byLoc: Record<string, number> = {}; (visits.data ?? []).forEach((v) => { byLoc[v.location_id] = (byLoc[v.location_id] ?? 0) + 1; });
  const byChar: Record<string, number> = {}; (finds.data ?? []).forEach((v) => { byChar[v.item_id] = (byChar[v.item_id] ?? 0) + 1; });
  return { stats: stats.data as Record<string, number> | null, byLoc, byChar, content: content.data ?? [] };
}

export default function AdminHome() {
  return (
    <AdminGate title="대시보드">
      {async (ctx) => {
        if (ctx.mode === "dev") return <p className="paper p-4 text-wood">Supabase를 연결하면 이용 통계와 콘텐츠 편집이 활성화됩니다. (README의 “Supabase 연결” 참고)</p>;
        const { stats, byLoc, byChar, content } = await loadStats();
        const coordsDone = content.filter((c) => c.lat != null).length;
        const photosDone = content.filter((c) => c.photo_url).length;
        const historyDone = content.filter((c) => c.history_status === "approved").length;
        const cards = [["가입자", stats?.users], ["방문 인증", stats?.visits], ["QR 인증", stats?.qr_visits], ["GPS 인증", stats?.gps_visits], ["캐릭터 발견", stats?.character_finds], ["완성 젓갈", stats?.jars_done], ["저장 엽서", stats?.postcards]];
        const maxV = Math.max(1, ...Object.values(byLoc));
        return (
          <div className="space-y-3">
            <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {cards.map(([l, v]) => <div key={l as string} className="paper p-3 text-center"><p className="font-game text-2xl text-wood-dark">{(v as number) ?? 0}</p><p className="text-xs text-wood">{l}</p></div>)}
            </section>
            <section className="paper p-4">
              <h2 className="font-game text-lg">콘텐츠 준비 현황</h2>
              <ul className="text-sm text-wood-dark mt-2 space-y-1">
                <li>📍 공식 좌표 등록: {coordsDone}/{LOCATIONS.length} (등록된 장소만 GPS 인증 가능)</li>
                <li>📸 대표 사진: {photosDone}/{LOCATIONS.length}</li>
                <li>📜 승인된 역사 설명: {historyDone}/{LOCATIONS.length}</li>
              </ul>
              <form action={seedContent} className="mt-3 flex items-center gap-2 flex-wrap">
                <SubmitButton>기본 콘텐츠 DB에 등록</SubmitButton>
                <span className="text-xs text-wood">코드의 장소·캐릭터·승인 자료·NPC·퀘스트·레시피를 DB에 넣어요. 이미 있는 항목은 덮어쓰지 않아요.</span>
              </form>
            </section>
            <section className="grid md:grid-cols-2 gap-3">
              <div className="paper p-4">
                <h2 className="font-game text-lg">장소별 방문 인증</h2>
                <ul className="mt-2 space-y-1 text-sm">
                  {LOCATIONS.map((l) => (
                    <li key={l.id} className="flex items-center gap-2">
                      <span className="w-28 truncate">{l.no}. {l.name}</span>
                      <span className="flex-1 h-2 bg-cream-dark rounded-full overflow-hidden"><span className="block h-full bg-sage" style={{ width: `${((byLoc[l.id] ?? 0) / maxV) * 100}%` }} /></span>
                      <span className="w-8 text-right font-game">{byLoc[l.id] ?? 0}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="paper p-4">
                <h2 className="font-game text-lg">캐릭터 발견 수</h2>
                <ul className="mt-2 space-y-1 text-sm">
                  {Object.keys(CHAR).map((id) => <li key={id} className="flex justify-between"><span>{CHAR[id].name}</span><span className="font-game">{byChar[id] ?? 0}</span></li>)}
                </ul>
                <p className="text-xs text-wood mt-3">인기 장소 Top 3: {Object.entries(byLoc).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, n]) => `${LOC[id]?.name}(${n})`).join(", ") || "-"}</p>
              </div>
            </section>
          </div>
        );
      }}
    </AdminGate>
  );
}
