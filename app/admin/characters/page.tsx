import AdminGate from "../AdminGate";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { CHARACTERS } from "@/lib/data/characters";
import type { CharacterRow } from "@/lib/content-merge";
import { updateCharacter } from "../actions";
import SubmitButton from "../SubmitButton";

export const dynamic = "force-dynamic";

export default function AdminCharacters() {
  return (
    <AdminGate title="캐릭터 관리">
      {async (ctx) => {
        const rows: Record<string, CharacterRow> = {};
        if (ctx.mode === "supabase") {
          const { data } = await getServiceSupabase().from("characters").select("id,story,quote,likes,personality,image_url,license_status");
          (data ?? []).forEach((r) => { rows[r.id] = r as CharacterRow; });
        }
        const ro = ctx.mode !== "supabase";
        return (
          <div className="space-y-2">
            <p className="text-sm text-wood">공식 원화를 올리고 사용 허가 상태를 <b>허가 완료</b>로 바꾸면 앱의 임시 그림이 공식 이미지로 바뀌어요.</p>
            {CHARACTERS.map((c) => {
              const r = rows[c.id];
              return (
                <details key={c.id} className="paper p-3">
                  <summary className="cursor-pointer font-game text-wood-dark flex gap-2 items-center flex-wrap">
                    {c.name}
                    <span className={`chip ${r?.license_status === "approved" ? "bg-sage text-cream" : "bg-brick text-cream"}`}>{r?.license_status === "approved" ? "사용 허가 완료" : "허가 필요"}</span>
                    {r?.image_url && <span className="chip bg-cream-dark text-wood">원화 ✓</span>}
                  </summary>
                  <form action={updateCharacter} className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
                    <input type="hidden" name="id" value={c.id} />
                    <fieldset disabled={ro} className="contents">
                      <label>대사 <input name="quote" defaultValue={r?.quote ?? c.quote} className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1" /></label>
                      <label>성격 (쉼표로 구분) <input name="personality" defaultValue={(r?.personality ?? c.personality).join(", ")} className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1" /></label>
                      <label>좋아하는 것 <input name="likes" defaultValue={r?.likes ?? c.likes} className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1" /></label>
                      <label>사용 허가 상태
                        <select name="license_status" defaultValue={r?.license_status ?? "permission_required"} className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1">
                          <option value="permission_required">허가 필요 (임시 그림 사용)</option><option value="approved">허가 완료 (공식 원화 사용)</option>
                        </select>
                      </label>
                      <label className="sm:col-span-2">배경 이야기 <textarea name="story" defaultValue={r?.story ?? c.story} rows={3} className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1" /></label>
                      <label>공식 원화 (투명 PNG 권장) <input type="file" name="image" accept="image/png,image/webp,image/jpeg" className="w-full" /></label>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {r?.image_url && <img src={r.image_url} alt="" className="h-20" />}
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
