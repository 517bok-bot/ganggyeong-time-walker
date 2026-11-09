"use client";
// NPC 대화: 인사 → 이어지는 말 → 선택지. 대사는 한 장씩 타자기처럼 나오고, 화면을 누르면 다음 장으로.
// 내가 고른 말은 말풍선으로 남아 대화가 이어지는 느낌을 줍니다. 승인 자료(knowledge)를 바탕으로 한 대사는 출처를 함께 보여 줍니다.
import { useEffect, useMemo, useRef, useState } from "react";
import { Ico } from "./art/Icons";
import { NPC, type DialogueChoice } from "@/lib/data/npcs";
import { useContent } from "@/lib/content";
import { useGame } from "@/lib/game";
import { currentChapter, chapterProgress, objectiveLine } from "@/lib/data/story";
import { Sheet } from "./ui";
import { NpcArt } from "./Characters";
import { sfx } from "@/lib/sfx";

function useTypewriter(text: string) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = setInterval(() => setN((x) => { if (x >= text.length) { clearInterval(id); return x; } if (x % 3 === 0) sfx.talk(); return x + 1; }), 24);
    return () => clearInterval(id);
  }, [text]);
  return { shown: text.slice(0, n), done: n >= text.length, skip: () => setN(text.length) };
}

export default function NpcDialog({ npcId, onClose }: { npcId: string | null; onClose: () => void }) {
  const npc = npcId ? NPC[npcId] : null;
  const { state, talkNpc, readKnowledge, act } = useGame();
  const { KD } = useContent();
  const [node, setNode] = useState("greet");
  const [page, setPage] = useState(0);
  const [said, setSaid] = useState<string | null>(null);

  // talkNpc·readKnowledge 는 상태가 바뀔 때마다 새로 만들어지므로 ref 로 보관 (대화가 처음으로 되돌아가지 않게)
  const fns = useRef({ talkNpc, readKnowledge }); fns.current = { talkNpc, readKnowledge };
  useEffect(() => { if (npcId) { setNode("greet"); setPage(0); setSaid(null); fns.current.talkNpc(npcId); } }, [npcId]);

  // 인사 장면: 인사 + 이어지는 말 + (안내형 NPC는) 지금 목표 귀띔
  const greetLines = useMemo(() => {
    if (!npc) return [];
    const lines = [npc.greeting, ...(npc.intro ?? [])];
    if (npc.hints) {
      const cur = currentChapter(state);
      if (cur) lines.push(chapterProgress(cur, state).complete
        ? `참, ${cur.no} 목표를 다 이뤘네요! 지도 위 이야기 띠를 눌러서 이야기를 이어 봐요.`
        : `참, 지금 ‘${objectiveLine(cur, state)}’ 하는 중이죠? ${cur.objectives.find((o) => !o.done(state))?.hint ?? ""}.`);
    }
    return lines;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [npc?.id]);

  const cur = npc && node !== "greet" ? npc.dialogue[node] : null;
  const pages = npc ? (node === "greet" ? greetLines : Array.isArray(cur?.text) ? cur!.text : [cur?.text ?? ""]) : [];
  const text = pages[Math.min(page, pages.length - 1)] ?? "";
  const tw = useTypewriter(text);
  const lastPage = page >= pages.length - 1;

  // 자료를 바탕으로 한 대사는 끝까지 들으면 '읽음' 기록
  useEffect(() => { if (cur?.knowledgeId && lastPage && tw.done) fns.current.readKnowledge(cur.knowledgeId); }, [cur, lastPage, tw.done]);

  if (!npc) return null;
  const choices: DialogueChoice[] = node === "greet" ? [{ label: "이야기를 나누고 싶어요", next: "start" }, { label: "다음에 올게요", action: "close" }] : cur?.choices ?? [];
  const kd = cur?.knowledgeId ? KD[cur.knowledgeId] : null;

  const advance = () => { if (!tw.done) { tw.skip(); return; } if (!lastPage) { sfx.page(); setPage(page + 1); } };
  const choose = (c: DialogueChoice, i: number) => {
    sfx.tap();
    if (c.action === "close") return onClose();
    setSaid(c.label);
    if (c.action === "give-items" && c.items) { act({ type: "npcGift", npcId: npc.id, node, index: i }); setNode("start"); setPage(0); return; }
    if (c.next) { setNode(c.next); setPage(0); }
  };

  return (
    <Sheet open onClose={onClose} label={`${npc.name}와의 대화`}>
      <div className="px-4 pb-5">
        <div className="flex items-end gap-3">
          <div className="w-24 h-28 shrink-0"><NpcArt id={npc.id} look={npc.look} /></div>
          <div className="pb-2 min-w-0">
            <span className="chip bg-teal text-hanji-light">{npc.title}</span>
            <h2 className="font-story text-2xl text-sumi leading-tight">{npc.name}</h2>
          </div>
        </div>

        {said && <div className="flex justify-end mt-2"><p key={said + node} className="max-w-[80%] px-3 py-1.5 rounded-2xl rounded-br-sm bg-vermilion text-white text-sm font-game anim-rise">{said}</p></div>}

        <button className="relative mt-2 w-full text-left rounded-2xl rounded-tl-sm bg-hanji/70 px-4 pt-3 pb-6 min-h-[104px] leading-relaxed text-[16px] text-sumi" onClick={advance} aria-label="다음 대사">
          {kd && page === 0 && <span className="flex items-center gap-1 text-[12px] font-game font-bold text-vermilion mb-1"><Ico name="scroll" size={16} />{kd.title}</span>}
          {tw.shown}{!tw.done && <span className="anim-caret">▍</span>}
          <span className="absolute left-4 bottom-1.5 text-[11px] text-sumi-light/80">{pages.length > 1 ? `${page + 1} / ${pages.length}` : ""}</span>
          {tw.done && !lastPage && <span className="absolute right-4 bottom-1.5 text-vermilion anim-nudge" aria-hidden>▼</span>}
        </button>

        {kd && lastPage && tw.done && (
          <p className="mt-1.5 text-[11px] text-sumi-light leading-snug">
            {kd.caveat && <>※ {kd.caveat} </>}출처: {kd.sources.map((s, i) => s.url
              ? <a key={i} href={s.url} target="_blank" rel="noreferrer" className="underline mr-1.5">{s.label}</a>
              : <span key={i} className="mr-1.5">{s.label}</span>)}
          </p>
        )}

        <div className="mt-3 grid gap-2 min-h-[48px]">
          {lastPage && tw.done && choices.map((c, i) => (
            <button key={c.label} className="btn-soft btn-sm justify-start text-left anim-rise" style={{ animationDelay: `${i * 50}ms` }} onClick={() => choose(c, i)}>
              {c.label}
            </button>
          ))}
          {!(lastPage && tw.done) && <p className="text-center text-xs text-sumi-light">대사 창을 누르면 넘어가요</p>}
        </div>
      </div>
    </Sheet>
  );
}
