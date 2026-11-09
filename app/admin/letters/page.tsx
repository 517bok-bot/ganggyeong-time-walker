import AdminGate from "../AdminGate";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { moderateLetter } from "../actions";
import SubmitButton from "../SubmitButton";

export const dynamic = "force-dynamic";

type Row = { id: string; body: string; nickname: string | null; is_public: boolean; is_hidden: boolean; report_count: number; created_at: string };

export default function AdminLetters() {
  return (
    <AdminGate title="시간 우체국 편지 검토">
      {async (ctx) => {
        if (ctx.mode !== "supabase") return <p className="paper p-4 text-sumi-light">Supabase 연결 후 신고된 편지를 검토할 수 있어요.</p>;
        const { data } = await getServiceSupabase().from("letters").select("id,body,nickname,is_public,is_hidden,report_count,created_at")
          .or("report_count.gt.0,is_hidden.eq.true").order("report_count", { ascending: false }).limit(100);
        const rows = (data ?? []) as Row[];
        return (
          <div className="space-y-2">
            <p className="text-sm text-sumi-light">신고된 편지와 숨겨진 편지입니다. 신고 3건이면 자동으로 숨겨지고, 여기서 복구하거나 삭제할 수 있어요.</p>
            {rows.length === 0 && <p className="paper p-4">검토할 편지가 없어요.</p>}
            {rows.map((r) => (
              <div key={r.id} className="paper p-4">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="chip bg-vermilion text-hanji-light">신고 {r.report_count}</span>
                  <span className="chip bg-hanji text-sumi">{r.is_hidden ? "숨김" : "노출 중"}</span>
                  <span className="chip bg-hanji text-sumi">{r.is_public ? "공개" : "비공개"}</span>
                  <span className="text-sumi-light">{r.nickname} · {new Date(r.created_at).toLocaleString("ko-KR")}</span>
                </div>
                <p className="mt-2 text-sumi whitespace-pre-wrap">{r.body}</p>
                <div className="flex gap-2 mt-3">
                  {(["hide", "show", "delete"] as const).map((op) => (
                    <form key={op} action={moderateLetter}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="op" value={op} />
                      <SubmitButton>{{ hide: "숨기기", show: "복구(신고 해제)", delete: "삭제" }[op]}</SubmitButton></form>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      }}
    </AdminGate>
  );
}
