"use client";
// 실제 시간(한국 시간)에 맞춰 게임 속 강경의 하루가 흘러갑니다.
// 새벽 05:00 · 낮 07:00 · 해 질 녘 17:00 · 밤 19:30. 바뀌기 40분 전부터 다음 그림이 서서히 겹쳐집니다.
import { useEffect, useState } from "react";

export type Phase = "dawn" | "day" | "dusk" | "night";
const STARTS: [Phase, number][] = [["dawn", 5 * 60], ["day", 7 * 60], ["dusk", 17 * 60], ["night", 19 * 60 + 30]];
const BLEND = 40;
export const PHASE_LABEL: Record<Phase, string> = { dawn: "새벽", day: "낮", dusk: "해 질 녘", night: "밤" };
export const PHASE_BG: Record<Phase, string> = { dawn: "#B6BFA0", day: "#BFD58F", dusk: "#9C8E6E", night: "#2E3A3A" };

export interface Daytime { phase: Phase; next: Phase; t: number; clock: string; minutes: number }

export function daytimeAt(ms: number): Daytime {
  const d = new Date(ms + 9 * 3600_000);
  const m = d.getUTCHours() * 60 + d.getUTCMinutes();
  let idx = STARTS.length - 1;
  for (let i = 0; i < STARTS.length; i++) if (m >= STARTS[i][1]) idx = i;
  const phase = STARTS[idx][0];
  const nextIdx = (idx + 1) % STARTS.length;
  const next = STARTS[nextIdx][0];
  let until = STARTS[nextIdx][1] - m; if (until <= 0) until += 24 * 60;
  const t = until < BLEND ? 1 - until / BLEND : 0;
  return { phase, next, t, minutes: m, clock: `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}` };
}

/** 30초마다 다시 계산. ?time=21:30 처럼 주소에 붙이면 그 시각으로 미리 볼 수 있어요(발표·시연용). */
export function useDaytime(): Daytime {
  const [dt, setDt] = useState<Daytime>({ phase: "day", next: "dusk", t: 0, clock: "12:00", minutes: 720 });
  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("time") ?? sessionStorage.getItem("gtw-time-preview");
    const calc = () => {
      if (preview && /^\d{1,2}:\d{2}$/.test(preview)) {
        sessionStorage.setItem("gtw-time-preview", preview);
        const [h, mm] = preview.split(":").map(Number);
        const base = new Date(); const utc = Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), h - 9, mm);
        return daytimeAt(utc);
      }
      return daytimeAt(Date.now());
    };
    setDt(calc());
    const id = setInterval(() => setDt(calc()), 30_000);
    return () => clearInterval(id);
  }, []);
  return dt;
}
