import AdminGate from "../AdminGate";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { LOCATIONS, locLabel } from "@/lib/data/locations";
import type { LocationRow } from "@/lib/content-merge";
import { updateLocation } from "../actions";
import SubmitButton from "../SubmitButton";
import CoordFill from "../CoordFill";

export const dynamic = "force-dynamic";

export default function AdminLocations() {
  return (
    <AdminGate title="관광지 관리">
      {async (ctx) => {
        const rows: Record<string, LocationRow> = {};
        if (ctx.mode === "supabase") {
          const { data } = await getServiceSupabase().from("locations").select("id,lat,lng,radius_m,photo_url,description,history,history_status");
          (data ?? []).forEach((r) => { rows[r.id] = r as LocationRow; });
        }
        const ro = ctx.mode !== "supabase";
        return (
          <div className="space-y-2">
            <p className="text-sm text-wood">좌표는 현장에서 ‘현재 위치로 채우기’를 쓰거나 공식 자료의 값을 넣으세요. 역사 설명은 <b>승인</b> 상태일 때만 앱에 공개돼요.</p>
            {LOCATIONS.map((l) => {
              const r = rows[l.id];
              const formId = `loc-${l.id}`;
              return (
                <details key={l.id} className="paper p-3">
                  <summary className="cursor-pointer font-game text-wood-dark flex flex-wrap gap-2 items-center">
                    {l.no}. {locLabel(l)}
                    <span className={`chip ${r?.lat != null ? "bg-sage text-cream" : "bg-cream-dark text-wood"}`}>{r?.lat != null ? "좌표 ✓" : "좌표 없음"}</span>
                    <span className={`chip ${r?.photo_url ? "bg-sage text-cream" : "bg-cream-dark text-wood"}`}>{r?.photo_url ? "사진 ✓" : "사진 없음"}</span>
                    <span className="chip bg-cream-dark text-wood">역사: {r?.history_status ?? "pending"}</span>
                  </summary>
                  <form id={formId} action={updateLocation} className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
                    <input type="hidden" name="id" value={l.id} />
                    <fieldset disabled={ro} className="contents">
                      <label>위도 <input name="lat" defaultValue={r?.lat ?? ""} inputMode="decimal" className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1" /></label>
                      <label>경도 <input name="lng" defaultValue={r?.lng ?? ""} inputMode="decimal" className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1" /></label>
                      <label>인증 반경(m, 10~500) <input name="radius_m" defaultValue={r?.radius_m ?? 40} inputMode="numeric" className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1" /></label>
                      <div className="flex items-end"><CoordFill formId={formId} /></div>
                      <label className="sm:col-span-2">장소 설명 <textarea name="description" defaultValue={r?.description ?? ""} rows={2} className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1" /></label>
                      <label className="sm:col-span-2">역사적 배경 (출처 확인된 내용만) <textarea name="history" defaultValue={r?.history ?? ""} rows={3} className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1" /></label>
                      <label>역사 검토 상태
                        <select name="history_status" defaultValue={r?.history_status ?? "pending"} className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1">
                          <option value="pending">대기 (비공개)</option><option value="review">검토 중 (비공개)</option><option value="approved">승인 (공개)</option>
                        </select>
                      </label>
                      <label>대표 사진 (JPG/PNG/WEBP, 5MB) <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="w-full" /></label>
                      {r?.photo_url && (
                        <div className="sm:col-span-2 flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={r.photo_url} alt="" className="h-20 rounded border-2 border-wood" />
                          <label className="flex items-center gap-1"><input type="checkbox" name="remove_photo" /> 사진 삭제</label>
                        </div>
                      )}
                      <div className="sm:col-span-2"><SubmitButton disabled={ro}>저장</SubmitButton></div>
                    </fieldset>
                  </form>
                </details>
              );
            })}
          </div>
        );
      }}
    </AdminGate>
  );
}
