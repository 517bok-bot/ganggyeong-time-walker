"use client";
// 보상 연출 레이어: 엽전이 튀어 올라 명패(HUD)의 엽전 칸으로 날아가고, +EXP 글씨가 떠오릅니다.
// DOM을 직접 만들고 Web Animations API로 움직여 React 렌더링 비용 없이 부드럽게 동작합니다.
import { useEffect, useRef, useState } from "react";
import { fx, haptic, reducedMotion, type FxEvent } from "@/lib/fx";

const COIN_SVG = `<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="10.5" fill="#E2B85C" stroke="#6b4f25" stroke-width="1.6"/><circle cx="12" cy="12" r="7.6" fill="none" stroke="#F6E6B4" stroke-width="1"/><rect x="9" y="9" width="6" height="6" fill="#6b4f25" rx=".6"/></svg>`;
const SPARK_SVG = (c: string) => `<svg viewBox="0 0 20 20" width="16" height="16"><path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8Z" fill="${c}"/></svg>`;

function targetOf(kind: "coin" | "exp") {
  for (const el of document.querySelectorAll<HTMLElement>(`[data-fx-target="${kind}"]`)) {
    const r = el.getBoundingClientRect();
    if (r.width && r.bottom > 0 && r.top < window.innerHeight) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return { x: window.innerWidth - 40, y: 40 };
}

export default function FxLayer() {
  const root = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState<number | null>(null);

  useEffect(() => fx.on((e: FxEvent) => {
    const host = root.current;
    if (!host) return;
    const calm = reducedMotion();
    const make = (html: string, x: number, y: number) => {
      const d = document.createElement("div");
      d.innerHTML = html;
      d.style.cssText = `position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);will-change:transform,opacity;pointer-events:none`;
      host.appendChild(d);
      return d;
    };

    if (e.type === "levelUp") { setLevel(e.level); haptic([20, 40, 20, 40, 60]); setTimeout(() => setLevel(null), 2600); return; }

    if (e.type === "text") {
      const d = make(`<span style="font:800 18px 'Nanum Myeongjo',serif;color:${e.color ?? "#F2E7D0"};-webkit-text-stroke:4px #39332F;paint-order:stroke;white-space:nowrap">${e.text}</span>`, e.x, e.y);
      d.animate([{ transform: "translate(-50%,-50%) scale(.6)", opacity: 0 }, { transform: "translate(-50%,-120%) scale(1.1)", opacity: 1, offset: .25 }, { transform: "translate(-50%,-260%) scale(1)", opacity: 0 }],
        { duration: calm ? 600 : 1300, easing: "cubic-bezier(.22,1,.36,1)" }).onfinish = () => d.remove();
      return;
    }

    if (e.type === "burst") {
      const n = calm ? 0 : e.count ?? (e.big ? 22 : 12);
      const colors = e.color ? [e.color] : ["#F3D896", "#E2B85C", "#F2E7D0", "#D9806F"];
      // 원형 빛 고리
      const ring = make(`<div style="width:${e.big ? 180 : 90}px;height:${e.big ? 180 : 90}px;border-radius:50%;border:3px solid ${colors[0]};box-shadow:0 0 24px ${colors[0]}"></div>`, e.x, e.y);
      ring.animate([{ transform: "translate(-50%,-50%) scale(.2)", opacity: 1 }, { transform: "translate(-50%,-50%) scale(1.2)", opacity: 0 }], { duration: 650, easing: "cubic-bezier(.22,1,.36,1)" }).onfinish = () => ring.remove();
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * .4;
        const dist = (e.big ? 140 : 70) * (.6 + Math.random() * .6);
        const d = make(SPARK_SVG(colors[i % colors.length]), e.x, e.y);
        d.animate([
          { transform: "translate(-50%,-50%) scale(.4) rotate(0deg)", opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist}px)) scale(1) rotate(${180 + Math.random() * 180}deg)`, opacity: 1, offset: .55 },
          { transform: `translate(calc(-50% + ${Math.cos(a) * dist * 1.15}px), calc(-50% + ${Math.sin(a) * dist * 1.15 + 30}px)) scale(.2) rotate(360deg)`, opacity: 0 },
        ], { duration: 900 + Math.random() * 300, easing: "cubic-bezier(.22,1,.36,1)" }).onfinish = () => d.remove();
      }
      return;
    }

    // reward: 엽전이 튀었다가 HUD로 빨려 들어감 + EXP 글씨
    haptic(14);
    if (e.exp > 0) fx.text(`+${e.exp} EXP`, { x: e.x, y: e.y - 10 }, "#F3D896");
    if (e.coins <= 0 || calm) return;
    const tgt = targetOf("coin");
    const n = Math.min(10, Math.max(3, Math.round(e.coins / 4)));
    for (let i = 0; i < n; i++) {
      const d = make(COIN_SVG, e.x, e.y);
      const ox = (Math.random() - .5) * 140, oy = -40 - Math.random() * 90;
      const delay = i * 45;
      const anim = d.animate([
        { transform: "translate(-50%,-50%) scale(.3)", opacity: 0 },
        { transform: `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px)) scale(1.1) rotate(${ox}deg)`, opacity: 1, offset: .35 },
        { transform: `translate(calc(-50% + ${tgt.x - e.x}px), calc(-50% + ${tgt.y - e.y}px)) scale(.5) rotate(${ox * 3}deg)`, opacity: .9 },
      ], { duration: 950, delay, easing: "cubic-bezier(.5,0,.3,1)", fill: "backwards" });
      anim.onfinish = () => {
        d.remove();
        if (i === n - 1) {
          const t = [...document.querySelectorAll<HTMLElement>('[data-fx-target="coin"]')].find((el) => el.getBoundingClientRect().width > 0);
          t?.animate([{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }], { duration: 320, easing: "cubic-bezier(.34,1.56,.64,1)" });
        }
      };
    }
  }), []);

  return (
    <>
      <div ref={root} className="fixed inset-0 z-[90] pointer-events-none overflow-hidden" aria-hidden />
      {level !== null && (
        <div className="fixed inset-0 z-[85] grid place-items-center pointer-events-none" role="status" aria-label={`레벨 업 ${level}`}>
          <div className="absolute inset-0 fx-levelup-bg" />
          <div className="relative text-center fx-levelup">
            <svg viewBox="-100 -100 200 200" className="absolute left-1/2 top-1/2 w-[340px] h-[340px] -translate-x-1/2 -translate-y-1/2 anim-rays opacity-70" aria-hidden>
              {Array.from({ length: 16 }, (_, i) => <path key={i} d="M-6 -30 L0 -98 L6 -30Z" fill="#F3D896" opacity=".55" transform={`rotate(${i * 22.5})`} />)}
            </svg>
            <p className="relative font-game font-bold tracking-[.5em] text-antique-light text-sm">LEVEL UP</p>
            <div className="relative mx-auto mt-2 seal w-28 h-28 text-4xl rotate-[-6deg]">Lv.{level}</div>
            <p className="relative mt-3 font-story text-2xl text-hanji-light" style={{ textShadow: "0 2px 0 #1A2B2D" }}>시간을 걷는 발걸음이 깊어졌어요</p>
          </div>
        </div>
      )}
    </>
  );
}
