"use client";
import { useEffect, useState } from "react";
import { Ico } from "./art/Icons";
import { useRouter } from "next/navigation";
import { NPC } from "@/lib/data/npcs";
import { useContent } from "@/lib/content";
import { QUEST } from "@/lib/data/quests";
import { useGame } from "@/lib/game";
import { Modal } from "./ui";
import { NpcArt } from "./Characters";
import { sfx } from "@/lib/sfx";

function useTypewriter(text: string) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = setInterval(() => setN((x) => { if (x >= text.length) { clearInterval(id); return x; } if (x % 3 === 0) sfx.talk(); return x + 1; }), 22);
    return () => clearInterval(id);
  }, [text]);
  return { shown: text.slice(0, n), done: n >= text.length, skip: () => setN(text.length) };
}

export default function NpcDialog({ npcId, onClose }: { npcId: string | null; onClose: () => void }) {
  const npc = npcId ? NPC[npcId] : null;
  const router = useRouter();
  const { talkNpc, readKnowledge, act, toast } = useGame();
  const { KD } = useContent();
  const [node, setNode] = useState<string>("greet");
  const [kd, setKd] = useState<string | null>(null);

  useEffect(() => { if (npcId) { setNode("greet"); setKd(null); talkNpc(npcId); } }, [npcId, talkNpc]);

  const text = !npc ? "" : kd ? KD[kd].body : node === "greet" ? npc.greeting : npc.dialogue[node]?.text ?? "";
  const tw = useTypewriter(text);
  if (!npc) return null;

  const choices = kd || node === "greet"
    ? [{ label: kd ? "다른 이야기도 들려주세요" : "▶ 계속", next: "start" }]
    : npc.dialogue[node].choices;

  return (
    <Modal open onClose={onClose} label={`${npc.name}와의 대화`}>
      <div className="p-4">
        <div className="flex items-end gap-3">
          <div className="w-24 h-24 shrink-0 rounded-2xl bg-gold/40 border-2 border-wood p-1 anim-squish"><NpcArt look={npc.look} /></div>
          <div>
            <span className="chip bg-sage text-cream">{npc.title}</span>
            <h2 className="font-story font-bold text-2xl text-wood-dark">{npc.name}</h2>
            <p className="text-[11px] text-wood/80">게임 창작 NPC</p>
          </div>
        </div>
        <button className="mt-3 w-full text-left rounded-xl bg-cream border-2 border-wood/60 p-3 min-h-[96px] leading-relaxed" onClick={tw.skip}>
          {kd && <p className="font-game font-bold text-vermilion mb-1 flex items-center gap-1"><Ico name="scroll" size={18} />{KD[kd].title}</p>}
          {tw.shown}{!tw.done && <span className="animate-pulse">▍</span>}
        </button>
        {kd && tw.done && (
          <div className="mt-2 text-xs text-wood space-y-1">
            {KD[kd].caveat && <p>※ {KD[kd].caveat}</p>}
            <p>출처: {KD[kd].sources.map((s, i) => s.url
              ? <a key={i} href={s.url} target="_blank" rel="noreferrer" className="underline mr-2">{s.label}</a>
              : <span key={i} className="mr-2">{s.label}</span>)}</p>
            <p className="opacity-70">자료 상태: {KD[kd].status === "approved" ? "승인" : "검토 중 (지자체·해설사 최종 확인 전)"}</p>
          </div>
        )}
        <div className="mt-3 grid gap-2">
          {tw.done && choices.map((c, i) => (
            <button key={i} className="btn-cream btn-sm justify-start text-left anim-rise" style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => {
                sfx.tap();
                const ch = c as typeof c & { knowledgeId?: string; action?: string; questId?: string; items?: Record<string, number> };
                if (ch.knowledgeId) { setKd(ch.knowledgeId); readKnowledge(ch.knowledgeId); return; }
                setKd(null);
                if (ch.action === "close") return onClose();
                if (ch.action === "give-quest" && ch.questId) { toast(`퀘스트 수락: ${QUEST[ch.questId].title}`, "📜"); router.push("/quests"); return onClose(); }
                if (ch.action === "give-items" && ch.items) {
                  act({ type: "npcGift", npcId: npc.id, node, index: i }); // 선물 내용·1회 제한은 엔진이 판단
                  setNode("start"); return;
                }
                if (ch.action === "open-jeotgal") { router.push("/jeotgal"); return onClose(); }
                if (ch.next) setNode(ch.next);
              }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
