"use client";
import { useState } from "react";
import { Ico } from "@/components/art/Icons";
import Link from "next/link";
import { useGame } from "@/lib/game";
import { QUESTS, QUIZ, questProgress, type QuestType } from "@/lib/data/quests";
import { ITEMS } from "@/lib/data/jeotgal";
import { useContent } from "@/lib/content";
import { CAT_FAMILY } from "@/lib/data/characters";
import { PageHeader, Hud, Modal } from "@/components/ui";
import { CharacterArt } from "@/components/Characters";
import { sfx } from "@/lib/sfx";

const TYPE_LABEL: Record<QuestType, string> = { story: "스토리", collect: "수집", visit: "방문", npc: "NPC", quiz: "퀴즈", craft: "제작", online: "온라인", daily: "일일", style: "꾸미기", picnic: "소풍" };
const GO: Partial<Record<QuestType, string>> = { story: "/explore", collect: "/explore", visit: "/explore", npc: "/village", craft: "/jeotgal", online: "/village", style: "/wardrobe", picnic: "/picnic" };

export default function Quests() {
  const { state, claimQuest, answerQuiz } = useGame();
  const { KD } = useContent();
  const [filter, setFilter] = useState<"all" | "doing" | "done">("all");
  const [quiz, setQuiz] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  const list = QUESTS.filter((q) => {
    const p = questProgress(q, state);
    return filter === "all" ? true : filter === "done" ? p.claimed : !p.claimed;
  });

  return (
    <main className="px-3">
      <PageHeader title="여정" seal="여정" sub="강경 곳곳의 이야기를 따라 걷는 퀘스트" />
      <Hud />
      <div className="flex gap-2 mt-3">
        {([["all", "전체"], ["doing", "진행 중"], ["done", "완료"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`btn btn-sm flex-1 ${filter === k ? "bg-sage text-cream" : "bg-cream-light text-wood-dark"}`}>{l}</button>
        ))}
      </div>

      <ul className="mt-3 space-y-3">
        {list.map((q) => {
          const p = questProgress(q, state);
          return (
            <li key={q.id} className={`paper p-4 ${q.featured ? "!border-brick !border-[3px]" : ""}`}>
              <div className="flex items-start gap-3">
                {q.featured ? (
                  <div className="flex -space-x-3 shrink-0">
                    {CAT_FAMILY.map((c) => <div key={c} className="w-11 h-12"><CharacterArt id={c} silhouette={!state.characters[c]} className="w-full h-full" /></div>)}
                  </div>
                ) : <Ico name={p.claimed ? "check" : p.complete ? "gift" : "scroll"} size={40} />}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1">
                    <span className="chip bg-wood text-cream">{TYPE_LABEL[q.type]}</span>
                    <span className="chip bg-cream-dark text-wood-dark">난이도 {"★".repeat(q.difficulty)}</span>
                    {q.featured && <span className="chip bg-brick text-cream">대표 퀘스트</span>}
                  </div>
                  <h2 className="font-game text-xl text-wood-dark mt-1">{q.title}</h2>
                  <p className="text-sm text-wood">{q.desc}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1">
                {q.steps.map((st, i) => {
                  const d = st.done(state);
                  return <li key={i} className={`flex items-center gap-2 text-sm ${d ? "text-sage" : "text-wood"}`}><span className={`w-5 h-5 rounded-full grid place-items-center text-xs border-2 ${d ? "bg-sage border-sage text-cream" : "border-wood/40"}`}>{d ? "✓" : i + 1}</span>{st.label}</li>;
                })}
              </ul>
              <div className="h-2 bg-cream-dark rounded-full overflow-hidden mt-3"><div className="h-full bg-sage transition-all" style={{ width: `${(p.done / p.total) * 100}%` }} /></div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <p className="text-xs font-game text-wood-dark flex-1">
                  보상: {q.reward.exp}EXP · 엽전 {q.reward.coins}
                  {q.reward.items && Object.entries(q.reward.items).map(([k, v]) => ` · ${ITEMS[k].name}×${v}`)}
                  {q.reward.badge && ` · 배지 「${q.reward.badge}」`}
                </p>
                {p.claimed ? <span className="chip bg-sage text-cream">보상 수령 완료</span>
                  : p.complete ? <button className="btn-brick btn-sm animate-pulse" onClick={async () => { if ((await claimQuest(q.id)).ok) sfx.success(); }}><Ico name="gift" size={20} />보상 받기</button>
                    : q.type === "quiz" ? <button className="btn-gold btn-sm" onClick={() => { setPicked(null); setQuiz(QUIZ.findIndex((z) => !state.quizCorrect.includes(z.id))); }}>퀴즈 풀기</button>
                      : GO[q.type] && <Link href={GO[q.type]!} className="btn-sage btn-sm">바로 가기</Link>}
              </div>
            </li>
          );
        })}
      </ul>

      <Modal open={quiz !== null} onClose={() => setQuiz(null)} label="역사 퀴즈">
        {quiz !== null && (quiz < 0 ? (
          <div className="p-5 text-center"><p className="font-game text-xl">모든 퀴즈를 맞혔어요!</p><button className="btn-sage w-full mt-3" onClick={() => setQuiz(null)}>닫기</button></div>
        ) : (() => {
          const z = QUIZ[quiz];
          return (
            <div className="p-5">
              <p className="chip bg-brick text-cream">강경 역사 퀴즈 {quiz + 1}/{QUIZ.length}</p>
              <h2 className="font-story font-bold text-xl text-wood-dark mt-2">{z.q}</h2>
              <div className="grid gap-2 mt-3">
                {z.options.map((o, i) => {
                  const state2 = picked === null ? "" : i === z.answer ? "!bg-sage !text-cream" : picked === i ? "!bg-brick !text-cream" : "opacity-60";
                  return <button key={i} disabled={picked !== null} className={`btn-cream btn-sm justify-start ${state2}`}
                    onClick={() => { setPicked(i); const ok = i === z.answer; ok ? sfx.success() : sfx.error(); answerQuiz(z.id, i); }}>{o}</button>;
                })}
              </div>
              {picked !== null && (
                <div className="mt-3 text-sm rounded-xl bg-cream p-3 anim-rise">
                  <p className="font-game">{picked === z.answer ? "정답이에요! +20EXP" : "아쉬워요!"}</p>
                  <p className="text-wood mt-1">{KD[z.knowledgeId].body}</p>
                  <button className="btn-sage btn-sm w-full mt-3" onClick={() => {
                    const solved = (id: string) => state.quizCorrect.includes(id) || (id === z.id && picked === z.answer);
                    const next = QUIZ.findIndex((x, i) => i > quiz && !solved(x.id));
                    setPicked(null); setQuiz(next >= 0 ? next : QUIZ.findIndex((x) => !solved(x.id)));
                  }}>다음 문제</button>
                </div>
              )}
            </div>
          );
        })())}
      </Modal>
    </main>
  );
}
