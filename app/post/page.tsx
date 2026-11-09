"use client";
// 시간 우체국: 미래의 여행자에게 편지를 남기고, 먼저 다녀간 이들의 편지를 열어 봅니다.
// - 서버 모드: /api/letters (공개·열람 시점·개인정보 필터·신고 3건 자동 숨김)
// - 로컬 모드: 내 편지는 이 기기에만 저장, 다른 사람 편지 자리에는 '예시 편지'를 표시
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useGame } from "@/lib/game";
import { useContent } from "@/lib/content";
import { PageHeader, Modal, DemoBadge } from "@/components/ui";
import { PostOfficeScene, Stamp, Envelope } from "@/components/art/Post";
import { Ico } from "@/components/art/Icons";
import { LETTER_MAX, OPEN_OPTIONS, SAMPLE_LETTERS, letterProblem, type LetterView } from "@/lib/letters";
import { sfx } from "@/lib/sfx";

const LOCAL_KEY = "gtw-letters-v1";
const fmt = (s: string) => new Date(s).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

export default function PostOffice() {
  const { state, mode, act, toast } = useGame();
  const { LOC } = useContent();
  const [body, setBody] = useState("");
  const [open, setOpen] = useState<(typeof OPEN_OPTIONS)[number]["id"]>("now");
  const [isPublic, setIsPublic] = useState(true);
  const visited = Object.keys(state.visits);
  const [stamp, setStamp] = useState<string>("welcome-center");
  const [others, setOthers] = useState<LetterView[]>([]);
  const [mine, setMine] = useState<LetterView[]>([]);
  const [reading, setReading] = useState<LetterView | null>(null);
  const [envOpen, setEnvOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hiddenSamples, setHiddenSamples] = useState<string[]>([]);

  useEffect(() => { if (visited.length && !visited.includes(stamp)) setStamp(visited[0]); }, [visited, stamp]);

  const load = useCallback(async () => {
    if (mode === "remote") {
      const j = await fetch("/api/letters", { cache: "no-store" }).then((r) => r.json()).catch(() => ({}));
      setOthers(j.others ?? []); setMine(j.mine ?? []);
    } else {
      setOthers(SAMPLE_LETTERS);
      try { setMine(JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]")); } catch { setMine([]); }
    }
  }, [mode]);
  useEffect(() => { load(); }, [load]);

  const send = async () => {
    const p = letterProblem(body);
    if (p) { sfx.error(); toast(p, "⚠️"); return; }
    setBusy(true);
    const days = OPEN_OPTIONS.find((o) => o.id === open)!.days;
    if (mode === "remote") {
      const r = await fetch("/api/letters", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body, open, isPublic, stamp, nickname: state.player.name }) })
        .then((x) => x.json()).catch(() => ({ ok: false, error: "서버 연결 실패" }));
      if (!r.ok) { setBusy(false); sfx.error(); toast(r.error, "⚠️"); return; }
    } else {
      const l: LetterView = { id: `local-${Date.now()}`, body: body.trim(), nickname: state.player.name, stamp, isPublic, mine: true,
        openAt: new Date(Date.now() + days * 86400_000).toISOString(), createdAt: new Date().toISOString() };
      const list = [l, ...mine].slice(0, 50);
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); } catch { /* ignore */ }
    }
    await act({ type: "letter" });
    setBody(""); setBusy(false); load();
  };

  const report = async (l: LetterView) => {
    if (!confirm("이 편지를 신고할까요? 신고가 쌓이면 관리자 확인 전까지 숨겨집니다.")) return;
    if (l.sample || mode !== "remote") { setHiddenSamples((h) => [...h, l.id]); setReading(null); toast("신고를 접수했어요 (로컬 모드: 이 기기에서만 숨김)", "ℹ️"); return; }
    await fetch("/api/letters/report", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: l.id }) });
    setReading(null); toast("신고를 접수했어요. 고맙습니다.", "ℹ️"); load();
  };
  const remove = async (l: LetterView) => {
    if (!confirm("이 편지를 지울까요?")) return;
    if (mode === "remote") await fetch(`/api/letters?id=${l.id}`, { method: "DELETE" });
    else { const list = mine.filter((m) => m.id !== l.id); try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); } catch { /* ignore */ } }
    setReading(null); load();
  };
  const openLetter = (l: LetterView) => { setReading(l); setEnvOpen(false); sfx.page(); setTimeout(() => { setEnvOpen(true); sfx.open(); }, 450); };

  const shownOthers = others.filter((o) => !hiddenSamples.includes(o.id));

  return (
    <main className="px-3">
      <PageHeader title="시간 우체국" seal="우편" sub="먼저 다녀간 여행자의 편지를 열고, 다음 여행자에게 한 줄을 남겨요" />
      <div className="border-2 border-sumi-dark p-1.5 bg-teal" style={{ backgroundImage: "var(--woodgrain)" }}><PostOfficeScene /></div>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-5 mt-5">
        {/* 편지 쓰기 */}
        <section className="paper p-5 min-w-0">
          <h2 className="font-story text-2xl text-sumi">미래의 여행자에게</h2>
          <div className="relative mt-3 border border-sumi/60 p-4 pr-24 min-h-[220px]"
            style={{ background: "#F2E7D0", backgroundImage: "repeating-linear-gradient(transparent 0 31px, rgba(150,63,56,.28) 31px 32px), var(--fiber)" }}>
            <textarea value={body} maxLength={LETTER_MAX} onChange={(e) => setBody(e.target.value)} aria-label="편지 내용" rows={6}
              placeholder="오늘 강경에서 본 것, 다음 여행자에게 전하고 싶은 말을 적어 주세요."
              className="w-full bg-transparent resize-none font-story text-lg leading-8 text-sumi placeholder:text-sumi/40 focus:outline-none" />
            <div className="absolute right-3 top-3"><Stamp locId={stamp} label={LOC[stamp]?.name?.slice(0, 5)} size={64} /></div>
            <p className="absolute right-3 bottom-2 text-xs text-sumi-light">{body.length}/{LETTER_MAX}</p>
          </div>
          <p className="text-xs text-sumi-light mt-2">전화번호·이메일·링크 같은 개인정보는 쓸 수 없어요. 부적절한 편지는 신고되면 숨겨집니다.</p>

          <div className="mt-3">
            <p className="font-game font-bold text-sumi text-sm">우표 고르기 <span className="font-body font-normal text-sumi-light">(방문 인증한 장소의 우표)</span></p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar mt-1 pb-1">
              {visited.length === 0 ? <p className="text-sm text-sumi-light">아직 모은 우표가 없어 기본 우표로 부쳐요. <Link className="underline" href="/explore">장소를 방문</Link>하면 우표가 생겨요.</p>
                : visited.map((id) => (
                  <button key={id} onClick={() => setStamp(id)} aria-pressed={stamp === id} className={`shrink-0 p-0.5 ${stamp === id ? "ring-2 ring-vermilion" : ""}`}>
                    <Stamp locId={id} label={LOC[id]?.name?.slice(0, 5)} size={48} />
                  </button>
                ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {OPEN_OPTIONS.map((o) => (
              <button key={o.id} onClick={() => setOpen(o.id)} className={`${open === o.id ? "btn-sage" : "btn-cream"} btn-sm`}><Ico name={o.days ? "hourglass" : "letter"} size={18} />{o.label}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm text-sumi">
            <input type="checkbox" className="w-4 h-4 accent-vermilion" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            다른 여행자가 열어볼 수 있게 공개 (끄면 나만 볼 수 있어요)
          </label>
          <button className="btn-brick w-full mt-4" disabled={busy || body.trim().length < 5} onClick={send}><Ico name="stamp" size={22} />인장을 찍어 부치기</button>
        </section>

        {/* 받은 편지 */}
        <section className="paper p-5 min-w-0">
          <div className="flex items-center gap-2"><h2 className="font-story text-2xl text-sumi">먼저 다녀간 이들의 편지</h2>{mode !== "remote" && <DemoBadge>예시 편지</DemoBadge>}</div>
          {shownOthers.length === 0 ? <p className="text-sm text-sumi-light mt-3">아직 열 수 있는 편지가 없어요. 첫 편지의 주인공이 되어 보세요.</p> : (
            <div className="grid grid-cols-2 gap-4 mt-3">
              {shownOthers.map((l, i) => (
                <button key={l.id} onClick={() => openLetter(l)} className="relative text-left hover:-translate-y-1 transition-transform" style={{ transform: `rotate(${[-2, 1.5, -1, 2][i % 4]}deg)` }}>
                  <Envelope />
                  <span className="absolute right-1.5 top-5 scale-75 origin-top-right"><Stamp locId={l.stamp} size={34} /></span>
                  <span className="block text-xs font-game font-bold text-sumi mt-1 truncate">{l.nickname}</span>
                </button>
              ))}
            </div>
          )}
          {mode !== "remote" && <p className="text-xs text-sumi-light mt-3">로컬 모드에서는 다른 이용자의 편지를 불러올 수 없어 예시 편지를 보여줘요. 로그인하면 실제 여행자들의 공개 편지가 도착해요.</p>}

          <h3 className="font-story text-xl text-sumi mt-6">내가 부친 편지</h3>
          {mine.length === 0 ? <p className="text-sm text-sumi-light mt-1">아직 부친 편지가 없어요.</p> : (
            <ul className="mt-2 space-y-2">
              {mine.map((l) => {
                const sealed = new Date(l.openAt).getTime() > Date.now();
                return (
                  <li key={l.id} className="flex items-center gap-3 border border-sumi/40 bg-hanji p-2" style={{ backgroundImage: "var(--fiber)" }}>
                    <Stamp locId={l.stamp} size={30} />
                    <button className="flex-1 min-w-0 text-left" onClick={() => openLetter(l)}>
                      <span className="block text-sm text-sumi truncate">{l.body}</span>
                      <span className="block text-[11px] text-sumi-light">{sealed ? `${fmt(l.openAt)}에 열림 · 봉인 중` : "열람 가능"} · {l.isPublic ? "공개" : "비공개"}</span>
                    </button>
                    {sealed && <span className="seal w-7 h-7 text-[10px]">봉</span>}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="text-xs text-sumi-light mt-4">모은 우표 {visited.length}장 · 보낸 편지 {state.lettersSent ?? 0}통</p>
        </section>
      </div>

      <Modal open={!!reading} onClose={() => setReading(null)} label="편지 읽기">
        {reading && (
          <div className="p-5">
            <div className="max-w-[260px] mx-auto"><Envelope open={envOpen} /></div>
            {envOpen && (
              <div className="relative -mt-6 mx-1 p-5 border border-sumi/50 anim-unfold"
                style={{ background: "#F2E7D0", backgroundImage: "repeating-linear-gradient(transparent 0 31px, rgba(150,63,56,.25) 31px 32px), var(--fiber)" }}>
                <div className="absolute right-3 top-3"><Stamp locId={reading.stamp} size={44} /></div>
                <p className="font-story text-lg leading-8 text-sumi whitespace-pre-wrap pr-14">{reading.body}</p>
                <p className="text-right font-game font-bold text-sumi mt-3">— {reading.nickname}</p>
                <p className="text-right text-xs text-sumi-light">{reading.sample ? "예시 편지" : fmt(reading.createdAt)}</p>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              {reading.mine ? <button className="btn-cream btn-sm flex-1" onClick={() => remove(reading)}>편지 지우기</button>
                : <button className="btn-cream btn-sm flex-1" onClick={() => report(reading)}><Ico name="warn" size={18} />신고</button>}
              <button className="btn-sage btn-sm flex-1" onClick={() => setReading(null)}>고이 접어 두기</button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
