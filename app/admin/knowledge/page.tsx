import AdminGate from "../AdminGate";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { KNOWLEDGE } from "@/lib/data/knowledge";
import type { KnowledgeRow } from "@/lib/content-merge";
import { upsertKnowledge } from "../actions";
import SubmitButton from "../SubmitButton";

export const dynamic = "force-dynamic";

function DocForm({ d, ro, isNew }: { d: KnowledgeRow; ro: boolean; isNew?: boolean }) {
  return (
    <form action={upsertKnowledge} className="grid gap-2 mt-3 text-sm">
      <fieldset disabled={ro} className="contents">
        {isNew ? <label>ID (영문·숫자·-) <input name="id" required className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1" /></label> : <input type="hidden" name="id" value={d.id} />}
        <label>제목 <input name="title" defaultValue={d.title} required className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1" /></label>
        <label>본문 (NPC가 그대로 읽어요) <textarea name="body" defaultValue={d.body} rows={4} required className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1" /></label>
        <label>유의 사항 <input name="caveat" defaultValue={d.caveat ?? ""} className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1" /></label>
        <label>출처 (한 줄에 하나: 이름 | URL) <textarea name="sources" rows={2} defaultValue={(d.sources ?? []).map((s) => `${s.label} | ${s.url}`).join("\n")} className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1 font-mono text-xs" /></label>
        <label>상태
          <select name="status" defaultValue={d.status} className="w-full rounded-lg border-2 border-wood/50 bg-cream px-2 py-1">
            <option value="draft">초안 (비공개)</option><option value="review">검토 중 (공개 · '검토 중' 표시)</option><option value="approved">승인</option>
          </select>
        </label>
        <div><SubmitButton disabled={ro}>{isNew ? "추가" : "저장"}</SubmitButton></div>
      </fieldset>
    </form>
  );
}

export default function AdminKnowledge() {
  return (
    <AdminGate title="승인 자료 (NPC 지식)">
      {async (ctx) => {
        let rows: KnowledgeRow[] = [];
        if (ctx.mode === "supabase") rows = ((await getServiceSupabase().from("knowledge_documents").select("id,title,body,caveat,sources,status")).data ?? []) as KnowledgeRow[];
        const byId = new Map(rows.map((r) => [r.id, r]));
        const list: KnowledgeRow[] = [
          ...KNOWLEDGE.map((k) => byId.get(k.id) ?? { id: k.id, title: k.title, body: k.body, caveat: k.caveat ?? null, sources: k.sources, status: k.status }),
          ...rows.filter((r) => !KNOWLEDGE.some((k) => k.id === r.id)),
        ];
        const ro = ctx.mode !== "supabase";
        return (
          <div className="space-y-2">
            <p className="text-sm text-wood">NPC는 이 목록의 자료만 말해요. 지자체·문화관광해설사 검토를 마친 자료를 <b>승인</b>으로 바꿔 주세요.</p>
            {list.map((d) => (
              <details key={d.id} className="paper p-3">
                <summary className="cursor-pointer font-game text-wood-dark flex gap-2 items-center flex-wrap">{d.title}<span className={`chip ${d.status === "approved" ? "bg-sage text-cream" : "bg-cream-dark text-wood"}`}>{d.status}</span><span className="text-xs text-wood">{d.id}</span></summary>
                <DocForm d={d} ro={ro} />
              </details>
            ))}
            <details className="paper p-3">
              <summary className="cursor-pointer font-game text-brick">+ 새 자료 추가</summary>
              <DocForm d={{ id: "", title: "", body: "", caveat: null, sources: [], status: "draft" }} ro={ro} isNew />
            </details>
          </div>
        );
      }}
    </AdminGate>
  );
}
